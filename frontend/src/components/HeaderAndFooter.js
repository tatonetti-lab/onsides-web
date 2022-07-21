import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

export default function HeaderAndFooter() {

    return (
        <>

        <div style={{height: "15px"}}></div>

        <Header />

        <div style={{height: "50px"}}></div>

        <Outlet />

        <div style={{height: "50px"}}></div>

        <Footer />

        <div style={{height: "50px"}}></div>
        
        </>
    )
}