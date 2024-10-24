import sqlite3

from flask import Blueprint


def create_connection():
    return sqlite3.connect("database.db")


api = Blueprint(
    "api",
    __name__,
    template_folder="./frontend/build",
    static_folder="./frontend/build",
)


# returns list of all drug names and id sorted by name alphabetically
@api.route("/api/drugs")
def get_all_drugs():
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT concept_name AS ingredient_concept_name,
               concept_id AS ingredient_concept_id
        FROM ingredientpublic
        """
    )
    drugs = cursor.fetchall()
    con.close()
    return {"drugs": drugs}


# returns list of all adverse reactions name and id sorted by name alphabetically
@api.route("/api/adversereactions")
def get_all_adverseReactions():
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT meddra_name AS concept_name, meddra_id
        FROM adversereactionspublic
        """
    )
    adverse_reactions = cursor.fetchall()
    con.close()
    return {"adverse_reactions": adverse_reactions}


# returns lists of drugs and adverse reactions, both with name and id
@api.route("/api/query/<keyword>")
def query_keyword(keyword):
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT concept_name AS ingredient_concept_name,
               concept_id AS ingredient_concept_id
        FROM ingredientspublic
        WHERE concept_name LIKE %s
        """,
        ("%" + keyword + "%",),
    )
    drugs = cursor.fetchall()
    cursor.execute(
        """
        SELECT meddra_name AS concept_name, meddra_id
        FROM adversereactionspublic
        WHERE meddra_name LIKE %s
        """,
        ("%" + keyword + "%",),
    )
    adverse_reactions = cursor.fetchall()
    con.close()
    return {"drugs": drugs, "adverse_reactions": adverse_reactions}


# returns adverse reaction name and list of drugs associated with it
@api.route("/api/adversereactions/<meddraID>")
def getDrugsByAdverseReaction(meddraID):
    con = create_connection()
    cursor = con.cursor()
    # get adverse reaction name
    cursor.execute(
        """
        SELECT concept_name, meddra_id
        FROM adverse_reactions
        WHERE meddra_id =  %s
        LIMIT 1
        """,
        (meddraID,),
    )
    adverse_reaction = cursor.fetchall()
    # if no adverse reaction found return
    if len(adverse_reaction) == 0:
        return {"adverse_reaction": [{"concept_name": None}]}

    cursor.execute(
        """
        SELECT ingredients, drug_concept_ids
        FROM adverse_reactions
        WHERE meddra_id = %s
        ORDER BY ingredients
        """,
        (meddraID,),
    )
    drugs = cursor.fetchall()
    con.close()
    return {"drugs": drugs, "adverse_reaction": adverse_reaction}


@api.route("/api/drugs/<drugID>")
def getDrugInfo(drugID):
    con = create_connection()
    cursor = con.cursor()
    # get drug name and all of its xml_ids
    cursor.execute(
        """
        SELECT ingredient_concept_name, ingredients.xml_id, zip_id, set_id
        FROM ingredients
        LEFT JOIN label_map ON ingredients.xml_id = label_map.xml_id
        WHERE ingredient_concept_id = %s
        ORDER BY zip_id DESC
        """,
        (drugID,),
    )

    drug_result = cursor.fetchall()
    # if no drug exists return
    if len(drug_result) == 0:
        return {
            "drug_name": None,
            "drug_info": None,
            "drug_labels": [],
        }
    drug_name = drug_result[0]["ingredient_concept_name"]
    drug_info_by_adverse_reaction = {}
    drug_labels = []
    for drug_product in drug_result:
        xml_id = drug_product["xml_id"]
        set_id = drug_product["set_id"]
        zip_id = drug_product["zip_id"]

        # get set id and such
        cursor.execute(
            """
            SELECT rx_string, spl_version
            FROM rxnorm_map
            WHERE rx_tty = 'PSN' AND set_id = %s
            ORDER BY spl_version
            """,
            (set_id,),
        )
        label = cursor.fetchall()
        # if product is not part of kit
        if len(label) == 1:
            date = zip_id.split("_")[0]

            try:
                date = date[:4] + "-" + date[4:6] + "-" + date[6:]
            except:
                date = date

            label_string_arr = label[0]["rx_string"].split(" ")
            label_string = ""

            for item in label_string_arr:
                word = item
                if len(word) > 4:
                    word = word.title()
                label_string += word + " "

            drug_labels.append(
                {
                    "xml_id": xml_id,
                    "rx_string": label_string,
                    "spl_version": label[0]["spl_version"],
                    "date": date,
                }
            )

            cursor.execute(
                """
                SELECT concept_name, concept_code
                FROM adverse_reactions_bylabel
                WHERE xml_id = %s
                """,
                (xml_id,),
            )

            adverse_reactions = cursor.fetchall()

            for item in adverse_reactions:
                name = item["concept_name"]

                if name in drug_info_by_adverse_reaction:
                    drug_info_by_adverse_reaction[name]["xml_ids"].append(xml_id)
                else:
                    drug_info_by_adverse_reaction[name] = item
                    drug_info_by_adverse_reaction[name]["xml_ids"] = [xml_id]

    # get stats
    num_total_labels = len(drug_labels)

    for adverse_reaction in drug_info_by_adverse_reaction:
        num_advr_labels = len(
            drug_info_by_adverse_reaction[adverse_reaction]["xml_ids"]
        )
        percent = round(num_advr_labels * 100 / num_total_labels, 2)

        drug_info_by_adverse_reaction[adverse_reaction]["percent"] = percent

    drug_info_by_adverse_reaction = list(drug_info_by_adverse_reaction.values())

    return {
        "drug_info": drug_info_by_adverse_reaction,
        "drug_name": drug_name,
        "drug_labels": drug_labels,
    }


# stats
@api.route("/api/stats")
def getStats():
    con = create_connection()
    cursor = con.cursor()

    # total drugs
    cursor.execute(
        "SELECT COUNT( DISTINCT ingredient_concept_name ) as num FROM ingredients"
    )
    num_drugs = cursor.fetchall()

    # total adv reactions
    cursor.execute(
        "SELECT COUNT( DISTINCT concept_name ) as num FROM adverse_reactions"
    )
    num_adverse_reactions = cursor.fetchall()

    # total drugs/adv reactions pairs
    cursor.execute("SELECT COUNT( * ) as num FROM adverse_reactions")
    num_pairs = cursor.fetchall()
    con.close()
    return {
        "drugs": num_drugs[0]["num"],
        "adverse_reactions": num_adverse_reactions[0]["num"],
        "pairs": num_pairs[0]["num"],
    }
