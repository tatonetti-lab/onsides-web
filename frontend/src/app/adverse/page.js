import ClientTable from "@/components/client-table";
import { db } from "@/lib/db";

export default async function AdversePage() {
  const adverse = db
    .query(
      `SELECT meddra_name as name,
              meddra_id as id
        FROM vocab_meddra_adverse_effect;`,
    )
    .all();

  return (
    <div className="flex flex-col gap-4">
      <h2> Adverse Reactions </h2>
      <ClientTable
        data={adverse}
        displayId={"MedDRA ID"}
        displayName={"Concept Name"}
      />
    </div>
  );
}
