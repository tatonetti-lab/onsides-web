"use server";

import ServerTable from "@/components/server-table/table";
import { getDb } from "@/lib/db";

export default async function DrugsPage({ searchParams, pathName }) {
  const queryParams = await searchParams;
  const page = Number(queryParams.page ?? 1);
  const sort = queryParams.sort ?? "name";
  const order = queryParams.order ?? "asc";

  const nameQuery = queryParams.name ?? "";
  const rxcuiQuery = queryParams.id ?? "";
  const sortField = sort === "name" ? "rxnorm_name" : "rxnorm_id";
  const sortOrder = order === "desc" ? "DESC" : "ASC";
  const offset = (page - 1) * 10;

  const table =
    pathName === "ingredient"
      ? "vocab_rxnorm_ingredient"
      : "vocab_rxnorm_product";

  const pageTitle = pathName === "ingredient" ? "Ingredients" : "Drug Products";

  const db = await getDb();
  const drugs = db
    .prepare(
      `SELECT rxnorm_id as id, rxnorm_name as name
       FROM ${table}
       WHERE rxnorm_name LIKE '%${nameQuery}%'
         AND rxnorm_id LIKE '%${rxcuiQuery}%'
       ORDER BY ${sortField} ${sortOrder}
       LIMIT 10 OFFSET ${offset};`,
    )
    .all();

  const nDrugs = db
    .prepare(
      `SELECT COUNT(*) as number 
       FROM ${table}
       WHERE rxnorm_name LIKE '%${nameQuery}%'
         AND rxnorm_id LIKE '%${rxcuiQuery}%'`,
    )
    .get().number;

  const fields = [
    { name: "name", displayName: "Product name" },
    { name: "id", displayName: "RxCUI" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2>{pageTitle}</h2>
      <ServerTable
        fields={fields}
        data={drugs}
        linkPath={pathName}
        nTotalItems={nDrugs}
      />
    </div>
  );
}
