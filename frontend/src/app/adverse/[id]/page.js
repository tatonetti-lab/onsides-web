import { getDb, getDrugs } from "@/lib/db";
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
  const { drugs, nDrugs } = await getDrugs({
    source,
    section,
    kind,
    meddraId: id,
    nameQuery,
    rxcuiQuery,
    page,
    sort,
    order,
  });

  const fields = [
    { name: "name", displayName: "Name", width: "w-4/5" },
    { name: "id", displayName: "RxCUI", width: "w-1/5" },
  ];

  return (
    <>
      <span className="flex flex-row gap-4 items-center mb-4">
        <HeartCrack className="text-red-500 flex-shrink-0" />
        <h1>{name}</h1>
      </span>
      <CategorySelectors />
      <ServerTable
        fields={fields}
        data={drugs}
        linkPath={kind === "ingredient" ? "ingredient" : "product"}
        nTotalItems={nDrugs}
      />
    </>
  );
}

async function getName({ meddra_id }) {
  const query = `
        SELECT meddra_name
        FROM vocab_meddra_adverse_effect
        WHERE meddra_id = ${meddra_id};
    `;
  return (await getDb()).prepare(query).get().meddra_name;
}
