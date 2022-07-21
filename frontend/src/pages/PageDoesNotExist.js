import React from "react";

import Container from 'react-bootstrap/Container'

import Search from "../components/Search";

export default function PageDoesNotExist() {
    return (
        <div>
            <Container>
            <h1> Whoops! This page does not exist. </h1>
            <br />
            <p>Want to try your search again?</p>
            <Search />
            </Container>
        </div>
    )
}