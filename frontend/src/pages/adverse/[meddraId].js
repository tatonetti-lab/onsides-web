"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

import AdverseEventDetailsTable from "@/components/adverse_details";

export default function AdverseEventPage() {
  const router = useRouter();
  const meddraId = router.query.meddraId;
  const [name, setName] = useState("");
  const [drugs, setDrugs] = useState([]);
  const [category, setCategory] = useState({
    value: "adverse",
    label: "Adverse Effects",
  });

  const getDrugsByAdverseReaction = async (meddraID, category) => {
    const response = await fetch(
      `${config.apiUrl}/api/adversereactions/${meddraID}?category=${category.value}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch drug data");
    }
    return response.json();
  };

  useEffect(() => {
    getDrugsByAdverseReaction(meddraId, category).then((res) => {
      setName(res.adverse_reaction);
      setDrugs(res.drugs);
    });
  }, [meddraId, category]);

  const categoryOptions = [
    { value: "adverse", label: "Adverse Effects" },
    { value: "boxed", label: "Boxed Warnings" },
    { value: "warnings", label: "Warnings and Precautions" },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8">{name}</h1>
      <div className="w-full flex justify-start gap-2 mb-8">
        {categoryOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="lg"
            className={`${category.value === option.value ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setCategory(option)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {drugs && drugs.length > 0 && (
        <AdverseEventDetailsTable data={drugs} eventName={name} />
      )}
      {drugs === null ||
        (drugs.length === 0 && (
          <p>
            No drugs associated with this adverse event in the `{category.label}
            ` section.
          </p>
        ))}
    </div>
  );
}
