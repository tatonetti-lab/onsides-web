import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { useParams, Link } from "react-router-dom";
import { getDefiniton } from "../api/bioontology";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'


import PageDoesNotExist from "./PageDoesNotExist";

import { getDrugsByAdverseReaction } from "../api/onsides";

import "./css/adversereaction.css";

import Spinner from "../components/Spinner";

export default function AdverseReaction() {

    const params = useParams();

    const [drugs, setDrugs] = useState([])
    const [adverseReaction, setAdverseReaction] = useState("")
    const [desc, setDesc] = useState();

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        getDrugsByAdverseReaction(params.id)
            .then(res => {
                setDrugs(res.drugs);

                let term_name = res.adverse_reaction[0].concept_name;

                setAdverseReaction(term_name);

                setLoading(false);

                getDefiniton(term_name)
                    .then(res => {
                        setDesc(res)
                    })            
            });

    }, [params.id])

    return (
        <div className="body">

            {adverseReaction === null ?
                <PageDoesNotExist />
                :
                (

                    <Container>

                        { loading ? 
                            <Spinner /> : 
                            (<>

                        <div className="home-title">
                            <h2> {adverseReaction} </h2>

                            
                            <p> {desc === undefined ? "" : 
                            <span>
                                {desc} 
                                &nbsp;
                                <OverlayTrigger 
                                    placement="bottom"
                                    delay={{ show: 100, hide: 400 }}
                                    overlay={
                                        <Tooltip>
                                            <span>
                                                Definition from the National Cancer Institute Thesaurus using the National Center for Biomedical Ontology's BioPortal
                                            </span>
                                        </Tooltip>}
                                >
                                    <span><a href="https://bioportal.bioontology.org/ontologies/NCIT" target="_blank">*</a></span>
                                </OverlayTrigger>

                                
                            </span>} 
                            </p>
                        </div>

                        <br />
                        <br />

                        <h5>Drugs associated with adverse reaction:</h5>

                        <ul className="adverse-reaction-list">
                        {drugs.map((item) => (
                            <li key={item.drug_concept_ids}>
                                {item.ingredients.split(",").length === 1 ?
                                    <Link to={"/drugs/" + item.drug_concept_ids}>{item.ingredients}</Link>
                                    :
                                    item.ingredients.split(",").map((ind_drug, index) => (
                                        <>
                                            <Link key={index} to={"/drugs/" + item.drug_concept_ids.split(", ")[index]}>{ind_drug.trim()}</Link>

                                            {index !== item.ingredients.split(",").length - 1 ? ", " : ""}
                                        </>

                                    ))

                                }
                            </li>
                        ))}
                        </ul>

                    </>)}
                    </Container>

                )
            }



        </div>
    )
}