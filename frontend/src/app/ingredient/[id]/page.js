import { getDb } from "@/lib/db";
import IngredientSummaryTable from "@/components/ingredient-summary-table";
import { FlaskConical } from "lucide-react";
import CategorySelectors from "@/components/categorySelections";

export default async function IngredientPage({ params, searchParams }) {
  const { id } = await params;
  const queryParams = await searchParams;
  const source = queryParams.source ?? "US";
  const section = queryParams.section ?? "ALL";
  const page = Number(queryParams.page ?? 1);

  // Get the name of the ingredient
  const name = (await getDb())
    .query(
      `SELECT rxnorm_name as name
       FROM vocab_rxnorm_ingredient
       WHERE rxnorm_id = $id`,
    )
    .get({ $id: id }).name;

  // Get the distinct products
  // const products = db
  //   .query(
  //     `SELECT product_label.*
  //      FROM vocab_rxnorm_ingredient_to_product
  //      INNER JOIN product_to_rxnorm ON product_id = rxnorm_product_id
  //      INNER JOIN product_label USING (label_id)
  //      WHERE ingredient_id = $id AND source = $source;`,
  //   )
  //   .all({ $id: id, $source: source });

  // // Get adverse reaction stats
  // const stats = db
  //   .query(
  //     `SELECT
  //          meddra_id,
  //          meddra_name,
  //          frac_labels
  //      FROM
  //          web_ingredient_meddra_summary
  //      WHERE
  //          ingredient_id = $ingredient_id
  //          AND source = $source
  //          AND label_section = $label_section
  //      ORDER BY
  //          meddra_name
  //      LIMIT
  //          50 OFFSET 150;
  //      `,
  //   )
  //   .all({
  //     $ingredient_id: id,
  //     $source: source,
  //     $label_section: label_section,
  //   });

  return (
    <>
      <span className="flex flex-row gap-4 items-center mb-4">
        <FlaskConical className="text-green-500 flex-shrink-0" />
        <h1>{name}</h1>
      </span>
      <CategorySelectors showDrugKind={false} />
      <IngredientSummaryTable
        rxcui={id}
        section={section}
        drugInfo={[]}
        drugLabels={[]}
        page={page}
      />
    </>
  );
}
