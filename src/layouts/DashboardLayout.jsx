// src/layouts/DashboardLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Layout.css";

export default function DashboardLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const hideSidebar = location.pathname === "/dashboard";

  return (
    <div className="layout-container">
      {!hideSidebar && <Sidebar role={profile?.role} />}

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
