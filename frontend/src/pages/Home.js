import React from "react";
import "./css/home.css";
import Container from "react-bootstrap/Container";
import Search from "../components/Search";
import StatsTable from "../components/StatsTable";

export default function Home() {
  return (
    <div>
      <Container>
        <div className="home-title">
          <h2> OnSIDES </h2>
          <p>
            A resource of adverse drug effects extracted from FDA structured
            product labels.{" "}
          </p>
        </div>

        <br />

        <h5>Search by drugs or adverse reactions:</h5>

        <Search />

        <br />
        <br />

        <StatsTable />

        <br />
        <br />

        <p>
          OnSIDES is a database of adverse drug events extracted from drug
          labels created by fine-tuning a{" "}
          <a href="https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract">
            PubMedBERT language model
          </a>{" "}
          on 200 manually curated labels available from{" "}
          <a href="https://pubmed.ncbi.nlm.nih.gov/29381145/">
            Denmer-Fushman et al.
          </a>
          . This comprehensive database will be updated quarterly, and currently
          contains more than 3.6 million drug-ADE pairs for 2,793 drug
          ingredients extracted from 46,686 labels, processed from all of the
          labels available to download from{" "}
          <a href="https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm">
            DailyMed
          </a>{" "}
          as of November 2023. Additionally, we now provide a number of
          complementary databases constructed using a similar method -
          OnSIDES-INTL, adverse drug events extracted from drug labels of other
          nations/regions (Japan, UK, EU), and OnSIDES-PED, adverse drug events
          specifically noted for pediatric patients in drug labels. We have
          recently released a preprint on{" "}
          <a href="https://www.medrxiv.org/content/10.1101/2024.03.22.24304724v1">
            medRxiv
          </a>{" "}
          with a full description of the data, methods and analyses.
        </p>
        <h3 id="model-accuracy">Model Accuracy</h3>
        <p>
          Our fine-tuned language model achieves an F1 score of 0.90, AUROC of
          0.92, and AUPR of 0.95 at extracting effects from the ADVERSE
          REACTIONS section of the FDA drug label. For the BOXED WARNINGS
          section, the model achieves an F1 score of 0.71, AUROC of 0.85, and
          AUPR of 0.72. For the WARNINGS AND PRECUATIONS section, the model
          achieves an F1 score of 0.68, AUROC of 0.66, and AUPR of 0.68.
          Compared against the reference standard using the official evaluation
          script for{" "}
          <a href="https://bionlp.nlm.nih.gov/tac2017adversereactions/">
            TAC 2017
          </a>
          , the model achieves a Micro-F1 score of 0.87 and a Macro-F1 of 0.85.
        </p>
      </Container>
    </div>
  );
}
