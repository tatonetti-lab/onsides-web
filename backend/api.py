import os
import sqlite3

from flask import Blueprint
from flask_pydantic import validate
from pydantic import BaseModel


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


class DrugInfoItem(BaseModel):
    concept_name: str
    concept_code: int
    rx_cuis: list[int]
    percent: float


class DrugLabelItem(BaseModel):
    rx_cui: int
    spl_version: int
    dates: list[str]
    rx_strings: str

    def __hash__(self):
        return (self.rx_cui, self.rx_strings, self.spl_version, self.dates)


class DrugInfoResponse(BaseModel):
    drug_name: str | None
    drug_info: list[DrugInfoItem] | None
    drug_labels: list[DrugLabelItem]


def get_drug_name(ingredient_rx_cui: int, cursor: sqlite3.Cursor) -> str | None:
    cursor.execute(
        """
        SELECT concept_name
        FROM ingredientpublic
        WHERE rx_cui = ?
        """,
        (ingredient_rx_cui,),
    )
    drug_names = cursor.fetchone()
    return None if len(drug_names) == 0 else drug_names[0]


def get_distinct_products(
    ingredient_rx_cui: int, cursor: sqlite3.Cursor
) -> list[DrugLabelItem]:
    cursor.execute(
        """
        SELECT DISTINCT rx_cui, spl_version,
            GROUP_CONCAT(DISTINCT upload_date) as upload_dates,
            GROUP_CONCAT(DISTINCT rx_string) AS rx_strings
        FROM ingredients
        INNER JOIN dmsplzipfilesmetadata USING (set_id)
        INNER JOIN rxnormmappings USING (set_id, spl_version)
        WHERE ingredient_rx_cui = ?
        GROUP BY rx_cui, spl_version
        """,
        (ingredient_rx_cui,),
    )
    items = cursor.fetchall()
    return [
        DrugLabelItem(
            rx_cui=row[0],
            spl_version=row[1],
            dates=row[2].split(","),
            rx_strings=row[3],
        )
        for row in items
    ]


def get_adverse_reaction_stats(
    ingredient_rx_cui: int, cursor: sqlite3.Cursor
) -> list[DrugInfoItem]:
    cursor.execute(
        """
        WITH total_sets AS (
            SELECT ingredient_rx_cui, COUNT(DISTINCT rx_cui) AS n_total_product_cuis
            FROM ingredients
            INNER JOIN rxnormmappings USING (set_id)
            WHERE ingredient_rx_cui = ?
        ),
             sets_per_adverse AS (
            SELECT ingredient_rx_cui, pt_meddra_id, pt_meddra_term,
                GROUP_CONCAT(DISTINCT rx_cui) AS product_rxcuis,
                COUNT(DISTINCT rx_cui)        AS n_product_rxcuis_with_adverse
            FROM ingredients
            INNER JOIN adversereactionsactivelabels USING (set_id)
            INNER JOIN (
                SELECT * FROM rxnormmappings WHERE rx_tty = 'PSN'
            ) AS psns USING (set_id, spl_version)
            WHERE ingredient_rx_cui = ?
            GROUP BY pt_meddra_id, pt_meddra_term
        )
        SELECT pt_meddra_id, pt_meddra_term, product_rxcuis,
            ROUND(
                100 * CAST(
                    n_product_rxcuis_with_adverse AS REAL
                ) / n_total_product_cuis, 2
            ) AS percent
        FROM total_sets
        INNER JOIN sets_per_adverse USING (ingredient_rx_cui)
        """,
        (ingredient_rx_cui, ingredient_rx_cui),
    )
    items = cursor.fetchall()
    return [
        DrugInfoItem(
            concept_code=row[0],
            concept_name=row[1],
            rx_cuis=row[2].split(","),
            percent=row[3],
        )
        for row in items
    ]


@api.route("/api/drugs/<drugID>")
@validate()
def getDrugInfo(drugID) -> DrugInfoResponse:
    con = create_connection()
    cursor = con.cursor()
    drug_name = get_drug_name(drugID, cursor)
    drug_products = get_distinct_products(drugID, cursor)
    adverse_reaction_stats = get_adverse_reaction_stats(drugID, cursor)
    con.close()
    return DrugInfoResponse(
        drug_name=drug_name, drug_info=adverse_reaction_stats, drug_labels=drug_products
    )


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
