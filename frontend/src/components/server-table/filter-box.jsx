"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Search boxes to filter the table. This creates two boxes, for filtering
 * on two fields, name and id. The display versions (e.g. "Name", "RxCUI") shoul
 * be passed as props. "name" and "id" should be usable as URLSearchParams like
 * "/foo?name=naproxen" or "/bar?id=123".
 * The current pathname should also take a "page" URLSearchParam, since
 * any change to the filtering results in a navigation to page number 1.
 */
export default function FilterBox({ fields }) {
  const params = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState(() => {
    return fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {});
  });

  // debounce timer
  const timer = useRef();

  // push URL when either field stops changing for a few ms
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const p = new URLSearchParams(params);
      p.set("page", "1");
      Object.entries(filters).forEach(([key, value]) => {
        p.set(key, value);
      });
      router.replace(`?${p.toString()}`);
    }, 200); // ms time

    return () => clearTimeout(timer.current);
  }, [filters, router]);

  return (
    <div className="flex gap-4">
      {fields.map((f) => (
        <Input
          key={f.name}
          placeholder={`Filter by ${f.displayName}…`}
          value={filters[f.name]}
          onChange={(e) =>
            setFilters((x) => ({ ...x, [f.name]: e.target.value }))
          }
          className={`${f.width}`}
        />
      ))}
    </div>
  );
}
