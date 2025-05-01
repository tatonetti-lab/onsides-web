import { db } from "@/lib/db";
import { HeartCrack } from "lucide-react";
import ServerTable from "@/components/server-table/table";
import CategorySelectors from "@/components/categorySelections";

export default async function AdverseEffectPage({ params, searchParams }) {
  const { id } = await params;
  const queryParams = await searchParams;

  const source = queryParams.source ?? "ALL";
  const section = queryParams.section ?? "ALL";
  const kind = queryParams.kind ?? "ingredient";
  const nameQuery = queryParams.name ?? "";
  const rxcuiQuery = queryParams.id ?? "";
  const page = Number(queryParams.page ?? 1);
  const sort = queryParams.sort ?? "name";
  const order = queryParams.order ?? "asc";

  const name = getName({ meddra_id: id });
  const { drugs, nDrugs } = getDrugs({
    meddra_id: id,
    source,
    section,
    kind,
    nameQuery,
    rxcuiQuery,
    page,
    sort,
    order,
  });

  return (
    <>
      <span className="flex flex-row gap-4 items-center mb-4">
        <HeartCrack className="text-red-500 flex-shrink-0" />
        <h1>{name}</h1>
      </span>
      <CategorySelectors />
      <ServerTable
        items={drugs}
        nTotalItems={nDrugs}
        displayId="RxCUI"
        path={kind}
      />
    </>
  );
}

function getName({ meddra_id }) {
  const query = `
        SELECT meddra_name
        FROM vocab_meddra_adverse_effect
        WHERE meddra_id = ${meddra_id};
    `;
  return db.query(query).get().meddra_name;
}

function getDrugs({
  meddra_id,
  source,
  section,
  kind,
  nameQuery,
  rxcuiQuery,
  page,
  sort,
  order,
}) {
  // TODO: Validate all strings! No SQL injection
  const drug_table =
    kind === "ingredient"
      ? "web_label_to_ingredients"
      : "web_label_to_products";
  const sourceFilter = source === "ALL" ? "" : `AND source = '${source}'`;
  const sectionFilter =
    section === "ALL" ? "" : `AND label_section = '${section}'`;
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

  const query = `
        SELECT DISTINCT 
               drug_rxnorm_id as id,
               drug_rxnorm_name as name
        FROM product_label
        INNER JOIN ${drug_table} USING (label_id)
        INNER JOIN product_adverse_effect ON label_id = product_label_id
        INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
        WHERE effect_meddra_id = ${meddra_id}
              ${sourceFilter}
              ${sectionFilter}
              ${nameFilter}
              ${rxcuiFilter}
        ${sorting}
        LIMIT 10 OFFSET ${offset};
    `;

  const countQuery = `
        SELECT COUNT(DISTINCT drug_rxnorm_id) AS nDrugs
        FROM product_label
        INNER JOIN ${drug_table} USING (label_id)
        INNER JOIN product_adverse_effect ON label_id = product_label_id
        INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
        WHERE effect_meddra_id = ${meddra_id}
              ${sourceFilter}
              ${sectionFilter}
              ${nameFilter}
              ${rxcuiFilter};
    `;

  const drugs = db.query(query).all();
  const nDrugs = db.query(countQuery).get().nDrugs;
  return { drugs, nDrugs };
}
