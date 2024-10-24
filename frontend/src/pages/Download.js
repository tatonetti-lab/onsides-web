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
          The data are available as a set of SQL tables or as flat files in CSV
          format.
        </p>

        <p>
          <b>SQL file</b>: <br />{" "}
          <a
            href="https://github.com/tatonetti-lab/onsides/releases/download/v01/onsides_v01_20220430.sql.gz"
            target="_blank"
            rel="noreferrer"
          >
            onsides_v01_20220430.sql.gz
          </a>{" "}
          (81MB, md5:b386e9485e943120c9a783edf843d68e){" "}
        </p>
        <p>
          <b>CSV files</b>: <br />{" "}
          <a
            href="https://github.com/tatonetti-lab/onsides/releases/download/v01/onsides_v01_20220430.tar.gz"
            target="_blank"
            rel="noreferrer"
          >
            onsides_v01_20220430.tar.gz
          </a>{" "}
          (81MB, md5:f73ded83cf5edc63447f6ca8b80add66)
        </p>

        <br />

        <h5>Note</h5>
        <p>
          The Onsides database is intended for research purposes only. The
          extraction process is far from perfect, side effects will be missed
          and some identified will be incorrect. Patients seeking health
          information should not trust these data and instead refer to the FDA's
          website (fda.gov) and consult their doctor.
        </p>
        <p>
          The project is under active development. Validation of extracted
          information is yet to be independently verified and the data, methods,
          and statistics are subject to change at any time. Check back to this
          page for updates. If you would like to to contribute to the project or
          have ideas on how the methods, data, or evaluation can be improved
          please reach out to Dr. Tatonetti via email or Twitter.
        </p>
      </Container>
    </div>
  );
}

