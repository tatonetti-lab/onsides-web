import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Button from 'react-bootstrap/Button'

import "./css/drug.css"

import { AiOutlineCheck, AiOutlineSortAscending } from 'react-icons/ai'
import { BsSortNumericDown } from 'react-icons/bs'

import { getDrugInfo } from "../api/onsides";

import PageDoesNotExist from "./PageDoesNotExist";


export default function Drug() {

    const table = useRef();
    const params = useParams();

    const [drug, setDrug] = useState([])

    const [currentLabels, setCurrentLabels] = useState([])

    const [drugName, setDrugName] = useState("");
    const [drugLabels, setDrugLabels] = useState([]);

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    })

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        getDrugInfo(params.id)
            .then(res => {

                //console.log(res)

                setDrugName( res.drug_name );

                //console.log("set name");
                
                /* 
                let temp = []

                while (res.drug_labels.length > 0) {
                    temp.push( res.drug_labels.splice(0, 100));
                }

                setCurrentLabels( temp[0] )
                */

                const temp = [];
                for (let i = 0; i < res.drug_labels.length; i += 100) {
                    const chunk = res.drug_labels.slice(i, i + 100);
                    temp.push(chunk);
                }

                setCurrentLabels( res.drug_labels );
                setDrugLabels( res.drug_labels );

                //console.log("set labels");

                

                setDrug( res.drug_info );

                //console.log( res.drug_info.length )

                //console.log("set info");

                setLoading(false);

            })

    }, [params.id])

    const addColumnHighlight = (event) => {
        //var start = Date.now();

        let cols = document.getElementsByClassName(event.target.classList[0])

        if (event.target.cellIndex) {
            let selectedCol = document.querySelectorAll('td:nth-child(' + event.target.cellIndex + 1  + ')');
            

            let index
            for (index of cols) {
                index.classList.add("highlight")
            }
            //var delta = Date.now() - start;

            //console.log("add ", delta);
        }

    }

    const removeColumnHighlight = (event) => {
        //var start = Date.now();

        let cols = document.getElementsByClassName(event.target.classList[0])

        let index;
        for (index of cols) {
            index.classList.remove("highlight")
        }

        //var delta = Date.now() - start;

        //console.log("rem ", delta);

    }

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }

    useMemo(() => {

        let sortedProducts = [...drug];
        if (sortConfig.key !== null) {
            sortedProducts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setDrug( sortedProducts );

        return sortedProducts;
    }, [sortConfig]);

    return (
        <div>

            {drug === null ?
                <PageDoesNotExist />
                :
                (
                    <Container>
                        <h1>{drugName}</h1>
                        <br />


                        { loading ? 
                            <p> Loading ... </p> 
                            :
                            currentLabels.length === 0 ? 
                                <p> No labels found. </p>
                                :

                            

                        <div className="table-container">
                            <table ref={table} className="drug-info-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort("concept_name")} className="sorted-col fixed-col"> <h5>Adverse Effects <AiOutlineSortAscending /></h5> </th>
                                        <th onClick={() => handleSort("percent")} className="sorted-col second-col"> <h5> Stats <BsSortNumericDown />

                                            <OverlayTrigger
                                                placement="bottom"
                                                delay={{ show: 100, hide: 400 }}
                                                overlay={
                                                    <Tooltip>
                                                        <span>
                                                            Percentage of labels associated with adverse affect
                                                        </span>
                                                    </Tooltip>}
                                            >
                                                <span>*</span>
                                            </OverlayTrigger>

                                        </h5> </th>
                                        <th colSpan={currentLabels.length}> <h5>Labels</h5> </th>
                                    </tr>
                                    <tr>
                                        <th className="fixed-col"> </th>
                                        <th className="second-col"> </th>

                                        {currentLabels.map((item, index) => (
                                            <th key={index} className={item.xml_id}>
                                                <OverlayTrigger
                                                    placement="bottom"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={
                                                        <Tooltip>
                                                            <span>

                                                                {item.rx_string}

                                                                <br/> <br/>
								                                SPL version: {item.spl_version}
                                                                <br/>
                                                                {item.date}

                                                            </span>
                                                        </Tooltip>}
                                                >
                                                    <Button size="md" variant="dark">{index + 1}</Button>
                                                </OverlayTrigger>
                                            </th>
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {drug.map((item) => (
                                        <tr key={item.concept_code}>
                                            <td className="fixed-col">
                                                
                                                    <span><Link to={"/adverse/"+item.concept_code}>{item.concept_name}</Link></span>
                                                


                                            </td>
                                            <td className="second-col"> {item.percent}% </td>

                                            {currentLabels.map((label_item) => (
                                                <td onMouseEnter={addColumnHighlight} onMouseLeave={removeColumnHighlight} className={label_item.xml_id} key={label_item.xml_id}> {item.xml_ids.includes(label_item.xml_id) ? <AiOutlineCheck /> : ""}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                    </Container>
                )
            }

        </div>
    )
}
