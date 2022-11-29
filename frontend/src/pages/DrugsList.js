import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";

import PaginatedItems from "../components/Pagination";

import { getAllDrugs } from "../api/onsides";

import Spinner from "../components/Spinner";

export default function DrugsList() {

    const [drugs, setDrugs] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        getAllDrugs()
            .then(res => {
                setDrugs(res.drugs);
                setLoading(false);
            })
    }, [])

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
        <div>
            <Container>


                <div className="home-title">
                    <h2> Drug Products </h2>
                </div>

                <br />

                { loading ? 

                    <Spinner/> 
                    : 
                    <PaginatedItems itemsPerPage={100} ItemsComponent={Items} items={drugs} />

                }

            </Container>
        </div>
    )
}