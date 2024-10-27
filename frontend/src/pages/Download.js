import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Download({}) {
  return (
    <div>
      <h1 className="mb-8"> Downloads </h1>
      <p className="my-8">
        This analysis is updated regularly. The latest data are available for
        download in our{" "}
        <Link href="https://github.com/tatonetti-lab/onsides/releases">
          GitHub releases
        </Link>
        . For more information about the flat files, see the{" "}
        <Link href="https://github.com/tatonetti-lab/onsides?tab=readme-ov-file#table-descriptions">
          table descriptions
        </Link>
        .
      </p>

      <div className="my-8">
        <Button asChild className="text-lg">
          <Link
            href="https://github.com/tatonetti-lab/onsides/releases/latest"
            className="no-underline"
          >
            Download Latest Release
          </Link>
        </Button>
      </div>

      <h4 className="mb-4">Note</h4>
      <div className="flex flex-col gap-4">
        <p>
          The Onsides database is intended for research purposes only. The
          extraction process is imperfect, side effects will be missed and some
          identified will be incorrect. Patients seeking health information
          should not trust these data and instead refer to the FDA`&apos;`s
          website (<Link href="https://fda.gov">fda.gov</Link>) and consult
          their doctor.
        </p>
        <p>
          The project is under active development. Validation of extracted
          information is yet to be independently verified and the data, methods,
          and statistics are subject to change at any time. Check back to this
          page for updates. If you would like to to contribute to the project or
          have ideas on how the methods, data, or evaluation can be improved
          please reach out to Prof. Tatonetti via{" "}
          <Link href="mailto:nicholas.tatonetti@cshs.org">email</Link> or{" "}
          <Link href="https://twitter.com/proftatonetti">Twitter</Link>.
        </p>
      </div>
    </div>
  );
}
