import { useEffect, useState } from "react";
import AdverseEventsTable from "@/components/adverse_table";
import { config } from "@/lib/config";

export default function Adverse({}) {
  const [adverse, setAdverse] = useState([]);

  const getAllAdverse = async () => {
    return fetch(`${config.apiUrl}/api/adversereactions`)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  };

  useEffect(() => {
    getAllAdverse().then((res) => {
      setAdverse(res.adverse_reactions);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2> Adverse Reactions </h2>
      <AdverseEventsTable data={adverse} />
    </div>
  );
}
