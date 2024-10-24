import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import "./css/drug.css";
import { AiOutlineCheck, AiOutlineSortAscending } from "react-icons/ai";
import { BsSortNumericDown } from "react-icons/bs";
import { getDrugInfo } from "../api/onsides";
import PageDoesNotExist from "./PageDoesNotExist";
import Spinner from "../components/Spinner";

export default function Drug() {
  const table = useRef();
  const params = useParams();

  const [drug, setDrug] = useState([]);
  const [currentLabelsIndex, setCurrentLabelsIndex] = useState(0);
  const [drugName, setDrugName] = useState("");
  const [drugLabels, setDrugLabels] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDrugInfo(params.id).then((res) => {
      setDrugName(res.drug_name);
      const temp = [];
      for (let i = 0; i < res.drug_labels.length; i += 100) {
        const chunk = res.drug_labels.slice(i, i + 100);
        temp.push(chunk);
      }
      setDrugLabels(temp);
      setDrug(res.drug_info);
      setLoading(false);
    });
  }, [params.id]);

  const addColumnHighlight = (event) => {
    if (event.target.cellIndex) {
      let index = event.target.cellIndex + 1;
      let selectedCol = document.querySelectorAll(
        "td:nth-child(" + index + ")",
      );
      selectedCol.forEach((el) => {
        el.style.backgroundColor = "#f2f2f2f2";
      });
    }
  };

  const removeColumnHighlight = (event) => {
    if (event.target.cellIndex) {
      let index = event.target.cellIndex + 1;
      let selectedCol = document.querySelectorAll(
        "td:nth-child(" + index + ")",
      );
      selectedCol.forEach((el) => {
        el.style.backgroundColor = "#fff";
      });
    }
  };

  const sortData = (data, sortConfig) => {
    if (sortConfig.key === null) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  // Then in your component, use useMemo to compute sorted data without setting state
  const sortedDrug = useMemo(
    () => sortData(drug, sortConfig),
    [drug, sortConfig],
  );

  // Update your handleSort function
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      {drug === null ? (
        <PageDoesNotExist />
      ) : (
        <Container>
          <h1>{drugName}</h1>
          <br />

          {loading ? (
            <Spinner />
          ) : drugLabels.length === 0 ? (
            <p> No labels found. </p>
          ) : (
            <>
              {drugLabels.length > 1 ? (
                <div className="paginate-labels">
                  View More Labels:
                  {drugLabels.map((item, index) => (
                    <span
                      onClick={() => setCurrentLabelsIndex(index)}
                      key={index}
                      className={
                        currentLabelsIndex === index ? "current-label-set" : ""
                      }
                    >
                      {" "}
                      {index + 1}{" "}
                    </span>
                  ))}
                </div>
              ) : (
                ""
              )}
              <div className="table-container">
                <table ref={table} className="drug-info-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("concept_name")}
                        className="sorted-col fixed-col"
                      >
                        {" "}
                        <h5>
                          Adverse Effects <AiOutlineSortAscending />
                        </h5>{" "}
                      </th>
                      <th
                        onClick={() => handleSort("percent")}
                        className="sorted-col second-col"
                      >
                        {" "}
                        <h5>
                          {" "}
                          Stats <BsSortNumericDown />
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 100, hide: 400 }}
                            overlay={
                              <Tooltip>
                                <span>
                                  Percentage of labels associated with adverse
                                  affect
                                </span>
                              </Tooltip>
                            }
                          >
                            <span>*</span>
                          </OverlayTrigger>
                        </h5>{" "}
                      </th>
                      <th
                        colSpan={drugLabels[currentLabelsIndex].length}
                        className="labels-header"
                      >
                        <h5>Labels</h5>
                      </th>
                    </tr>
                    <tr>
                      <th className="fixed-col"> </th>
                      <th className="second-col"> </th>

                      {drugLabels[currentLabelsIndex].map((item, index) => (
                        <th key={index} className={item.set_id}>
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={
                              <Tooltip>
                                <span>
                                  {item.rx_string}
                                  <br /> <br />
                                  SPL version: {item.spl_version}
                                  <br />
                                  {item.date}
                                </span>
                              </Tooltip>
                            }
                          >
                            <Button size="md" variant="dark">
                              {index + 1}
                            </Button>
                          </OverlayTrigger>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDrug.map((item) => (
                      <tr key={item.concept_code}>
                        <td className="fixed-col">
                          <span>
                            <Link to={"/adverse/" + item.concept_code}>
                              {item.concept_name}
                            </Link>
                          </span>
                        </td>
                        <td className="second-col"> {item.percent}% </td>

                        {drugLabels[currentLabelsIndex].map(
                          (label_item, index) => (
                            <td
                              onMouseEnter={addColumnHighlight}
                              onMouseLeave={removeColumnHighlight}
                              className={label_item.set_id}
                              key={index}
                            >
                              {" "}
                              {item.set_ids.includes(label_item.set_id) ? (
                                <AiOutlineCheck />
                              ) : (
                                ""
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Container>
      )}
    </div>
  );
}
