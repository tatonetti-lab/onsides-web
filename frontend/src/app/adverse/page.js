import AdverseEventsTable from "@/components/adverse_table";
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
      <AdverseEventsTable data={adverse} />
    </div>
  );
}
