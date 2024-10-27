import React from "react";
import { AiOutlineTwitter, AiFillGithub } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="w-full py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-row justify-between items-center flex-wrap gap-4">
          <div className="whitespace-nowrap">
            <a
              href="https://tatonettilab.org/"
              className="no-underline hover:underline"
            >
              © 2024 Tatonetti Lab @ Cedars-Sinai Medical Center
            </a>
          </div>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            Follow us
            <a
              href="https://twitter.com/proftatonetti"
              className="flex items-center mx-2 no-underline hover:underline"
            >
              <AiOutlineTwitter className="inline-block mr-1" />
              @proftatonetti
            </a>
            and
            <a
              href="https://github.com/tatonetti-lab"
              className="flex items-center mx-2 no-underline hover:underline"
            >
              <AiFillGithub className="inline-block mr-1" />
              @tatonetti-lab
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
