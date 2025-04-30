"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function PageNumbers({ currentPage, nPages, source, section }) {
  // Generate page numbers
  function generatePageNumbers(page, totalPages) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (i === page - 2 || i === page + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  }

  const pageNumbers = generatePageNumbers(currentPage, nPages);
  const pathname = usePathname();

  function getPageUrl(pathname, page) {
    const p = new URLSearchParams({
      page: page,
      source,
      section,
    });
    return `${pathname}?${p.toString()}`;
  }

  return (
    <Pagination>
      <PaginationContent className="gap-1">
        <PaginationItem className="">
          <PageButton
            disabled={currentPage === 1}
            isCurrent={false}
            url={getPageUrl(pathname, Math.max(1, currentPage - 1))}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </PageButton>
        </PaginationItem>

        {pageNumbers.map((pageNumber, index) => (
          <PaginationItem
            key={index}
            className="min-w-[2.25rem] flex justify-center"
          >
            {pageNumber === "..." ? (
              <span className="px-2">⋯</span>
            ) : (
              <PageButton
                isCurrent={pageNumber === currentPage}
                disabled={false}
                url={getPageUrl(pathname, pageNumber)}
              >
                {pageNumber}
              </PageButton>
            )}
          </PaginationItem>
        ))}

        <PaginationItem className="">
          <PageButton
            disabled={currentPage === nPages}
            isCurrent={false}
            url={getPageUrl(pathname, Math.min(nPages, currentPage + 1))}
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </PageButton>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function PageButton({ children, isCurrent, disabled, url }) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground
                                        ${isCurrent ? "bg-accent text-accent-foreground" : ""}`}
      href={url}
      prefetch={true}
      aria-disabled={disabled}
    >
      {children}
    </Link>
  );
}
