import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { useParams, Link } from "react-router-dom";
import { getDefiniton } from "../api/bioontology";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import PaginatedItems from "../components/Pagination";

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

                let term_name = res.adverse_reaction[0].name;

                getDefiniton(term_name)
                    .then(res => {
                        setDesc(res)
                    })   

                setAdverseReaction(term_name);

                setLoading(false);

                         
            });

    }, [params.id])


    function Items({ currentItems }) {
        return (
            <>
                <ul className="pagination-items">
                {currentItems &&
                    currentItems.map((item) => (
                        <li key={item.id}> <Link to={"/drugs/" + item.id}>{item.name}</Link></li>
                    ))}
                </ul>
            </>
        );
    }


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

                        {drugs.length > 100 ?
                        <PaginatedItems itemsPerPage={100} ItemsComponent={Items} items={drugs} />
                        :
                        <ul className="adverse-reaction-list">
                        {drugs.map((item) => (
                            <li key={item.id}>
                                
                                    <Link to={"/drugs/" + item.id}>{item.name}</Link>
                                
                            </li>
                        ))}
                        </ul>
                        }

                    </>)}
                    </Container>

                )
            }



        </div>
    )
}