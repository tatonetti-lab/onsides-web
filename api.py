from flask import Blueprint, request, jsonify, send_file
import MySQLdb

creds = {}
with open('/var/www/onsides.tatonettilab.org/sql.conf', 'r') as file:
    content = file.readlines()
    for line in content:
        key, value = line.split("=")
        creds[key.strip()] = value.strip()


#print(creds["MYSQL_HOST"], creds["MYSQL_USER"], creds["MYSQL_PASSWORD"], creds["MYSQL_DB"], int(creds["MYSQL_PORT"]));

mysql = MySQLdb.connect(
    host=creds["MYSQL_HOST"],
    user=creds["MYSQL_USER"],
    password=creds["MYSQL_PASSWORD"],
    db=creds["MYSQL_DB"],
    port=int(creds["MYSQL_PORT"]),
    connect_timeout=100,
)

api = Blueprint('api', __name__,
                template_folder='./frontend/build',
                static_folder='./frontend/build')

# returns list of all drug names and id sorted by name alphabetically
@api.route("/api/drugs")
def get_all_drugs():
 
    cursor = mysql.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        "SELECT DISTINCT ingredient_concept_name, ingredient_concept_id FROM ingredients ORDER BY ingredient_concept_name")

    drugs = cursor.fetchall()

    return {
        "drugs": drugs
    }

# returns list of all adverse reactions name and id sorted by name alphabetically
@api.route("/api/adversereactions")
def get_all_adverseReactions():
  
    cursor = mysql.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        "SELECT DISTINCT concept_name, meddra_id FROM adverse_reactions ORDER BY concept_name")

    adverse_reactions = cursor.fetchall()

    return {
        "adverse_reactions": adverse_reactions
    }

# returns lists of drugs and adverse reactions, both with name and id
@api.route("/api/query/<keyword>")
def query_keyword(keyword):
 
    cursor = mysql.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT DISTINCT ingredient_concept_name, ingredient_concept_id FROM ingredients WHERE ingredient_concept_name LIKE %s ORDER BY ingredient_concept_name", ("%" + keyword + "%",))

    drugs = cursor.fetchall()

    cursor.execute(
        "SELECT DISTINCT concept_name, meddra_id FROM adverse_reactions WHERE concept_name LIKE %s ORDER BY concept_name", ("%" + keyword + "%",))

    adverse_reactions = cursor.fetchall()

    return {
        "drugs": drugs,
        "adverse_reactions": adverse_reactions
    }

# returns adverse reaction name and list of drugs associated with it
@api.route("/api/adversereactions/<meddraID>")
def getDrugsByAdverseReaction(meddraID):

    cursor = mysql.cursor(MySQLdb.cursors.DictCursor)

    # get adverse reaction name
    cursor.execute(
        "SELECT concept_name, meddra_id from adverse_reactions WHERE meddra_id =  %s LIMIT 1", (meddraID,))

    adverse_reaction = cursor.fetchall()

    # if no adverse reaction found return
    if (len(adverse_reaction) == 0):
        return {
            "adverse_reaction": [{"concept_name": None}]
        }

    cursor.execute(
        "SELECT ingredients, drug_concept_ids FROM adverse_reactions WHERE meddra_id = %s ORDER BY ingredients", (meddraID,))

    drugs = cursor.fetchall()

    return {
        "drugs": drugs,
        "adverse_reaction": adverse_reaction
    }


# returns drug name, list of unique drug labels, list of adverse reactions and drug labels associated with it
@api.route("/api/drugs/<drugID>")
def getDrugInfo(drugID):
    cursor = mysql.cursor(MySQLdb.cursors.DictCursor)

    # get drug name
    cursor.execute(
        "SELECT ingredient_concept_name FROM ingredients WHERE ingredient_concept_id = %s LIMIT 1", 
        (drugID,)
    )
    drug_name_result = cursor.fetchall()

    # if no drug exists return
    if (len(drug_name_result) == 0):
        return {
            "drug_name": None,
            "drug_info": None
        }

    drug_name = drug_name_result[0]["ingredient_concept_name"]

    cursor.execute(
        "SELECT xml_id, concept_name, meddra_id, ingredients, drug_concept_ids FROM adverse_reactions WHERE drug_concept_ids LIKE %s", 
        ("%" + drugID + "%",)
    )

    drug_info_result = cursor.fetchall()

    #print(drug_info_result)

    drug_info = {}
    labels_set = set()
    kit_labels_set = set()
    drug_labels = []


    #iterate result to get drug product rx label and create dict of adverse reactions
    for drug_product in drug_info_result:
        
        xml_id = drug_product["xml_id"]
        
        if (xml_id in kit_labels_set):
            continue

        if (xml_id not in labels_set):

            cursor.execute("""
                SELECT rx.rx_string
                FROM label_map lm
                JOIN rxnorm_map rx ON lm.set_id = rx.set_id and lm.xml_id = %s and rx.rx_tty = 'PSN'
                """, (xml_id,)
            )

            label_result = cursor.fetchall()


            # if > 1 it's a kit and do not include
            # if == 0 label not found
            if (len(label_result) > 1):
                kit_labels_set.add(xml_id)
                continue
            elif (len(label_result) == 0):
                label_result = [{"rx_string": "Label N/A"}]

            labels_set.add( xml_id )

            drug_labels.append( {
                "xml_id": xml_id,
                "desc": label_result[0]["rx_string"]
            })

        adverse_reaction = drug_product["concept_name"]
        ingredients = drug_product["ingredients"]

        if (adverse_reaction in drug_info):
            drug_info[adverse_reaction]["ingredients"].append( ingredients )
            drug_info[adverse_reaction]["xml_id"].append( xml_id )

        else:
            drug_info[adverse_reaction] = drug_product
            drug_info[adverse_reaction]["xml_id"] = [ xml_id ]
            drug_info[adverse_reaction]["ingredients"] = [ ingredients ]


    # get stats on how many labels of drug, adverse reaction relates to
    for adverse_reaction in drug_info:
        item_label_total = len(drug_info[adverse_reaction]["xml_id"])
        drug_info[adverse_reaction]["percent"] = round(item_label_total * 100 / len(drug_labels), 2)


    drug_info = list(drug_info.values())

    return {
        "drug_info": drug_info,
        "drug_name": drug_name,
        "drug_labels": drug_labels
    }


# stats
@api.route("/api/stats")
def getStats():

    cursor = mysql.cursor()

    # total drugs
    cursor.execute(
        "SELECT COUNT( DISTINCT ingredient_concept_name ) FROM ingredients")
    num_drugs = cursor.fetchall()


    
    # total adv reactions
    cursor.execute(
        "SELECT COUNT( DISTINCT concept_name ) FROM adverse_reactions")
    num_adverse_reactions = cursor.fetchall()

    # total drugs/adv reactions pairs
    cursor.execute("SELECT COUNT( * ) FROM adverse_reactions")
    num_pairs = cursor.fetchall()

    print(num_adverse_reactions, num_pairs, num_drugs)

    return {
        "drugs": num_drugs,
        "adverse_reactions": num_adverse_reactions,
        "pairs": num_pairs
    }


