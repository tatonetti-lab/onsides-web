"use server";

import "server-only";
import { Database } from "bun:sqlite";

const _db = new Database("/Users/zietzm/projects/onsides-web/onsides.db");

export async function getDb(): Promise<Database> {
  return _db;
}

type NamedId = {
  name: string;
  id: string | number;
};

type Count = {
  number: number;
};

enum DataSource {
  All = "ALL",
  US = "US",
  EU = "EU",
  UK = "UK",
  JP = "Japan",
}

enum LabelSection {
  All = "ALL",
  AdverseReaction = "AR",
  BoxedWarnings = "BW",
  WarningsPrecautions = "WP",
}

enum DrugKind {
  Product = "product",
  Ingredient = "ingredient",
}

enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export async function getDrugs({
  source,
  section,
  kind,
  meddraId,
  nameQuery,
  rxcuiQuery,
  page,
  sort,
  order,
}: {
  source: DataSource;
  section: LabelSection;
  kind: DrugKind;
  meddraId?: string;
  nameQuery?: string;
  rxcuiQuery?: string;
  page: number;
  sort: string;
  order: SortOrder;
}): Promise<{ drugs: NamedId[]; nDrugs: number }> {
  // TODO: Validate all strings! No SQL injection
  const drug_table =
    kind === DrugKind.Ingredient
      ? "web_label_to_ingredients"
      : "web_label_to_products";
  const sourceFilter =
    source === DataSource.All ? "" : `AND source = '${source}'`;
  const sectionFilter =
    section === LabelSection.All ? "" : `AND label_section = '${section}'`;
  const offset = (page - 1) * 10;
  const nameFilter = nameQuery
    ? `AND drug_rxnorm_name LIKE '%${nameQuery}%'`
    : "";
  const rxcuiFilter = rxcuiQuery
    ? `AND drug_rxnorm_id LIKE '%${rxcuiQuery}%'`
    : "";
  const sortField = sort === "name" ? "name" : "id";
  const sortOrder = order === "asc" ? "ASC" : "DESC";
  const sorting = `ORDER BY ${sortField} ${sortOrder}`;

  const meddraFilter = meddraId ? `effect_meddra_id = ${meddraId}` : "";
  const meddraJoins = meddraId
    ? `INNER JOIN product_adverse_effect ON label_id = product_label_id
       INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id`
    : "";

  const query = `
        SELECT DISTINCT 
               drug_rxnorm_id as id,
               drug_rxnorm_name as name
        FROM product_label
        INNER JOIN ${drug_table} USING (label_id)
        ${meddraJoins}
        WHERE ${meddraFilter}
              ${sourceFilter}
              ${sectionFilter}
              ${nameFilter}
              ${rxcuiFilter}
        ${sorting}
        LIMIT 10 OFFSET ${offset};
    `;

  const countQuery = `
        SELECT COUNT(DISTINCT drug_rxnorm_id) AS number
        FROM product_label
        INNER JOIN ${drug_table} USING (label_id)
        ${meddraJoins}
        WHERE ${meddraFilter}
              ${sourceFilter}
              ${sectionFilter}
              ${nameFilter}
              ${rxcuiFilter};
    `;

  const drugs: NamedId[] = _db.query<null, NamedId[]>(query).all();
  const nDrugs = (_db.query(countQuery).get() as Count).number;
  return { drugs, nDrugs };
}
