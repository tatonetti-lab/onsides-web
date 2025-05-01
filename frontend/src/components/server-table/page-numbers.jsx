"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generatePageNumbers } from "./utils";

export default function PageNumbers({ nPages }) {
  const router = useRouter();
  const params = useSearchParams();
  const currentPage = Number(params.get("page") ?? 1);

  const pageNumbers = generatePageNumbers(currentPage, nPages);

  function goToPage(page) {
    const p = new URLSearchParams(params);
    p.set("page", page);
    router.replace(`?${p.toString()}`);
  }

  return (
    <Pagination>
      <PaginationContent className="gap-1">
        <PaginationItem>
          <Button
            variant="ghost"
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent hover:text-accent-foreground"}`}
          >
            <PaginationPrevious />
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
                onClick={() => goToPage(pageNumber)}
                className={`h-9 w-9 p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground
                            ${currentPage === pageNumber ? "bg-accent text-accent-foreground" : ""}`}
              >
                {pageNumber}
              </Button>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <Button
            variant="ghost"
            onClick={() => goToPage(Math.min(nPages, currentPage + 1))}
            className={`${currentPage === nPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent hover:text-accent-foreground"}`}
          >
            <PaginationNext />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
