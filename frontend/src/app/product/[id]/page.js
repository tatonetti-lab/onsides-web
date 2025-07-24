import { Pill } from "lucide-react";
import { getDb } from "@/lib/db";
import ClientTable from "@/components/client-table";

async function ProductInfo({ id }) {
  const labelRow = (await getDb())
    .prepare(
      `SELECT source, source_product_name, source_product_id, source_label_url
       FROM product_label
       INNER JOIN product_to_rxnorm USING (label_id)
       WHERE rxnorm_product_id = ?;`,
    )
    .get(id);
  console.log('labelRow', labelRow);
  function formatUSURL(rawUrl) {
    // Patch an issue in our database
    return rawUrl.replace("?", "?setid=");
  }

  function splitUSID(rawId) {
    // US source IDs were formatted like setId.version. Split this for display.
    return "Set ID: " + rawId.replace(".", ", Version: ");
  }
  console.log('labelRow', labelRow);
  const url =
    labelRow.source === "US"
      ? formatUSURL(labelRow.source_label_url)
      : labelRow.source_label_url;

  const sourceId =
    labelRow.source === "US"
      ? splitUSID(labelRow.source_product_id)
      : labelRow.source_product_id;

  return (
    <>
      <span className="flex flex-row gap-4 items-center mb-4">
        <Pill className="text-blue-500 flex-shrink-0" />
        <h1>{labelRow.source_product_name}</h1>
      </span>
      <div>
        <p>
          <b>RxNorm ID:</b>{" "}
          <a
            href={`https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${id}`}
          >
            {id}
          </a>
        </p>
        <p>
          <b>Label source:</b> {labelRow.source}
        </p>
        <p>
          <b>Label source ID:</b> {sourceId}
        </p>
        <p>
          <b>Label URL:</b> <a href={url}>{url}</a>
        </p>
      </div>
    </>
  );
}

async function AdverseEventsTable({ id }) {
  const adverseEvents = (await getDb())
    .prepare(
      `SELECT DISTINCT
              label_section as section,
              meddra_id as id,
              meddra_name as name,
              meddra_term_type as termtype
       FROM product_label
       INNER JOIN product_to_rxnorm USING (label_id)
       INNER JOIN product_adverse_effect ON label_id = product_label_id
       INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
       WHERE rxnorm_product_id = ?;`,
    )
    .all(id);

  const adverseFields = [
    { name: "name", displayName: "Name", width: "w-1/2" },
    { name: "section", displayName: "Label Section", width: "w-1/6" },
    { name: "id", displayName: "MedDRA ID", width: "w-1/6" },
    { name: "termtype", displayName: "MedDRA type", width: "w-1/6" },
  ];

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h2>Adverse effects</h2>
      <ClientTable
        fields={adverseFields}
        data={adverseEvents}
        linkPath={"adverse"}
      />
    </div>
  );
}

async function IngredientsTable({ id }) {
  const ingredients = (await getDb())
    .prepare(
      `SELECT DISTINCT rxnorm_id AS id, rxnorm_name AS name, rxnorm_term_type AS termtype
       FROM product_label
       INNER JOIN product_to_rxnorm USING (label_id)
       INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
       INNER JOIN vocab_rxnorm_ingredient ON ingredient_id = rxnorm_id
       WHERE rxnorm_product_id = ?;`,
    )
    .all(id);

  const ingredientFields = [
    { name: "name", displayName: "Name", width: "w-3/5" },
    { name: "id", displayName: "RxNorm CUI", width: "w-1/5" },
    { name: "termtype", displayName: "Term type", width: "w-1/5" },
  ];

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h2>Ingredients</h2>
      <ClientTable
        fields={ingredientFields}
        data={ingredients}
        linkPath={"ingredient"}
      />
    </div>
  );
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  
  return (
    <>
      <ProductInfo id={id} />
      <IngredientsTable id={id} />
      <AdverseEventsTable id={id} />
    </>
  );
}
