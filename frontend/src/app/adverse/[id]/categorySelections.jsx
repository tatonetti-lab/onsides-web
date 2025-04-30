"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function CategoryButton({ label, link, isCurrent }) {
  // TODO: Gray out sections if any source besides US is selected
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 rounded-md px-8 ${isCurrent ? "bg-primary text-primary-foreground" : ""}`}
      href={link}
      prefetch={true}
    >
      {label}
    </Link>
  );
}

export default function CategorySelectors() {
  const pathname = usePathname();
  const params = useSearchParams();
  const source = params.get("source") ?? "ALL";
  const section = params.get("source") ?? "ALL";

  const sectionOptions = [
    { value: "ALL", label: "All" },
    { value: "AR", label: "Adverse Effects" },
    { value: "BW", label: "Boxed Warnings" },
    { value: "WP", label: "Warnings and Precautions" },
  ];

  const sourceOptions = [
    { value: "ALL", label: "All" },
    { value: "US", label: "US" },
    { value: "UK", label: "UK" },
    { value: "EU", label: "EU" },
    { value: "JP", label: "Japan" },
  ];

  const sectionLinks = sectionOptions.map((opt) => {
    const p = new URLSearchParams(params);
    p.set("section", opt.value);
    p.set("page", 1);
    return { ...opt, link: `${pathname}?${p.toString()}` };
  });
  const sourceLinks = sourceOptions.map((opt) => {
    const p = new URLSearchParams(params);
    p.set("source", opt.value);
    p.set("page", 1);
    return { ...opt, link: `${pathname}?${p.toString()}` };
  });

  return (
    <div className="mb-8">
      <div className="text-xl mb-2">Source</div>
      <div className="w-full flex justify-start gap-2 mb-4">
        {sourceLinks.map((option) => (
          <CategoryButton
            key={`source-${option.value}`}
            value={option.value}
            label={option.label}
            link={option.link}
            isCurrent={source == option.value}
          />
        ))}
      </div>
      <div className="text-xl mb-2">Label sections</div>
      <div className="w-full flex justify-start gap-2 mb-4">
        {sectionLinks.map((option) => (
          <CategoryButton
            key={`section-${option.value}`}
            value={option.value}
            label={option.label}
            link={option.link}
            isCurrent={section == option.value}
          />
        ))}
      </div>
    </div>
  );
}
