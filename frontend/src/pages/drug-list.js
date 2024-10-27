import { useEffect, useState } from "react";
import DrugIngredientsTable from "@/components/drug_table";
import { config } from "@/lib/config";

export default function Drugs({}) {
  const [drugs, setDrugs] = useState([]);

  const getAllDrugs = async () => {
    return fetch(`${config.apiUrl}/api/drugs`)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  };

  useEffect(() => {
    getAllDrugs().then((res) => {
      setDrugs(res.drugs);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2> Drug Products </h2>
      <DrugIngredientsTable data={drugs} />
    </div>
  );
}
