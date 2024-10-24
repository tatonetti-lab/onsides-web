import datetime
import os
import re
import sqlite3

from flask import Blueprint


def create_connection():
    path = os.getenv("ONSIDESDB")
    if path is None:
        raise ValueError("Environmental variable ONSIDESDB must be set")

    return sqlite3.connect(path)


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
        SELECT concept_name, rx_cui
        FROM ingredientpublic
        """
    )
    drugs = cursor.fetchall()
    drugs = [
        {"ingredient_concept_name": drug[0], "ingredient_concept_id": drug[1]}
        for drug in drugs
    ]
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
    adverse_reactions = [
        {"concept_name": a[0], "meddra_id": a[1]} for a in adverse_reactions
    ]
    con.close()
    return {"adverse_reactions": adverse_reactions}


# returns lists of drugs and adverse reactions, both with name and id
@api.route("/api/query/<keyword>")
def query_keyword(keyword):
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT concept_name, rx_cui
        FROM ingredientpublic
        WHERE concept_name LIKE ?
        """,
        (f"%{keyword}%",),
    )
    drugs = cursor.fetchall()
    drugs = [
        {"ingredient_concept_name": drug[0], "ingredient_concept_id": drug[1]}
        for drug in drugs
    ]
    cursor.execute(
        """
        SELECT meddra_name AS concept_name, meddra_id
        FROM adversereactionspublic
        WHERE meddra_name LIKE ?
        """,
        (f"%{keyword}%",),
    )
    adverse_reactions = cursor.fetchall()
    adverse_reactions = [
        {"concept_name": adverse[0], "meddra_id": adverse[1]}
        for adverse in adverse_reactions
    ]
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
        SELECT pt_meddra_term, pt_meddra_id
        FROM adversereactions
        WHERE pt_meddra_id = ?
        LIMIT 1
        """,
        (meddraID,),
    )
    adverse_reactions = cursor.fetchall()
    if len(adverse_reactions) == 0:
        return {"adverse_reaction": [{"concept_name": None}]}

    adverse_reaction = adverse_reactions[0]
    adverse_reaction = {
        "concept_name": adverse_reaction[0],
        "meddra_id": adverse_reaction[1],
    }

    cursor.execute(
        """
        SELECT ingredients_names, ingredients_rxcuis
        FROM adversereactions
        WHERE pt_meddra_id = ?
        ORDER BY ingredients_names
        """,
        (meddraID,),
    )
    drugs = cursor.fetchall()
    drugs = [{"ingredients": drug[0], "drug_concept_ids": drug[1]} for drug in drugs]
    con.close()
    return {"drugs": drugs, "adverse_reaction": adverse_reaction}


@api.route("/api/drugs/<drugID>")
def getDrugInfo(drugID):
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT DISTINCT ingredient_name, set_id, zip_file_name
        FROM ingredients
        LEFT JOIN dmsplzipfilesmetadata USING (set_id)
        WHERE ingredient_rx_cui = ?
        ORDER BY zip_file_name DESC
        """,
        (drugID,),
    )
    drug_result = cursor.fetchall()
    drug_result = [
        {
            "ingredient_concept_name": result[0],
            "set_id": result[1],
            "zip_id": result[2],
        }
        for result in drug_result
    ]
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
        set_id = drug_product["set_id"]
        zip_id = drug_product["zip_id"]

        date_match = re.match("^[0-9]{8}(?=_)", zip_id)
        if date_match:
            date = date_match.group()
            date = datetime.datetime.strptime(date, "%Y%m%d")
            date = date.strftime("%Y-%m-%d")
        else:
            date = zip_id.split("_")[0]

        cursor.execute(
            """
            SELECT rx_string, spl_version
            FROM rxnormmappings
            WHERE rx_tty = 'PSN' AND set_id = ?
            ORDER BY spl_version
            """,
            (set_id,),
        )
        labels = cursor.fetchall()
        labels = [
            {
                "rx_string": x[0],
                "spl_version": x[1],
                "date": date,
                "set_id": set_id,
            }
            for x in labels
        ]
        drug_labels.extend(labels)

        cursor.execute(
            """
            SELECT pt_meddra_term, pt_meddra_id
            FROM adversereactionsalllabels
            WHERE set_id = ?
            """,
            (set_id,),
        )
        adverse_reactions = cursor.fetchall()
        adverse_reactions = [
            {
                "concept_name": x[0],
                "concept_code": x[1],
            }
            for x in adverse_reactions
        ]
        for item in adverse_reactions:
            name = item["concept_name"]
            if name in drug_info_by_adverse_reaction:
                drug_info_by_adverse_reaction[name]["set_ids"].add(set_id)
            else:
                drug_info_by_adverse_reaction[name] = item
                drug_info_by_adverse_reaction[name]["set_ids"] = {set_id}

    # get stats
    num_total_labels = len({x["set_id"] for x in drug_labels})
    for adverse_reaction in drug_info_by_adverse_reaction:
        num_advr_labels = len(
            drug_info_by_adverse_reaction[adverse_reaction]["set_ids"]
        )
        percent = round(num_advr_labels * 100 / num_total_labels, 2)
        drug_info_by_adverse_reaction[adverse_reaction]["percent"] = percent
        drug_info_by_adverse_reaction[adverse_reaction]["set_ids"] = sorted(
            drug_info_by_adverse_reaction[adverse_reaction]["set_ids"]
        )

    drug_info = list(drug_info_by_adverse_reaction.values())
    return {
        "drug_info": drug_info,
        "drug_name": drug_name,
        "drug_labels": drug_labels,
    }


# stats
@api.route("/api/stats")
def getStats():
    con = create_connection()
    cursor = con.cursor()

    # total drugs
    cursor.execute("SELECT COUNT( DISTINCT concept_id ) as num FROM ingredientpublic")
    num_drugs = cursor.fetchall()

    # total adv reactions
    cursor.execute(
        "SELECT COUNT( DISTINCT meddra_id ) as num FROM adversereactionspublic"
    )
    num_adverse_reactions = cursor.fetchall()

    # total drugs/adv reactions pairs
    cursor.execute("SELECT COUNT( * ) as num FROM adversereactions")
    num_pairs = cursor.fetchall()
    con.close()
    return {
        "drugs": num_drugs[0][0],
        "adverse_reactions": num_adverse_reactions[0][0],
        "pairs": num_pairs[0][0],
    }
