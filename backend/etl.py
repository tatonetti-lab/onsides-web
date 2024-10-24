import argparse
import datetime
import logging
import pathlib

import pandas as pd
from pydantic import field_validator
from sqlmodel import (
    Field,
    Session,
    SQLModel,
    create_engine,
    select,
)

logger = logging.getLogger(__name__)

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)


class AdverseReactions(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ingredients_rxcuis: str
    ingredients_names: str
    num_ingredients: int
    pt_meddra_id: int
    pt_meddra_term: str
    percent_labels: float
    num_labels: int


class AdverseReactionsActiveLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    num_ingredients: int
    ingredients_rxcuis: str
    ingredients_names: str


class AdverseReactionsAllLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    section: str
    zip_id: str
    label_id: str
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    pred0: float
    pred1: float


class BoxedWarnings(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ingredients_rxcuis: str
    ingredients_names: str
    num_ingredients: int
    pt_meddra_id: int
    pt_meddra_term: str
    percent_labels: float
    num_labels: int


class BoxedWarningsActiveLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    num_ingredients: int
    ingredients_rxcuis: str
    ingredients_names: str


class BoxedWarningsAllLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    section: str
    zip_id: str
    label_id: str
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    pred0: float
    pred1: float


class WarningsAndPrecautions(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ingredients_rxcuis: str
    ingredients_names: str
    num_ingredients: int
    pt_meddra_id: int
    pt_meddra_term: str
    percent_labels: float
    num_labels: int


class WarningsAndPrecautionsActiveLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    num_ingredients: int
    ingredients_rxcuis: str
    ingredients_names: str


class WarningsAndPrecautionsAllLabels(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    section: str
    zip_id: str
    label_id: str
    set_id: str
    spl_version: int
    pt_meddra_id: int
    pt_meddra_term: str
    pred0: float
    pred1: float


class Ingredients(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    ingredient_rx_cui: int
    ingredient_name: str
    ingredient_omop_concept_id: int


class RxCuitSetIdMap(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    rx_cui: int


class RxNormProductToIngredient(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    product_rx_cui: int
    product_name: str
    product_omop_concept_id: int
    ingredient_rx_cui: int
    ingredient_name: str
    ingredient_omop_concept_id: int


class RxNormMappings(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    spl_version: int
    rx_cui: int
    rx_string: str
    rx_tty: str


class DmSplZipFilesMetaData(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    set_id: str
    zip_file_name: str
    upload_date: datetime.date
    spl_version: int
    title: str

    @field_validator("upload_date", mode="before")
    def parse_date(cls, value):
        return datetime.datetime.strptime(value, "%m/%d/%Y").date()


class IngredientPublic(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, exclude=True)
    concept_id: int
    concept_name: str
    rx_cui: int

    def __hash__(self) -> int:
        return self.concept_id


class IngredientsResponse(SQLModel):
    drugs: list[IngredientPublic]


class AdverseReactionsPublic(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, exclude=True)
    meddra_id: int
    meddra_name: str

    def __hash__(self) -> int:
        return self.meddra_id


class AdverseReactionsResponse(SQLModel):
    adverse_reactions: list[AdverseReactionsPublic]


class KeywordQueryResponse(SQLModel):
    drugs: list[IngredientPublic]
    adverse_reactions: list[AdverseReactionsPublic]


class DrugsForAdverseReactionResponse(SQLModel):
    adverse_reaction: AdverseReactionsPublic
    drugs: list[IngredientPublic]


class DrugInfoItem(SQLModel):
    concept_name: str
    concept_code: str
    set_ids: list[str]
    percent: float


class DrugLabelItem(SQLModel):
    set_id: str
    rx_string: str
    spl_version: int


class DrugInfoResponse(SQLModel):
    drug_name: str | None
    drug_info: list[DrugInfoItem]
    drug_labels: list[DrugLabelItem]


class StatsResponse(SQLModel):
    n_drugs: int
    n_adverse_reactions: int
    n_pairs: int


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def load_file_paths(root: pathlib.Path) -> list[pathlib.Path]:
    return sorted(root.glob("*.csv.gz"))


def drop_all_stems(path: pathlib.Path) -> str | None:
    old = path
    new = None
    for _ in range(10):
        new = pathlib.Path(old.stem)
        if new == old:
            return new.stem
        old = new
    return None


def cleanup_df(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df.drop_duplicates()
        .fillna({"ingredients_rxcuis": "", "ingredients_names": ""})
        .rename(columns=lambda x: x.lower())
        .rename(
            columns={
                "setid": "set_id",
                "rxcui": "rx_cui",
                "rxstring": "rx_string",
                "rxtty": "rx_tty",
            }
        )
    )


def load_file(path: pathlib.Path, n_rows: int | None) -> list[SQLModel]:
    stem_to_type = {
        "adverse_reactions": AdverseReactions,
        "adverse_reactions_active_labels": AdverseReactionsActiveLabels,
        "adverse_reactions_all_labels": AdverseReactionsAllLabels,
        "boxed_warnings": BoxedWarnings,
        "boxed_warnings_active_labels": BoxedWarningsActiveLabels,
        "boxed_warnings_all_labels": BoxedWarningsAllLabels,
        "dm_spl_zip_files_meta_data": DmSplZipFilesMetaData,
        "ingredients": Ingredients,
        "rxcui_setid_map": RxCuitSetIdMap,
        "rxnorm_mappings": RxNormMappings,
        "rxnorm_product_to_ingredient": RxNormProductToIngredient,
        "warnings_and_precautions": WarningsAndPrecautions,
        "warnings_and_precautions_active_labels": WarningsAndPrecautionsActiveLabels,
        "warnings_and_precautions_all_labels": WarningsAndPrecautionsAllLabels,
    }
    stem = drop_all_stems(path)
    if stem is None:
        raise ValueError(f"Unable to find stem for path: {path}")

    type_ = stem_to_type.get(stem)
    if type_ is None:
        raise ValueError(f"Stem did not match any options: {stem}")

    df = pd.read_csv(path).pipe(cleanup_df)
    if n_rows is not None:
        df = df.head(n_rows)

    records = df.to_dict(orient="records")
    mapped = [type_.model_validate(record) for record in records]
    return mapped


def create_derived_tables():
    create_ingredient_public_table()
    create_adverse_reaction_public_table()


def create_ingredient_public_table():
    logger.info("Creating the ingredients public table")
    with Session(engine) as session:
        query = select(Ingredients)
        ingredients = session.exec(query).all()
        public = sorted(
            set(
                IngredientPublic(
                    concept_id=ingredient.ingredient_omop_concept_id,
                    concept_name=ingredient.ingredient_name,
                    rx_cui=ingredient.ingredient_rx_cui,
                )
                for ingredient in ingredients
            ),
            key=lambda x: x.concept_name,
        )
        for p in public:
            session.add(p)

        session.commit()

    logger.info("Finished the ingredients public table")


def create_adverse_reaction_public_table():
    logger.info("Creating the adverse reactions public table")
    with Session(engine) as session:
        query = select(AdverseReactions)
        reactions = session.exec(query).all()
        public = sorted(
            set(
                AdverseReactionsPublic(
                    meddra_id=reaction.pt_meddra_id,
                    meddra_name=reaction.pt_meddra_term,
                )
                for reaction in reactions
            ),
            key=lambda x: x.meddra_name,
        )
        for p in public:
            session.add(p)

        session.commit()

    logger.info("Finished the adverse reactions public table")


def main(data_path: pathlib.Path, n_rows: int | None):
    logger.info(f"Using the data directory: {data_path}")
    create_db_and_tables()
    logger.info("Created database and tables")

    file_paths = load_file_paths(data_path)
    for file_path in file_paths:
        logger.info(f"Loading {file_path}")
        structs = load_file(file_path, n_rows)
        logger.info(f"Loaded {file_path}")
        with Session(engine) as session:
            for struct in structs:
                session.add(struct)
            session.commit()
        logger.info(f"Finished adding all rows for {file_path}")

    create_derived_tables()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=pathlib.Path)
    parser.add_argument("--n-rows", type=int, required=False)
    args = parser.parse_args()
    main(args.data, args.n_rows)
