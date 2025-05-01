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

export default function InnerTable({ data, linkPath }) {
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
              <TableHead className="w-4/5">
                <Button
                  variant="ghost"
                  onClick={() => requestSort("name")}
                  className="h-8 flex items-center gap-2"
                >
                  Name
                  {sort === "name" ? (
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
              <TableHead className="w-1/5">
                <Button
                  variant="ghost"
                  onClick={() => requestSort("id")}
                  className="h-8 flex items-center gap-2"
                >
                  RxCUI
                  {sort === "id" ? (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push(`/${linkPath}/${row.id}`)}
              >
                <TableCell className="w-4/5">{row.name}</TableCell>
                <TableCell className="w-1/5">{row.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
