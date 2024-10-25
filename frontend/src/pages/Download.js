import React from "react";
import Container from "react-bootstrap/Container";

export default function Download() {
  return (
    <div className="body">
      <Container>
        <div className="home-title">
          <h2> Downloads </h2>
        </div>

        <br />
        <br />

        <p>
          This analysis is updated regularly. The latest data are available for
          download in our{" "}
          <a href="https://github.com/tatonetti-lab/onsides/releases">
            GitHub releases
          </a>
          . For more information about the flat files, see the{" "}
          <a href="https://github.com/tatonetti-lab/onsides?tab=readme-ov-file#table-descriptions">
            table descriptions
          </a>
          .
        </p>

        <div className="my-4">
          <a
            href="https://github.com/tatonetti-lab/onsides/releases/latest"
            className="bg-neutral-950 hover:bg-neutral-600 text-white hover:!text-neutral-100 py-2 px-4 rounded-full text-lg no-underline"
          >
            Download Latest Release
          </a>
        </div>

        <h5>Note</h5>
        <p>
          The Onsides database is intended for research purposes only. The
          extraction process is imperfect, side effects will be missed and some
          identified will be incorrect. Patients seeking health information
          should not trust these data and instead refer to the FDA's website
          (fda.gov) and consult their doctor.
        </p>
        <p>
          The project is under active development. Validation of extracted
          information is yet to be independently verified and the data, methods,
          and statistics are subject to change at any time. Check back to this
          page for updates. If you would like to to contribute to the project or
          have ideas on how the methods, data, or evaluation can be improved
          please reach out to Prof. Tatonetti via{" "}
          <a href="mailto:nicholas.tatonetti@cshs.org">email</a> or{" "}
          <a href="https://twitter.com/proftatonetti">Twitter</a>.
        </p>
      </Container>
    </div>
  );
}
