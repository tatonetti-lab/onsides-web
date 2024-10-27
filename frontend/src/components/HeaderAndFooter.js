import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function HeaderAndFooter() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mt-3 mb-16">
        <Header />
      </div>
      <div className="mb-20">
        <Outlet />
      </div>
      <div className="mb-12">
        <Footer />
      </div>
    </div>
  );
}
