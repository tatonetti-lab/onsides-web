"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { generatePageNumbers } from "./server-table/utils";

export default function ClientTable({
  fields, // {name, displayName, width}
  data,
  linkPath,
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });
  const [filters, setFilters] = useState(() => {
    return fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {});
  });

  const itemsPerPage = 10;

  const sortData = (items) => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.order === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.order === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const filterData = (items) => {
    return items.filter((item) => {
      return fields.every((field) => {
        const filterValue = filters[field.name].toLowerCase();
        if (!filterValue) return true;
        const itemValue = String(item[field.name]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  };

  const requestSort = (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });
  };

  const handleFilterChange = (fieldName, value) => {
    setPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [fieldName]: value,
    }));
  };

  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const pageNumbers = generatePageNumbers(page, totalPages);

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="w-full flex gap-4">
        {fields.map((f) => (
          <Input
            placeholder={`Filter by ${f.displayName}`}
            value={filters[f.name]}
            onChange={(e) => handleFilterChange(f.name, e.target.value)}
            key={`filter-${f.name}`}
            className={`${f.width}`}
          />
        ))}
      </div>

      {/* Table with fixed column widths */}
      <div className="relative overflow-x-auto flex">
        <Table>
          <TableHeader>
            <TableRow key={"header"}>
              {fields.map((f) => (
                <TableHead className={`${f.width}`} key={f.name}>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort(f.name)}
                    className={`h-8 flex gap-2`}
                  >
                    {f.displayName}
                    {sortConfig.key === f.name ? (
                      sortConfig.order === "asc" ? (
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
            {currentData.map((row, index) => (
              <TableRow
                key={`row-${index}`}
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

      {/* Pagination */}
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem className="">
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`${page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent hover:text-accent-foreground"}`}
            >
              <PaginationPrevious className="" />
            </Button>
          </PaginationItem>

          {pageNumbers.map((pageNumber, index) => (
            <PaginationItem
              key={index}
              className="min-w-[2.25rem] flex justify-center"
            >
              {pageNumber === "..." ? (
                <span className="px-2">⋯</span>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 w-9 p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground
                                        ${page === pageNumber ? "bg-accent text-accent-foreground" : ""}`}
                >
                  {pageNumber}
                </Button>
              )}
            </PaginationItem>
          ))}

          <PaginationItem className="">
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`${page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent hover:text-accent-foreground"}`}
            >
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
