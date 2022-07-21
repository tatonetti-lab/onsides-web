import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";

import PaginatedItems from "../components/Pagination";

import { getAllAdverseReactions } from "../api/onsides";

export default function AdverseReactionsList() {

    const [adverseReactions, setadverseReactions] = useState([])

    useEffect(() => {
        getAllAdverseReactions()
            .then(res => {
                setadverseReactions(res.adverse_reactions);
            })
    }, [])

    function Items({ currentItems }) {
        return (
            <>
            <ul className="pagination-items">
                {currentItems &&
                    currentItems.map((item) => (
                        <li key={item.meddra_id}> <Link to={"/adverse/"+item.meddra_id}>{item.concept_name}</Link></li>
                    ))}
                    </ul>
            </>
        );
    }

    return (
        <div className="body">
            <Container>

                <div className="home-title">
                    <h2> Adverse Reactions </h2>
                </div>

                <br />

                <PaginatedItems itemsPerPage={100} ItemsComponent={Items} items={adverseReactions} />




            </Container>
        </div>
    )
}