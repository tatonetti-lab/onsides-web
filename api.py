from flask import Blueprint, request, jsonify, send_file
import MySQLdb

creds = {}
with open('/var/www/onsides.tatonettilab.org/sql.conf', 'r') as file:
    content = file.readlines()
    for line in content:
        key, value = line.split("=")
        creds[key.strip()] = value.strip()


def create_connection():
    return MySQLdb.connect(
        host=creds["MYSQL_HOST"],
        user=creds["MYSQL_USER"],
        password=creds["MYSQL_PASSWORD"],
        db=creds["MYSQL_DB"],
        connect_timeout=100,
        cursorclass=MySQLdb.cursors.DictCursor,
    )

api = Blueprint('api', __name__,
                template_folder='./frontend/build',
                static_folder='./frontend/build')

# returns list of all drug names and id sorted by name alphabetically
@api.route("/api/drugs")
def get_all_drugs():
 
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        "SELECT ingredient_name as name, ingredient_rx_cui as id FROM ingredients_only ORDER BY ingredient_name")

    drugs = cursor.fetchall()

    con.close()

    return {
        "drugs": drugs
    }

# returns list of all adverse reactions name and id sorted by name alphabetically
@api.route("/api/adversereactions")
def get_all_adverseReactions():

    con = create_connection() 
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT distinct pt_meddra_term as term, pt_meddra_id as id FROM adverse_reactions_only
        ORDER BY pt_meddra_term
    """)

    adverse_reactions = cursor.fetchall()

    con.close()

    return {
        "adverse_reactions": adverse_reactions
    }

# returns lists of drugs and adverse reactions, both with name and id
@api.route("/api/query/<keyword>")
def query_keyword(keyword):

    con = create_connection()
    cursor = con.cursor()

    cursor.execute("SELECT ingredient_name as name, ingredient_rx_cui as id FROM ingredients_only WHERE ingredient_name LIKE %s ORDER BY ingredient_name", ("%" + keyword + "%",))

    drugs = cursor.fetchall()

    cursor.execute(
        """
        SELECT distinct pt_meddra_term as name, pt_meddra_id as id FROM adverse_reactions_only WHERE pt_meddra_term LIKE %s 
        ORDER BY pt_meddra_term""", ("%" + keyword + "%",))

    adverse_reactions = cursor.fetchall()

    con.close()

    return {
        "drugs": drugs,
        "adverse_reactions": adverse_reactions
    }

# returns adverse reaction name and list of drugs associated with it
@api.route("/api/adversereactions/<meddraID>")
def getDrugsByAdverseReaction(meddraID):

    con = create_connection()
    cursor = con.cursor()

    # get adverse reaction name
    cursor.execute(
        "SELECT distinct pt_meddra_term as name, pt_meddra_id as id from adverse_reactions_only WHERE pt_meddra_id =  %s", (meddraID,))

    adverse_reaction = cursor.fetchall()

    # if no adverse reaction found return
    if (len(adverse_reaction) == 0):
        return {
            "adverse_reaction": [{"name": None}]
        }

    cursor.execute(
        """
        select distinct ingredient_name as name, ingredient_rx_cui as id 
        from ingredients where set_id in 
            (select distinct set_id from adverse_reactions_all_labels where pt_meddra_id = %s ) 
        or set_id in 
            (select distinct set_id from boxed_warnings_all_labels where pt_meddra_id = %s)
        order by ingredient_name
        """, (meddraID, meddraID,))

    drugs = cursor.fetchall()

    con.close()

    return {
        "drugs": drugs,
        "adverse_reaction": adverse_reaction
    }


@api.route("/api/drugs/<drugID>")
def getDrugInfo(drugID):
    con = create_connection()
    cursor = con.cursor()

    # get drug name and all of its xml_ids
    '''
    cursor.execute(
        """
        SELECT ingredient_concept_name, ingredients.xml_id, zip_id, set_id 
        FROM ingredients 
        LEFT JOIN label_map ON ingredients.xml_id = label_map.xml_id 
        WHERE ingredient_concept_id = %s 
        ORDER BY zip_id DESC
        """, 
        (drugID,)
    )
    '''

    cursor.execute(
        """
        select ingredient_name as name, ingredient_rx_cui as id 
        FROM ingredients_only  
        WHERE ingredient_rx_cui=%s""",
        (drugID,)
    )

    drug_result = cursor.fetchall()

    # if no drug exists return
    if (len(drug_result) == 0):
        return {
            "drug_name": None,
            "drug_info": None,
            "drug_labels": [],
        }

    drug_name = drug_result[0]["name"]

    cursor.execute(
        """
        select setid 
        from rxnorm_mappings 
        where setid in 
        (
            select set_id 
            from ingredients 
            where ingredient_rx_cui=%s
        ) 
        and rxtty='PSN' 
        group by setid 
        having count(setid)=1;
        """,
        (drugID,)
    )

    
    set_ids_result = cursor.fetchall()

    set_ids_arr = [item["setid"] for item in set_ids_result]

    if (len(set_ids_arr) == 0):
        return {
            "drug_name": drug_name,
            "drug_info": [],
            "drug_labels": [],
        }

    cursor.execute("""
            SELECT rxstring, rxnorm_mappings.spl_version, rxnorm_mappings.setid, upload_date as date 
            FROM rxnorm_mappings 
            left join dm_spl_zip_files_meta_data meta on meta.setid = rxnorm_mappings.setid
            WHERE rxtty = 'PSN' AND rxnorm_mappings.setid in %s 
            ORDER BY zip_file_name desc
        """, (set_ids_arr,))
    
    labels_result = cursor.fetchall()

    drug_info_by_adverse_reaction = {}

    drug_labels = []

    for label in labels_result:

        set_id = label["setid"]

        cursor.execute(
            """
            SELECT pt_meddra_id as id, pt_meddra_term as term
            from adverse_reactions_all_labels
            where set_id = %s
            """,
            (set_id,)
        )

        ar_result = cursor.fetchall()

        cursor.execute(
            """
            SELECT pt_meddra_id as id, pt_meddra_term as term
            from boxed_warnings_all_labels
            where set_id = %s
            """,
            (set_id,)
        )

        boxed_result = cursor.fetchall()

        if (( len(boxed_result) == 0 ) and ( len(ar_result) == 0 )):
            continue

        drug_labels.append( label )

        for ar in ar_result:
            ar_id = ar["id"]
            if (ar_id in drug_info_by_adverse_reaction):
                drug_info_by_adverse_reaction[ar_id]["set_ids"].append( set_id )
            else:
                drug_info_by_adverse_reaction[ar_id] = ar
                drug_info_by_adverse_reaction[ar_id]["set_ids"] = [ set_id ]

        for ar in boxed_result:
            ar_id = ar["id"]
            if (ar_id in drug_info_by_adverse_reaction):
                drug_info_by_adverse_reaction[ar_id]["set_ids"].append( set_id )
            else:
                drug_info_by_adverse_reaction[ar_id] = ar
                drug_info_by_adverse_reaction[ar_id]["boxed"] = True
                drug_info_by_adverse_reaction[ar_id]["set_ids"] = [ set_id ]
        

        rxstring_arr = label["rxstring"].split(" ")
        # format string
        for i, word in enumerate(rxstring_arr):
            if (len(word) > 4 ):
                rxstring_arr[i] = word.title()

        
        label["rxstring"] = " ".join(rxstring_arr)
    

    # get stats
    num_total_labels = len( drug_labels )

    for adverse_reaction in drug_info_by_adverse_reaction:
        num_advr_labels = len( drug_info_by_adverse_reaction[adverse_reaction]["set_ids"] )
        percent = round(num_advr_labels * 100 / num_total_labels, 2)

        drug_info_by_adverse_reaction[adverse_reaction]["percent"] = percent
    

    drug_info_by_adverse_reaction = list( drug_info_by_adverse_reaction.values() )

    return {
        "drug_info": drug_info_by_adverse_reaction,
        "drug_name": drug_name,
        "drug_labels": drug_labels
    }

        
# stats
@api.route("/api/stats")
def getStats():

    con = create_connection()
    cursor = con.cursor()

    # total drugs
    cursor.execute(
        "SELECT COUNT( ingredient_rx_cui ) as num FROM ingredients_only")
    num_drugs = cursor.fetchall()


    
    # total adv reactions
    cursor.execute(
        "SELECT COUNT( pt_meddra_id ) as num FROM adverse_reactions_only")
    num_adverse_reactions = cursor.fetchall()


    # total drugs/adv reactions pairs
    cursor.execute("SELECT COUNT( * ) as num FROM adverse_reactions_all_labels")
    num_adv_pairs = cursor.fetchall()

    cursor.execute("SELECT COUNT( * ) as num FROM boxed_warnings_all_labels")
    num_box_pairs = cursor.fetchall()

    con.close()

    return {
        "drugs": num_drugs[0]["num"],
        "adverse_reactions": num_adverse_reactions[0]["num"],
        "pairs": num_adv_pairs[0]["num"] + num_box_pairs[0]["num"],
    }


