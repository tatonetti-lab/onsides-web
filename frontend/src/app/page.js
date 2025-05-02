"use server";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getDb } from "@/lib/db";
import SearchWithSuggestions from "@/components/search";
import DatabaseStats from "@/components/database_stats";

async function getAllEntities() {
  const db = await getDb();

  const ingredients = db
    .prepare(
      `SELECT rxnorm_id as id, rxnorm_name as name
       FROM vocab_rxnorm_ingredient;`,
    )
    .all();

  const products = db
    .prepare(
      `SELECT rxnorm_id as id, rxnorm_name as name
       FROM vocab_rxnorm_product;`,
    )
    .all();

  const adverseEffects = db
    .prepare(
      `SELECT meddra_id as id, meddra_name as name
       FROM vocab_meddra_adverse_effect;`,
    )
    .all();

  return { ingredients, products, adverseEffects };
}

export default async function Home() {
  const { ingredients, products, adverseEffects } = await getAllEntities();
  return (
    <div className="flex flex-col gap-8">
      <Heading />
      <SearchWithSuggestions
        ingredients={ingredients}
        products={products}
        adverseEffects={adverseEffects}
      />
      <DatabaseStats />
      <About />
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
