import React from "react";
import Container from 'react-bootstrap/Container'

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { AiOutlineTwitter } from "react-icons/ai"
import { AiFillGithub } from "react-icons/ai"

export default function Footer() {

    return (
        <div className="headerfooter">

            <Container>
                <Row className="justify-content-between">
                    <Col> 
                        <a href="https://tatonettilab.org/" target="_blank">© 2022 Tatonetti Lab @ Columbia University</a>
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                        Follow us  <a href="https://twitter.com/nicktatonetti" target="_blank"><AiOutlineTwitter /> @nicktatonetti</a> and  <a href="https://github.com/tatonetti-lab" target="_blank"><AiFillGithub /> @tatonetti-lab</a>
                    </Col>
                </Row>
            </Container>

        </div>
    )
}