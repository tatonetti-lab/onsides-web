import ClientTable from "@/components/client-table";
import { getDb } from "@/lib/db";

export default async function AdversePage() {
  const adverse = (await getDb())
    .query(
      `SELECT meddra_name as name,
              meddra_id as id
        FROM vocab_meddra_adverse_effect;`,
    )
    .all();

  const fields = [
    { name: "name", displayName: "Concept name", width: "w-2/3" },
    { name: "id", displayName: "MedDRA ID", width: "w-1/3" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2> Adverse Reactions </h2>
      <ClientTable data={adverse} fields={fields} linkPath={"adverse"} />
    </div>
  );
}
