import { getDb } from "@/lib/db";
import IngredientSummaryTable from "@/components/ingredient-summary-table";
import { FlaskConical } from "lucide-react";
import CategorySelectors from "@/components/categorySelections";

export default async function IngredientPage({ params, searchParams }) {
  const { id } = await params;
  const queryParams = await searchParams;
  const category = queryParams.category ?? "adverse";
  const page = Number(queryParams.page ?? 0);

  // Get the name of the ingredient
  const name = (await getDb())
    .prepare(
      `SELECT rxnorm_name as name
       FROM vocab_rxnorm_ingredient
       WHERE rxnorm_id = ?`,
    )
    .get(id).name;

  // Get adverse effects data for the ingredient
  const adverseEffects = (await getDb())
    .prepare(
      `SELECT 
         pt_meddra_id as concept_code,
         pt_meddra_term as concept_name, 
         product_rxcuis as rx_cuis,
         ROUND(percent * 100, 2) as percent
       FROM ingredient_to_percent_labels 
       WHERE ingredient_rx_cui = ? 
         AND category = ?
       ORDER BY percent DESC;`
    )
    .all(id, category);

  // Convert rx_cuis string to array of numbers
  const drugInfo = adverseEffects.map((effect) => ({
    ...effect,
    rx_cuis: effect.rx_cuis
      ? effect.rx_cuis.split(",").map((rxcui) => parseInt(rxcui.trim()))
      : [],
  }));

  // Get distinct products/labels for this ingredient
  const labels = (await getDb())
    .prepare(
      `SELECT DISTINCT
         rx_cui,
         set_id,
         spl_version,
         rx_strings
       FROM distinct_products_per_ingredient 
       WHERE ingredient_rx_cui = ?
       ORDER BY rx_cui;`
    )
    .all(id);
  console.log("Labels fetched:", labels.length);
  // Transform labels data
  const transformedLabels = labels.map((label, index) => ({
    id: index + 1,
    rx_cui: label.rx_cui,
    set_id: label.set_id,
    spl_version: label.spl_version,
    rx_strings: label.rx_strings,
    dates: label.upload_dates ? label.upload_dates.split(",") : [],
  }));

  // Group labels into pages (max 20 per page for performance)
  const labelsPerPage = 20;
  const pagedLabels = [];
  for (let i = 0; i < transformedLabels.length; i += labelsPerPage) {
    pagedLabels.push(transformedLabels.slice(i, i + labelsPerPage));
  }

  return (
    <>
      <span className="flex flex-row gap-4 items-center mb-4">
        <FlaskConical className="text-green-500 flex-shrink-0" />
        <h1>{name}</h1>
      </span>
      <CategorySelectors showDrugKind={false} />
      <IngredientSummaryTable
        rxcui={id}
        category={category}
        drugInfo={drugInfo}
        drugLabels={pagedLabels}
        page={page}
      />
    </>
  );
}