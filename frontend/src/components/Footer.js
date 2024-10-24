import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { AiOutlineTwitter } from "react-icons/ai";
import { AiFillGithub } from "react-icons/ai";

export default function Footer() {
  return (
    <div className="headerfooter">
      <Container>
        <Row className="justify-content-between">
          <Col>
            <a
              href="https://tatonettilab.org/"
              target="_blank"
              rel="noreferrer"
            >
              © 2024 Tatonetti Lab @ Cedars-Sinai Medical Center
            </a>
          </Col>
          <Col style={{ textAlign: "right" }}>
            Follow us{" "}
            <a
              href="https://twitter.com/proftatonetti"
              target="_blank"
              rel="noreferrer"
            >
              <AiOutlineTwitter /> @proftatonetti
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/tatonetti-lab"
              target="_blank"
              rel="noreferrer"
            >
              <AiFillGithub /> @tatonetti-lab
            </a>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
