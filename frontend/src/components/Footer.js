import React from "react";
import { AiOutlineTwitter } from "react-icons/ai";
import { AiFillGithub } from "react-icons/ai";
import Container from "react-bootstrap/Container";

export default function Footer() {
  return (
    <div className="headerfooter">
      <Container>
        <div className="flex flex-row justify-between">
          <div>
            <a href="https://tatonettilab.org/">
              © 2024 Tatonetti Lab @ Cedars-Sinai Medical Center
            </a>
          </div>
          <div className="flex flex-row">
            Follow us
            <a
              href="https://twitter.com/proftatonetti"
              className="flex items-center mx-2"
            >
              <AiOutlineTwitter className="inline-block" /> @proftatonetti
            </a>
            and
            <a
              href="https://github.com/tatonetti-lab"
              className="flex items-center mx-2"
            >
              <AiFillGithub className="inline-block" /> @tatonetti-lab
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
