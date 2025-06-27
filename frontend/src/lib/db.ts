"use server";

import "server-only";
import Database, { Database as DatabaseType } from "better-sqlite3";

const _db = new Database("/Users/czarnyr/Documents/onsides-web/database.db");

export async function getDb(): Promise<DatabaseType> {
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

  const drugs: NamedId[] = _db.prepare<null, NamedId[]>(query).all();
  const nDrugs = (_db.prepare(countQuery).get() as Count).number;
  return { drugs, nDrugs };
}

export async function getIngredientData({
  ingredientId,
  category = "adverse",
  source = "US",
  section = "ALL",
}: {
  ingredientId: string;
  category?: string;
  source?: string;
  section?: string;
}) {
  const db = await getDb();

  // Get adverse effects data for the ingredient
  const adverseEffects = db
    .prepare(
      `SELECT 
         pt_meddra_id as concept_code,
         pt_meddra_term as concept_name, 
         product_rxcuis as rx_cuis,
         ROUND(percent * 100, 2) as percent
       FROM ingredient_to_percent_labels 
       WHERE ingredient_rx_cui = $ingredientId 
         AND category = $category
       ORDER BY percent DESC;`
    )
    .all({
      $ingredientId: ingredientId,
      $category: category,
    });

  // Convert rx_cuis string to array of numbers
  const drugInfo = adverseEffects.map((effect) => ({
    ...effect,
    rx_cuis: effect.rx_cuis
      ? effect.rx_cuis.split(",").map((id) => parseInt(id.trim()))
      : [],
  }));

  // Get distinct products/labels for this ingredient
  const labels = db
    .prepare(
      `SELECT DISTINCT
         rx_cui,
         set_id,
         spl_version,
         rx_strings
       FROM distinct_products_per_ingredient 
       WHERE ingredient_rx_cui = $ingredientId
       ORDER BY rx_cui;`
    )
    .all({ $ingredientId: ingredientId });

  // Transform labels data to match expected format
  const drugLabels = labels.map((label, index) => ({
    id: index + 1,
    rx_cui: label.rx_cui,
    set_id: label.set_id,
    spl_version: label.spl_version,
    rx_strings: label.rx_strings,
  }));

  // Group labels into pages (max 20 per page for performance)
  const labelsPerPage = 20;
  const pagedLabels = [];
  for (let i = 0; i < drugLabels.length; i += labelsPerPage) {
    pagedLabels.push(drugLabels.slice(i, i + labelsPerPage));
  }

  return {
    drugInfo,
    drugLabels: pagedLabels,
  };
}
