import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { useSearchParams } from 'react-router-dom'

import "./css/searchresults.css";

import SearchResultsLists from "../components/SearchResultsLists";

import { queryKeyword } from "../api/onsides";

export default function SearchResults() {

    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get('q')

    const [drugsResults, setDrugsResults] = useState([]);
    const [reactionsResults, setReactionsResults] = useState([]);

    useEffect(() => {

        if (query !== null) {
            queryKeyword(query)
                .then(res => {
                    setDrugsResults( res.drugs );
                    setReactionsResults( res.adverse_reactions );
                })
        }

    },[])

    return (

        <div className="body">
            <Container>

                <div className="home-title">
                <h2> Search Results for {query} </h2>
                </div>

                <div className="results">
                
                    <SearchResultsLists drugsResults={drugsResults} reactionsResults={reactionsResults}/>
                </div>

            </Container>
        </div>
    )
}