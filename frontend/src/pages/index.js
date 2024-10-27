import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import SearchWithSuggestions from "@/components/search";
import { config } from "@/lib/config";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <Heading />
      <SearchWithSuggestions />
      <BasicStats />
      <About />
    </div>
  );
}

function BasicStats() {
  const [stats, setStats] = useState({
    adverseReactions: ".",
    drugs: " ",
    pairs: " ",
  });

  const getStats = async () => {
    return fetch(`${config.apiUrl}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  };

  useEffect(() => {
    getStats().then((res) => {
      setStats({
        adverseReactions: res.adverse_reactions,
        drugs: res.drugs,
        pairs: res.pairs,
      });
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2>Basic Statistics</h2>
      <Table className="text-md">
        <TableHeader>
          <TableRow>
            <TableHead>Drugs</TableHead>
            <TableHead>Adverse Reactions</TableHead>
            <TableHead>Drug/Adverse Reactions Pairs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{stats.drugs}</TableCell>
            <TableCell>{stats.adverseReactions}</TableCell>
            <TableCell>{stats.pairs}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex flex-col gap-2">
      <h1>OnSIDES</h1>
      <p>
        A resource of adverse drug effects extracted from FDA structured product
        labels.
      </p>
      <Separator />
    </div>
  );
}

function About() {
  return (
    <div className="flex flex-col gap-4">
      <h2>About</h2>
      <p>
        OnSIDES is a database of adverse drug events extracted from drug labels
        created by fine-tuning a{" "}
        <Link href="https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract">
          PubMedBERT language model
        </Link>{" "}
        on 200 manually curated labels available from{" "}
        <Link href="https://pubmed.ncbi.nlm.nih.gov/29381145/">
          Denmer-Fushman et al.
        </Link>
        . This comprehensive database will be updated quarterly, and currently
        contains more than 3.6 million drug-ADE pairs for 2,793 drug ingredients
        extracted from 46,686 labels, processed from all of the labels available
        to download from{" "}
        <Link href="https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm">
          DailyMed
        </Link>{" "}
        as of November 2023. Additionally, we now provide a number of
        complementary databases constructed using a similar method -
        OnSIDES-INTL, adverse drug events extracted from drug labels of other
        nations/regions (Japan, UK, EU), and OnSIDES-PED, adverse drug events
        specifically noted for pediatric patients in drug labels. We have
        recently released a preprint on{" "}
        <Link href="https://www.medrxiv.org/content/10.1101/2024.03.22.24304724v1">
          medRxiv
        </Link>{" "}
        with a full description of the data, methods and analyses.
      </p>
      <h3>Model Accuracy</h3>
      <p>
        Our fine-tuned language model achieves an F1 score of 0.90, AUROC of
        0.92, and AUPR of 0.95 at extracting effects from the ADVERSE REACTIONS
        section of the FDA drug label. For the BOXED WARNINGS section, the model
        achieves an F1 score of 0.71, AUROC of 0.85, and AUPR of 0.72. For the
        WARNINGS AND PRECUATIONS section, the model achieves an F1 score of
        0.68, AUROC of 0.66, and AUPR of 0.68. Compared against the reference
        standard using the official evaluation script for{" "}
        <Link href="https://bionlp.nlm.nih.gov/tac2017adversereactions/">
          TAC 2017
        </Link>
        , the model achieves a Micro-F1 score of 0.87 and a Macro-F1 of 0.85.
      </p>
    </div>
  );
}
