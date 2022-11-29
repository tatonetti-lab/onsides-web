import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Spinner from "./Spinner";

import "./css/searchresultslists.css"

export default function SearchResultsLists(props) {

    return (

        <>

            <div className="results-lists">
            <div className="results-drugs">
                <h5>Drugs:</h5>
                {props.drugsResults.length !== 0 ?
                    <ul>
                        {props.drugsResults.map((item) => (
                           <li key={item.id}> <Link to={"/drugs/"+item.id}>{item.name}</Link> </li>
                        ))}
                    </ul>
                    :
                    props.loading ? 
                        <Spinner /> :
                        <p> No results for drugs. </p>
                    }
            </div>

            <div className="results-reactions">
                <h5>Reactions:</h5>
                {props.reactionsResults.length !== 0 ?
                    <ul>
                        {props.reactionsResults.map((item) => (
                            <li key={item.id}> <Link to={"/adverse/"+item.id}>{item.name}</Link> </li>
                        ))}
                    </ul>
                    :
                    props.loading ? 
                        <Spinner /> :
                        <p> No results for adverse reactions. </p>
                }
            </div>
            </div>
        </>
    )
}