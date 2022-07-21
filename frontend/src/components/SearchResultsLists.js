import React, { useEffect } from "react";
import { Link } from "react-router-dom";

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
                           <li key={item.ingredient_concept_id}> <Link to={"/drugs/"+item.ingredient_concept_id}>{item.ingredient_concept_name}</Link> </li>
                        ))}
                    </ul>
                    :
                    <p> No results for drugs. </p>}
            </div>

            <div className="results-reactions">
                <h5>Reactions:</h5>
                {props.reactionsResults.length !== 0 ?
                    <ul>
                        {props.reactionsResults.map((item) => (
                            <li key={item.meddra_id}> <Link to={"/adverse/"+item.meddra_id}>{item.concept_name}</Link> </li>
                        ))}
                    </ul>
                    :
                    <p> No results for adverse reactions. </p>
                }
            </div>
            </div>
        </>
    )
}