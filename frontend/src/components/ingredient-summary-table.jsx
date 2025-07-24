import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, HelpCircle } from "lucide-react";

export default function IngredientSummaryTable({
  rxcui,
  category,
  drugInfo,
  drugLabels,
  page,
}) {
  const currentLabels = drugLabels[page] ?? [];
  const totalPages = drugLabels.length;
  const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, null, total - 2, total - 1];
    if (current >= total - 4)
      return [0, null, total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, null, current - 1, current, current + 1, null, total - 1];
  };
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="container mx-auto py-8">
      {drugLabels.length === 0 ? (
        <p className="text-gray-600">No labels found.</p>
      ) : (
        <>
          <div className="relative border rounded-lg h-[600px]">
            <ScrollArea className="h-full rounded-md overflow-auto">
              <Table className="border-x border-y-0 border-separate border-spacing-0">
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/3 border-r border-b">
                      Effect
                    </TableHead>
                    <TableHead className="w-1/12 border-r border-b flex items-center gap-1">
                      Stats
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Percentage of labels associated with effect
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead
                      colSpan={currentLabels.length}
                      className="text-left font-semibold pl-4 border-b"
                    >
                      Labels
                    </TableHead>
                  </TableRow>

                  <TableRow>
                    <TableHead className="w-1/3 border-r border-b" />
                    <TableHead className="w-1/12 border-r border-b" />
                    <TableHead
                      className="p-0 border-b"
                      colSpan={currentLabels.length}
                    >
                      <div className="flex px-0 items-center">
                        {currentLabels.map((lbl) => (
                          <div
                            key={lbl.id}
                            className="flex items-center justify-center grow"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${lbl.set_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 p-0 bg-primary text-primary-foreground"
                                    >
                                      {lbl.id}
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-sm">
                                    <p>{lbl.rx_strings}</p>
                                    <p>Set ID: {lbl.set_id}</p>
                                    <p>SPL v{lbl.spl_version}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {drugInfo.map((row) => (
                    <TableRow
                      key={row.concept_code}
                      className="h-8 hover:bg-muted/50"
                    >
                      <TableCell className="font-medium py-2 border-r border-b">
                        <Link
                          href={`/adverse/${row.concept_code}`}
                          className="hover:underline"
                        >
                          {row.concept_name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-right border-r border-b">
                        {row.percent}%
                      </TableCell>
                      {currentLabels.map((lbl) => (
                        <TableCell
                          key={lbl.id}
                          className="w-6 p-0 text-center border-r border-b last:border-r-0"
                        >
                          <div className="flex justify-center items-center h-full">
                            {row.rx_cuis.includes(lbl.rx_cui) && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {totalPages > 1 && (
            <div className="my-6">
              <Pagination>
                <PaginationContent className="gap-0">
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/ingredient/${rxcui}?category=${category}&page=${Math.max(0, page - 1)}`}
                      className={
                        page === 0 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {pageNumbers.map((p, i) => (
                    <PaginationItem key={i} className="flex justify-center">
                      {p === null ? (
                        <span className="px-2">…</span>
                      ) : (
                        <Link
                          href={{
                            pathname: `/ingredient/${rxcui}`,
                            query: { category, page: p },
                          }}
                        >
                          <Button
                            variant="ghost"
                            className={`h-9 w-9 p-0 ${p === page ? "bg-accent" : ""}`}
                          >
                            {p + 1}
                          </Button>
                        </Link>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={`/ingredient/${rxcui}?category=${category}&page=${Math.min(totalPages - 1, page + 1)}`}
                      className={
                        page === totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}