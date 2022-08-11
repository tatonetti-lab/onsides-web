import React, { useState, useEffect } from "react";

import Table from 'react-bootstrap/Table';

import "./css/statstable.css"

import { getStats } from "../api/onsides";

export default function StatsTable() {

    const [stats, setStats] = useState({
        adverseReactions: ".",
        drugs: " ",
        pairs: " "
    });

    useEffect(() => {
        getStats()
            .then(res => {
                setStats({
                    adverseReactions: res.adverse_reactions,
                    drugs: res.drugs,
                    pairs: res.pairs,
                })
            })
    }, [])

    return (

        <Table striped bordered className="stats-table">
            <thead>
                <tr>
                    <th>Drugs</th>
                    <th>Adverse reactions</th>
                    <th>Drugs/adverse reactions pairs</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{stats.drugs}</td>
                    <td>{stats.adverseReactions}</td>
                    <td>{stats.pairs}</td>
                </tr>
            </tbody>
        </Table>
    )
}