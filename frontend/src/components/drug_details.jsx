'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { Check, ArrowUpDown, HelpCircle } from "lucide-react";
import { config } from "@/lib/config";

async function getDrugInfo(id, category) {
    const response = await fetch(`${config.apiUrl}/api/drugs/${id}?category=${category}`);
    if (!response.ok) {
        throw new Error('Failed to fetch drug data');
    }
    return response.json();
}

export default function DrugDetailsPage({ rxcui }) {
    const [drug, setDrug] = useState([]);
    const [currentLabelsIndex, setCurrentLabelsIndex] = useState(0);
    const [drugName, setDrugName] = useState("");
    const [drugLabels, setDrugLabels] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    });
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("adverse");
    const [allLabels, setAllLabels] = useState([]); // Store all labels before chunking

    // Calculate chunk size based on screen width
    const calculateChunkSize = useCallback(() => {
        // Reserve space for the first two columns (name and stats) - approximately 50% of width
        // Each label column needs about 40px for comfortable display
        const availableWidth = window.innerWidth * 0.5; // Remaining 50% for labels
        const labelColumnWidth = 40; // pixels per label column
        return Math.max(5, Math.floor(availableWidth / labelColumnWidth)); // Minimum 5 columns
    }, []);

    const [chunkSize, setChunkSize] = useState(20);

    // Function to chunk the labels based on the calculated size
    const chunkLabels = useCallback((labels, size) => {
        const chunked = [];
        for (let i = 0; i < labels.length; i += size) {
            const chunk = labels.slice(i, i + size);
            chunked.push(chunk);
        }
        return chunked;
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const newChunkSize = calculateChunkSize();
            setChunkSize(newChunkSize);
            // Reset to first page when rechunking
            setCurrentLabelsIndex(0);
            // Rechunk the labels with new size
            if (allLabels.length > 0) {
                setDrugLabels(chunkLabels(allLabels, newChunkSize));
            }
        };

        // Set initial chunk size
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateChunkSize, chunkLabels, allLabels]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getDrugInfo(rxcui, category);
                setDrugName(res.drug_name);
                setAllLabels(res.drug_labels); // Store all labels

                // Initial chunking
                const chunked = chunkLabels(res.drug_labels, calculateChunkSize());
                setDrugLabels(chunked);
                setDrug(res.drug_info);
            } catch (error) {
                console.error('Error fetching drug data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [rxcui, category, calculateChunkSize, chunkLabels]);

    // Rest of your component remains the same...
    const getPageNumbers = (current, total) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i);

        if (current <= 3) return [0, 1, 2, 3, 4, null, total - 1];
        if (current >= total - 4) return [0, null, total - 5, total - 4, total - 3, total - 2, total - 1];

        return [0, null, current - 1, current, current + 1, null, total - 1];
    };

    const sortedDrug = useMemo(() => {
        if (!sortConfig.key) return drug;

        return [...drug].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }, [drug, sortConfig]);

    const handleSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (drug === null) {
        return (
            <div className="container mx-auto py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
                <p className="text-gray-600">The requested drug information could not be found.</p>
            </div>
        );
    }

    const pageNumbers = getPageNumbers(currentLabelsIndex, drugLabels.length);

    const categoryOptions = [
        { value: "adverse", label: "Adverse Effects" },
        { value: "boxed", label: "Boxed Warnings" },
        { value: "warnings", label: "Warnings and Precautions" },
    ];

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">{drugName}</h1>
            <div className="w-full flex justify-start gap-2 mb-8">
                {categoryOptions.map((option) => (
                    <Button
                        key={option.value}
                        variant="outline"
                        size="lg"
                        className={`${category === option.value ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setCategory(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            {drugLabels.length === 0 ? (
                <p className="text-gray-600">No labels found.</p>
            ) : (
                <>
                    <div className="relative border rounded-lg h-[600px]">
                        <ScrollArea className="h-full rounded-md overflow-auto">
                            <Table className="border-x border-y-0 border-separate border-spacing-0">
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow className="sticky top-0">
                                        <TableHead className="w-1/3 border-r border-b">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("concept_name")}
                                                className="flex items-center gap-2 font-semibold"
                                            >
                                                Adverse Effects
                                                <ArrowUpDown className="h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="w-1/6 border-r border-b">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort("percent")}
                                                            className="flex items-center gap-2 font-semibold"
                                                        >
                                                            Stats
                                                            <ArrowUpDown className="h-4 w-4" />
                                                            <HelpCircle className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Percentage of labels associated with adverse affect</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableHead>
                                        <TableHead
                                            colSpan={drugLabels[currentLabelsIndex]?.length}
                                            className="text-left font-semibold pl-4 border-b"
                                        >
                                            Labels
                                        </TableHead>
                                    </TableRow>

                                    <TableRow className="sticky top-0">
                                        <TableHead className="w-1/3 border-r border-b" />
                                        <TableHead className="w-1/6 border-r border-b" />
                                        <TableHead className="p-0 border-b" colSpan={drugLabels[currentLabelsIndex]?.length}>
                                            <div className="flex px-0 items-center">
                                                {drugLabels[currentLabelsIndex]?.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-center grow">
                                                        <div className="px-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0 bg-primary text-primary-foreground"
                                                                        >
                                                                            {index + 1}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="space-y-2">
                                                                            <p>{item.rx_strings}</p>
                                                                            <p>SPL version: {item.spl_version}</p>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {sortedDrug.map((item) => (
                                        <TableRow key={item.concept_code} className="h-8 hover:bg-muted/50">
                                            <TableCell className="font-medium py-2 border-r border-b">
                                                <Link href={`/adverse/${item.concept_code}`} className="hover:underline">
                                                    {item.concept_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-2 text-right border-r border-b">{item.percent}%</TableCell>
                                            {drugLabels[currentLabelsIndex]?.map((label_item, index) => (
                                                <TableCell
                                                    key={index}
                                                    className="w-6 p-0 text-center border-r border-b last:border-r-0"
                                                >
                                                    <div className="flex justify-center items-center h-full">
                                                        {item.rx_cuis.includes(label_item.rx_cui) && (
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

                    {drugLabels.length > 1 && (
                        <div className="my-6">
                            <Pagination>
                                <PaginationContent className="gap-1">
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentLabelsIndex(prev => Math.max(0, prev - 1))}
                                            className={`${currentLabelsIndex === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <PaginationPrevious />
                                        </Button>
                                    </PaginationItem>
                                    {pageNumbers.map((pageNum, idx) => (
                                        <PaginationItem key={idx} className="min-w-[2.25rem] flex justify-center">
                                            {pageNum === null ? (
                                                <span className="px-2">⋯</span>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setCurrentLabelsIndex(pageNum)}
                                                    className={`h-9 w-9 p-0 cursor-pointer hover:bg-accent hover:text-accent-foreground
                                                    ${currentLabelsIndex === pageNum ? 'bg-accent text-accent-foreground' : ''}`}
                                                >
                                                    {pageNum + 1}
                                                </Button>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentLabelsIndex(prev => Math.min(drugLabels.length - 1, prev + 1))}
                                            className={`${currentLabelsIndex === drugLabels.length - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <PaginationNext />
                                        </Button>
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
