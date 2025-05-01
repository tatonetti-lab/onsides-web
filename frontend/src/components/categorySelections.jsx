"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * Category selector. Pathname must take "page", "source", and "section"
 * TODO: Ensure that selecting a source other than US disables section,
 * since, currently, only the US has different sections available.
 */
export default function CategorySelectors() {
  const router = useRouter();
  const params = useSearchParams();

  const source = params.get("source") ?? "ALL";
  const section = params.get("section") ?? "ALL";
  const drugKind = params.get("kind") ?? "ingredient";

  const sourceOptions = [
    { value: "ALL", label: "All" },
    { value: "US", label: "US" },
    { value: "UK", label: "UK" },
    { value: "EU", label: "EU" },
    { value: "JP", label: "Japan" },
  ];

  const sectionOptions = [
    { value: "ALL", label: "All" },
    { value: "AR", label: "Adverse Effects" },
    { value: "BW", label: "Boxed Warnings" },
    { value: "WP", label: "Warnings and Precautions" },
  ];

  const drugKindOptions = [
    { value: "ingredient", label: "Ingredients" },
    { value: "product", label: "Products" },
  ];

  function setSection(newSection) {
    const p = new URLSearchParams(params);
    p.set("section", newSection);
    p.set("page", 1);
    router.replace(`?${p.toString()}`);
  }

  function setSource(newSource) {
    const p = new URLSearchParams(params);
    p.set("source", newSource);
    p.set("page", 1);
    router.replace(`?${p.toString()}`);
  }

  function setDrugKind(newDrugKind) {
    const p = new URLSearchParams(params);
    p.set("kind", newDrugKind);
    p.set("page", 1);
    router.replace(`?${p.toString()}`);
  }

  return (
    <div className="mb-8">
      <CategoryGroup
        title={"Drug type"}
        current={drugKind}
        setCurrent={setDrugKind}
        options={drugKindOptions}
      />
      <CategoryGroup
        title={"Source"}
        current={source}
        setCurrent={setSource}
        options={sourceOptions}
      />
      <CategoryGroup
        title={"Label section"}
        current={section}
        setCurrent={setSection}
        options={sectionOptions}
        disableTail={source !== "US"}
        disabledTooltip="Label sections are only available for US labels"
      />
    </div>
  );
}

function CategoryGroup({
  title,
  current,
  setCurrent,
  options,
  disableTail = false,
  disabledTooltip = "",
}) {
  return (
    <>
      <div className="text-xl mb-2">{title}</div>
      <div className="w-full flex justify-start gap-2 mb-4">
        {options.map((option) => (
          <React.Fragment key={option.value}>
            {disableTail ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Button
                        variant="outline"
                        size="lg"
                        className={`${current === option.value ? "bg-primary text-primary-foreground" : ""}`}
                        disabled
                      >
                        {option.label}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{disabledTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className={`${current === option.value ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setCurrent(option.value)}
              >
                {option.label}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
