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

                <p> Initial release of the Onsides database of adverse reactions and boxed warnings extracted from the FDA structured product labels. All labels available to download from <a href="https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm" target="_blank">DailyMed</a> as of April 2022 were processed in this analysis. In total 2.7 million adverse reactions were extracted from 42,000 labels for just under 2,000 drug ingredients or combination of ingredients.</p>

                <p>Onsides was created using the ClinicalBERT language model and 200 manually curated labels available from <a href="https://pubmed.ncbi.nlm.nih.gov/29381145/" target="_blank">Denmer-Fushman et al.</a>. The model achieves an F1 score of 0.86, AUROC of 0.88, and AUPR of 0.91 at extracting effects from the ADVERSE REACTIONS section of the label and an F1 score of 0.66, AUROC of 0.71, and AUPR of 0.60 at extracting effects from the BOXED WARNINGS section. </p>
                
                

            </Container>
        </div>
    )
}