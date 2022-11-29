import React from "react";
import "./css/home.css"
import Container from 'react-bootstrap/Container'

import Search from "../components/Search";
import StatsTable from "../components/StatsTable";

export default function Home() {


    return (
        <div className="body">
            <Container>

                <div className="home-title">
                <h2> OnSIDES </h2> 
                <p> A resource of adverse drug effects extracted from FDA structured product labels. </p>
                </div>

                <br />

                <h5>Search by drugs or adverse reactions:</h5>

                <Search />
                
                <br />
                <br />

                <StatsTable />

                <br />
                <br />

                <h5>OnSIDES v2.0.0</h5>

                <p> 
                    Second major release of the OnSIDES (ON label SIDE effectS resource) database of adverse reactions and boxed warnings extracted from the FDA structured product labels (SPLs). This version contains significant model improvements as well as updated labels. All labels available to download from <a href="https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm" target="_blank">DailyMed</a> as of November 10, 2022 were processed in this analysis. In total 2.8 million adverse reactions were extracted from over 45,000 labels for just under 2,000 drugs (single agents or combinations).</p>

                <p>
                    OnSIDES was created using the <a href="https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract" target="_blank">PubMedBERT language model</a> and 200 manually curated labels available from <a href="https://pubmed.ncbi.nlm.nih.gov/29381145/" target="_blank">Denmer-Fushman et al.</a>D. The model achieves an F1 score of 0.90, AUROC of 0.92, and AUPR of 0.95 at extracting effects from the ADVERSE REACTIONS section of the label. This constitutes an absolute increase of 4% in each of the performance metrics over v1.0.0. For the BOXED WARNINGS section, the model achieves a F1 score of 0.71, AUROC of 0.85, and AUPR of 0.72. This constitutes an absolute increase of 10-17% in the performance metrics over v1.0.0. Compared against the TAC reference standard using the official evaluation script the model achieves a Micro-F1 score of 0.87 and a Macro-F1 of 0.85.
                </p>
                <p>
                    <a href="https://github.com/tatonetti-lab/onsides" target="_blank">For more information, read our github!</a>
                </p>
                
                

            </Container>
        </div>
    )
}