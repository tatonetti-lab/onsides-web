"use client";

import React, { useState } from "react";
import { Pill, FlaskConical, HeartCrack } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

export default function SearchWithSuggestions({
  ingredients,
  products,
  adverseEffects,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState({
    ingredients: [],
    products: [],
    adverseEffects: [],
  });
  const router = useRouter();

  const searchItems = (searchValue) => {
    const searchTerm = searchValue.toLowerCase();

    const filteredIngreds = ingredients.filter((x) =>
      x.name.toLowerCase().includes(searchTerm),
    );
    const filteredProducts = products.filter((x) =>
      x.name.toLowerCase().includes(searchTerm),
    );
    const filteredAdverseEffects = adverseEffects.filter((x) =>
      x.name.toLowerCase().includes(searchTerm),
    );

    setResults({
      ingredients: filteredIngreds.slice(0, 10),
      products: filteredProducts.slice(0, 10),
      adverseEffects: filteredAdverseEffects.slice(0, 10),
    });
  };

  const onInputChange = (value) => {
    setValue(value);
    if (value.length >= 1) {
      searchItems(value);
    } else {
      setResults({
        ingredients: [],
        products: [],
        adverseEffects: [],
      });
    }
  };

  const onSelect = (type, _, id) => {
    setOpen(false);
    router.push(`/${type}/${id}`);
  };

  return (
    <div
      className="relative w-full max-w-xl"
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Command className="rounded-lg border dark:border-2 bg-background text-foreground">
        <CommandInput
          placeholder="Search drugs or adverse reactions..."
          value={value}
          onValueChange={onInputChange}
          className="border-none focus:ring-0"
        />
        {open && <SearchResults results={results} onSelect={onSelect} />}
      </Command>
    </div>
  );
}

function SearchResults({ results, onSelect }) {
  const products = results?.products || [];
  const ingredients = results?.ingredients || [];
  const adverseEffects = results?.adverseEffects || [];

  return (
    <CommandList>
      {!products.length && !adverseEffects.length && !ingredients.length ? (
        <CommandEmpty>No results found.</CommandEmpty>
      ) : (
        <>
          {ingredients.length > 0 && (
            <CommandGroup heading="Ingredients">
              {ingredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.id}
                  value={ingredient.name}
                  onSelect={() =>
                    onSelect("ingredient", ingredient.name, ingredient.id)
                  }
                  className="flex items-center gap-2 py-3 cursor-pointer bg-background"
                >
                  <FlaskConical className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      RXCUI: {ingredient.id}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {products.length > 0 && (
            <CommandGroup heading="Drug products">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => onSelect("product", product.name, product.id)}
                  className="flex items-center gap-2 py-3 cursor-pointer bg-background"
                >
                  <Pill className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      RXCUI: {product.id}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {adverseEffects.length > 0 && (
            <CommandGroup heading="Adverse Reactions">
              {adverseEffects.map((adverseEffect) => (
                <CommandItem
                  key={adverseEffect.id}
                  value={adverseEffect.name}
                  onSelect={() =>
                    onSelect("adverse", adverseEffect.name, adverseEffect.id)
                  }
                  className="flex items-center gap-2 py-3 cursor-pointer"
                >
                  <HeartCrack className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="flex flex-col">
                    <div className="font-medium">{adverseEffect.name}</div>
                    <div className="text-sm text-muted-foreground">
                      MedDRA ID: {adverseEffect.id}
                    </div>
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
