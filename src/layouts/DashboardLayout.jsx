// src/layouts/DashboardLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Layout.css";

export default function DashboardLayout() {
  const { profile } = useAuth();

  return (
    <div className="layout-container">
      <Sidebar role={profile?.role} />

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
