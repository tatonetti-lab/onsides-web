"use client";

import { useSearchParams, useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function InnerTable({ fields, data, linkPath }) {
  const router = useRouter();
  const params = useSearchParams();

  const sort = params.get("sort") ?? "name";
  const order = params.get("order") ?? "asc";

  function requestSort(newSort) {
    const p = new URLSearchParams(params);
    p.set("sort", newSort);
    if (sort === newSort && order === "asc") {
      p.set("order", "desc");
    } else {
      p.set("order", "asc");
    }
    router.replace(`?${p.toString()}`);
  }

  return (
    <div className="w-full space-y-4">
      {/* Table with fixed column widths */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((f) => (
                <TableHead className={`${f.width}`} key={f.name}>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort(f.name)}
                    className={`h-8 flex items-center gap-2`}
                  >
                    {f.displayName}
                    {sort === f.name ? (
                      order === "asc" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4" />
                    )}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push(`/${linkPath}/${row.id}`)}
              >
                {fields.map((f) => (
                  <TableCell
                    className={`ml-6 ${f.width}`}
                    key={`row-${index}-${f.name}`}
                  >
                    {row[f.name]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
