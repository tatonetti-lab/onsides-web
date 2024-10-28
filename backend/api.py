import os
import sqlite3

from flask import Blueprint, request
from flask_pydantic import validate
from pydantic import BaseModel


def create_connection():
    path = os.getenv("ONSIDESDB")
    if path is None:
        raise ValueError("Environmental variable ONSIDESDB must be set")

    return sqlite3.connect(path)


api = Blueprint("api", __name__)


# returns list of all drug names and id sorted by name alphabetically
@api.route("/api/drugs")
def get_all_drugs():
    con = create_connection()
    cursor = con.cursor()
    cursor.execute(
        """
        SELECT ingredient_name, ingredient_rx_cui
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


# returns adverse reaction name and list of drugs associated with it
@api.route("/api/adversereactions/<meddraID>")
def getDrugsByAdverseReaction(meddraID):
    category = request.args.get("category")
    if category is None or category not in ["adverse", "boxed", "warnings"]:
        category = "adverse"

    con = create_connection()
    cursor = con.cursor()
    # get adverse reaction name
    cursor.execute(
        """
        SELECT meddra_name AS concept_name, meddra_id
        FROM adversereactionspublic
        WHERE meddra_id = ?
        LIMIT 1
        """,
        (meddraID,),
    )
    adverse_reactions = cursor.fetchall()
    if len(adverse_reactions) == 0:
        return {"adverse_reaction": None, "drugs": []}

    adverse_reaction = adverse_reactions[0]
    adverse_reaction = {
        "concept_name": adverse_reaction[0],
        "meddra_id": adverse_reaction[1],
    }

    cursor.execute(
        """
        SELECT ingredient_rx_cui, ingredient_name
        FROM ingredients_per_adverse_event
        WHERE pt_meddra_id = ? AND category = ?
        """,
        (meddraID, category),
    )
    drugs = cursor.fetchall()
    drugs = [{"rxcui": drug[0], "name": drug[1]} for drug in drugs]
    con.close()
    return {"drugs": drugs, "adverse_reaction": adverse_reaction["concept_name"]}


class DrugInfoItem(BaseModel):
    concept_name: str
    concept_code: int
    rx_cuis: list[int]
    percent: float


class DrugLabelItem(BaseModel):
    id: int
    rx_cui: int
    spl_version: int
    set_id: str
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
        SELECT ingredient_name
        FROM ingredientpublic
        WHERE ingredient_rx_cui = ?
        LIMIT 1
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
        SELECT rx_cui, spl_version, set_id, upload_dates, rx_strings,
            ROW_NUMBER() OVER() AS ID
        FROM distinct_products_per_ingredient
        WHERE ingredient_rx_cui = ?
        """,
        (ingredient_rx_cui,),
    )
    items = cursor.fetchall()
    return [
        DrugLabelItem(
            rx_cui=row[0],
            spl_version=row[1],
            set_id=row[2],
            dates=row[3].split(","),
            rx_strings=row[4],
            id=row[5],
        )
        for row in items
    ]


def get_adverse_reaction_stats(
    ingredient_rx_cui: int, category: str, cursor: sqlite3.Cursor
) -> list[DrugInfoItem]:
    cursor.execute(
        """
        SELECT pt_meddra_id, pt_meddra_term, product_rxcuis,
            ROUND( 100 * percent, 2) AS percent
        FROM ingredient_to_percent_labels
        WHERE ingredient_rx_cui = ? AND category = ?
        """,
        (ingredient_rx_cui, category),
    )
    items = cursor.fetchall()
    return [
        DrugInfoItem(
            concept_code=row[0],
            concept_name=row[1],
            rx_cuis=[int(x) for x in row[2].split(",")],
            percent=row[3],
        )
        for row in items
    ]


@api.route("/api/drugs/<drugID>")
@validate()
def getDrugInfo(drugID) -> DrugInfoResponse:
    category = request.args.get("category")
    if category is None or category not in ["adverse", "boxed", "warnings"]:
        category = "adverse"

    con = create_connection()
    cursor = con.cursor()
    drug_name = get_drug_name(drugID, cursor)
    drug_products = get_distinct_products(drugID, cursor)
    adverse_reaction_stats = get_adverse_reaction_stats(drugID, category, cursor)
    con.close()
    return DrugInfoResponse(
        drug_name=drug_name, drug_info=adverse_reaction_stats, drug_labels=drug_products
    )


# stats
@api.route("/api/stats")
def getStats():
    con = create_connection()
    cursor = con.cursor()

    cursor.execute("SELECT * FROM summary_stats LIMIT 1")
    item = cursor.fetchone()
    con.close()
    return {
        "drugs": item[0],
        "adverse_reactions": item[1],
        "pairs": item[2],
    }
