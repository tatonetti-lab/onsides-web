import React from "react";
import Container from 'react-bootstrap/Container'

export default function Download() {

    return (
        <div className="body">
            <Container>
                <div className="home-title">
                <h2> Downloads </h2>
                </div>

                <br />
                <br />

                <p>The latest data are available as flat files in CSV format. For previous releases check out <a href="https://github.com/tatonetti-lab/onsides/releases" target="_blank">our github page</a>.</p>

                <p><b>CSV files</b>: <br/> <a href="https://github.com/tatonetti-lab/onsides/releases/download/v2.0.0-20221112/onsides_v2.0.0_20221112.tar.gz" target="_blank">onsides_v2.0.0_20221110.tar.gz</a> (105MB (md5: d33e49a315f7fa2e6ab7459f11de8e97))</p>

                <br />

                <h5>Note</h5>
                <p>
                    The Onsides database is intended for research purposes only. The extraction process is far from perfect, side effects will be missed and some identified will be incorrect. Patients seeking health information should not trust these data and instead refer to the FDA's website (fda.gov) and consult their doctor.
                </p>
                <p>
                    The project is under active development. Validation of extracted information is yet to be independently verified and the data, methods, and statistics are subject to change at any time. Check back to this page for updates. If you would like to to contribute to the project or have ideas on how the methods, data, or evaluation can be improved please reach out to Dr. Tatonetti via email or Twitter.
                </p>
            </Container>
        </div>
    )
}