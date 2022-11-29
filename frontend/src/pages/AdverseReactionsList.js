import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";

import PaginatedItems from "../components/Pagination";

import { getAllAdverseReactions } from "../api/onsides";

import Spinner from "../components/Spinner";

export default function AdverseReactionsList() {

    const [adverseReactions, setadverseReactions] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAllAdverseReactions()
            .then(res => {
                setadverseReactions(res.adverse_reactions);
                setLoading(false);
            })
    }, [])

    function Items({ currentItems }) {
        return (
            <>
            <ul className="pagination-items">
                {currentItems &&
                    currentItems.map((item) => (
                        <li key={item.id}> <Link to={"/adverse/"+item.id}>{item.term}</Link></li>
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

                { loading ?
                    
                <Spinner />
                
                : 

                <PaginatedItems itemsPerPage={100} ItemsComponent={Items} items={adverseReactions} />

                }


            </Container>
        </div>
    )
}