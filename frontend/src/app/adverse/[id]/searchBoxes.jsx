"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export default function SearchBox() {
  const params = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    name: params.get("name") ?? "",
    rxcui: params.get("rxcui") ?? "",
  });

  // debounce timer
  const timer = useRef();

  // push URL when either field stops changing for a few ms
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const p = new URLSearchParams(params);
      p.set("page", "1");
      p.set("name", filters.name);
      p.set("rxcui", filters.rxcui);
      router.replace(`?${p.toString()}`);
    }, 200); // ms time

    return () => clearTimeout(timer.current);
  }, [filters, router]);

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Filter by name…"
        value={filters.name}
        onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter by RxCUI…"
        value={filters.rxcui}
        onChange={(e) => setFilters((f) => ({ ...f, rxcui: e.target.value }))}
        className="max-w-sm"
      />
    </div>
  );
}
