import React from "react";
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'

import Search from "./Search";

export default function Header() {

    return (

        <div className="headerfooter">

            <Navbar expand="lg">
                <Container style={{width: "100%"}}>
                    <Navbar.Brand href="/">OnSIDES</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/drugs">Drugs</Nav.Link>
                            <Nav.Link href="/adverse">Adverse Reactions</Nav.Link>
                            <Nav.Link href="/download">Download</Nav.Link>
            
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

        </div>

    )
}