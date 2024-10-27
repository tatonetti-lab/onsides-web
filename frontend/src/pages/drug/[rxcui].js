"use client";

import { useRouter } from "next/router";
import DrugDetailsTable from "@/components/drug_details";

export default function DrugPage() {
  const router = useRouter();
  const rxcui = router.query.rxcui;

  return (
    <div className="container mx-auto py-8">
      {rxcui && <DrugDetailsTable rxcui={rxcui} />}
    </div>
  );
}
