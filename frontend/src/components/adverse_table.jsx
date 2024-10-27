import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowUpDown } from "lucide-react";

const AdverseEventsTable = ({ data }) => {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({ conceptName: '', meddraId: '' });
    const itemsPerPage = 10;

    // Sort function
    const sortData = (items) => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // Filter function
    const filterData = (items) => {
        return items.filter(item => {
            const nameMatch = item.concept_name.toLowerCase().includes(filters.conceptName.toLowerCase());
            const meddraMatch = item.meddra_id.toString().includes(filters.meddraId);
            return nameMatch && meddraMatch;
        });
    };

    // Handle sorting
    const requestSort = (key) => {
        const direction =
            sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    // Process data
    const filteredData = filterData(data);
    const sortedData = sortData(filteredData);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentData = sortedData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - 1 && i <= page + 1)
            ) {
                pages.push(i);
            } else if (i === page - 2 || i === page + 2) {
                pages.push('...');
            }
        }
        return [...new Set(pages)];
    };

    return (
        <div className="w-full space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
                <Input
                    placeholder="Filter by name..."
                    value={filters.conceptName}
                    onChange={(e) => setFilters({ ...filters, conceptName: e.target.value })}
                    className="max-w-sm"
                />
                <Input
                    placeholder="Filter by MedDRA ID..."
                    value={filters.meddraId}
                    onChange={(e) => setFilters({ ...filters, meddraId: e.target.value })}
                    className="max-w-sm"
                />
            </div>

            {/* Table with fixed column widths */}
            <div className="relative overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-4/5">
                                <Button
                                    variant="ghost"
                                    onClick={() => requestSort('concept_name')}
                                    className="h-8 flex items-center gap-2"
                                >
                                    Concept Name
                                    <ArrowUpDown className="w-4 h-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="w-1/5">
                                <Button
                                    variant="ghost"
                                    onClick={() => requestSort('meddra_id')}
                                    className="h-8 flex items-center gap-2"
                                >
                                    MedDRA ID
                                    <ArrowUpDown className="w-4 h-4" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((row, index) => (
                            <TableRow
                                key={index}
                                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                onClick={() => router.push(`/adverse/${row.meddra_id}`)}
                            >
                                <TableCell className="w-4/5">{row.concept_name}</TableCell>
                                <TableCell className="w-1/5">{row.meddra_id}</TableCell>
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
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={`${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}`}
                        >
                            <PaginationPrevious className="" />
                        </Button>
                    </PaginationItem>

                    {getPageNumbers().map((pageNumber, index) => (
                        <PaginationItem key={index} className="min-w-[2.25rem] flex justify-center">
                            {pageNumber === '...' ? (
                                <span className="px-2">⋯</span>
                            ) : (
                                <Button
                                    variant="ghost"
                                    onClick={() => setPage(pageNumber)}
                                    className={`h-9 w-9 p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground
                                        ${page === pageNumber ? 'bg-accent text-accent-foreground' : ''}`}
                                >
                                    {pageNumber}
                                </Button>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem className="">
                        <Button
                            variant="ghost"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className={`${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}`}
                        >
                            <PaginationNext />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default AdverseEventsTable;
