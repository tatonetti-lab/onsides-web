import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";

import PaginatedItems from "../components/Pagination";

import { getAllDrugs } from "../api/onsides";

export default function DrugsList() {

    const [drugs, setDrugs] = useState([])

    useEffect(() => {
        getAllDrugs()
            .then(res => {
                setDrugs(res.drugs);
            })
    }, [])

    function Items({ currentItems }) {
        return (
            <>
                <ul className="pagination-items">
                {currentItems &&
                    currentItems.map((item) => (
                        <li key={item.ingredient_concept_id}> <Link to={"/drugs/" + item.ingredient_concept_id}>{item.ingredient_concept_name}</Link></li>
                    ))}
                </ul>
            </>
        );
    }

    return (
        <div>
            <Container>


                <div className="home-title">
                    <h2> Drug Products </h2>
                </div>

                <br />

                <PaginatedItems itemsPerPage={100} ItemsComponent={Items} items={drugs} />


            </Container>
        </div>
    )
}