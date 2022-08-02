import React, { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./css/search.css"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { BiSearchAlt2 } from "react-icons/bi"

import SearchResultsLists from "./SearchResultsLists";

import { queryKeyword } from "../api/onsides";


export default function Search() {

    const popupResults = useRef();

    const navigate = useNavigate();

    const [queryValue, setQueryValue] = useState("")
    const [drugsResults, setDrugsResults] = useState([]);
    const [reactionsResults, setReactionsResults] = useState([]);
    const [timer, setTimer] = useState(null);

    // go to search results page
    const handleSubmit = (event) => {
        event.preventDefault();

        navigate({
            pathname: "/search",
            search: "?q=" + queryValue,
        });
        
    }

    const handleChange = (event) => {
        let query = event.target.value.toLowerCase();
	let prevQueryValue = queryValue;
        console.log("handling query " + query);

	setQueryValue( query );
        
        if (query.length >= 3) {

		clearTimeout(timer);

		const newTimer = setTimeout(() => {
		    console.log("api call");
            	    queryKeyword(query)
            	        .then(res => {

                	    setDrugsResults( res.drugs )       
                	    setReactionsResults( res.adverse_reactions );

            	        })
		}, 500)

                setTimer(newTimer);

            popupResults.current.style.display = "block";

        }
        else {
            setDrugsResults( [] );
            setReactionsResults( [] );

            popupResults.current.style.display = "none";
        }


    }

    return (
        <Form onSubmit={handleSubmit} className="search-form">
            <Row>
                <Col xs={9}>
                    <Form.Control value={queryValue} onChange={handleChange} type="text" placeholder="Search" />
                </Col>
                <Col>
                    <Button type="submit" variant="dark"><BiSearchAlt2 /></Button>
                </Col>
            </Row>
            <Row>
                
                <Col xs={9}>
                <div ref={popupResults} className="popup-search-results">

                    <SearchResultsLists drugsResults={drugsResults.slice(0,11)} reactionsResults={reactionsResults.slice(0,11)} />

                    <a href="#" onClick={handleSubmit}> See all results </a>
                    
                </div>
                </Col>
            </Row>
        </Form>
    )
}
