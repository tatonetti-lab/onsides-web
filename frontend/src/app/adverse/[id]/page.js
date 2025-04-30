import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import AdverseEventDetailsTable from "@/components/adverse_details";
import { db } from "@/lib/db";
import DrugList from "./drugList";

export default async function AdverseEffectPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const source = query.source ?? "ALL";
  const section = query.section ?? "ALL";
  const kind = query.kind ?? "ingredient";
  const page = Number(query.page ?? 1);

  const drugs = getDrugs({ meddra_id: id, source, section, kind, page });

  return (
    <>
      <div>Adverse effect MedDRA ID: {id}</div>
      <DrugList drugs={drugs} />
    </>
  );
}

function getDrugs({ meddra_id, source, section, kind, page }) {
  // TODO: Order by ???
  const drug_table =
    kind === "ingredient"
      ? "web_label_to_ingredients"
      : "web_label_to_products";
  const sourceFilter = source === "ALL" ? "" : `AND source = '${source}'`;
  const sectionFilter =
    section === "ALL" ? "" : `AND label_section = '${section}'`;
  const offset = (page - 1) * 50;

  const query = `
        SELECT label_id,
               drug_rxnorm_id as rxcui,
               drug_rxnorm_name as name
        FROM product_label
        INNER JOIN ${drug_table} USING (label_id)
        INNER JOIN product_adverse_effect ON label_id = product_label_id
        INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
        WHERE effect_meddra_id = ${meddra_id}
              ${sourceFilter}
              ${sectionFilter}
        LIMIT 50 OFFSET ${offset};
    `;

  const drugs = db.query(query).all();
  return drugs;
}
