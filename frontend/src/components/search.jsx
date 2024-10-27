import React, { useState, useEffect } from 'react';
import { Pill, AlertCircle } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandInput,
    CommandList,
} from "@/components/ui/command";
import { useRouter } from 'next/navigation';
import { config } from "@/lib/config";


export default function SearchWithSuggestions() {
    const [drugs, setDrugs] = useState([]);
    const [adverseReactions, setAdverseReactions] = useState([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [results, setResults] = useState({ drugs: [], adverse_reactions: [] });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const getAllDrugs = async () => {
        return fetch(`${config.apiUrl}/api/drugs`)
            .then((res) => res.json())
            .then((data) => {
                return data;
            });
    };

    const getAllAdverseReactions = async () => {
        return fetch(`${config.apiUrl}/api/adversereactions`)
            .then((res) => res.json())
            .then((data) => {
                return data;
            });
    };

    useEffect(() => {
        setIsLoading(true);
        Promise.all([getAllDrugs(), getAllAdverseReactions()])
            .then(([drugsRes, reactionsRes]) => {
                setDrugs(drugsRes.drugs || []);
                setAdverseReactions(reactionsRes.adverse_reactions || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                setIsLoading(false);
            });
    }, []);

    const searchItems = (searchValue) => {
        const searchTerm = searchValue.toLowerCase();

        const filteredDrugs = drugs.filter(drug =>
            drug.ingredient_concept_name.toLowerCase().includes(searchTerm)
        );

        const filteredReactions = adverseReactions.filter(reaction =>
            reaction.concept_name.toLowerCase().includes(searchTerm)
        );

        setResults({
            drugs: filteredDrugs.slice(0, 10),
            adverse_reactions: filteredReactions.slice(0, 10)
        });
    };

    const onInputChange = (value) => {
        setValue(value);
        if (value.length >= 1) {
            searchItems(value);
        } else {
            setResults({ drugs: [], adverse_reactions: [] });
        }
    };

    const onSelect = (type, _, id) => {
        setOpen(false);
        if (type === 'drug') {
            router.push(`/drug/${id}`);
        } else {
            router.push(`/adverse/${id}`);
        }
    };

    return (
        <div className="relative w-full max-w-xl" onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
            <Command className="rounded-lg border">
                <CommandInput
                    placeholder="Search drugs or adverse reactions..."
                    value={value}
                    onValueChange={onInputChange}
                    className="border-none focus:ring-0"
                />
                {open && (
                    <SearchResults
                        results={results}
                        isLoading={isLoading}
                        onSelect={onSelect}
                    />
                )}
            </Command>
        </div>
    );
}

function SearchResults({ results, isLoading, onSelect }) {
    const drugs = results?.drugs || [];
    const adverse_reactions = results?.adverse_reactions || [];

    return (
        <CommandList>
            {isLoading ? (
                <CommandEmpty>Loading data...</CommandEmpty>
            ) : !drugs.length && !adverse_reactions.length ? (
                <CommandEmpty>No results found.</CommandEmpty>
            ) : (
                <>
                    {drugs.length > 0 && (
                        <CommandGroup heading="Drugs">
                            {drugs.map(drug => (
                                <CommandItem
                                    key={drug.ingredient_concept_id}
                                    value={drug.ingredient_concept_name}
                                    onSelect={() => onSelect('drug', drug.ingredient_concept_name, drug.ingredient_concept_id)}
                                    className="flex items-center gap-2 py-3 cursor-pointer"
                                >
                                    <Pill className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <div className="font-medium">{drug.ingredient_concept_name}</div>
                                        <div className="text-sm text-muted-foreground">RXCUI: {drug.ingredient_concept_id}</div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {adverse_reactions.length > 0 && (
                        <CommandGroup heading="Adverse Reactions">
                            {adverse_reactions.map(reaction => (
                                <CommandItem
                                    key={reaction.meddra_id}
                                    value={reaction.concept_name}
                                    onSelect={() => onSelect('reaction', reaction.concept_name, reaction.meddra_id)}
                                    className="flex items-center gap-2 py-3 cursor-pointer"
                                >
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <div className="font-medium">{reaction.concept_name}</div>
                                        <div className="text-sm text-muted-foreground">MedDRA ID: {reaction.meddra_id}</div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </>
            )}
        </CommandList>
    );
}
