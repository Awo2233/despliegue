// src/pages/admin/Reports.jsx
import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import * as XLSX from "xlsx";

export default function Reports() {
  const [loading, setLoading] = useState(false);

  // 🧩 Función para exportar cualquier tabla a Excel
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // 🔹 Reporte de usuarios / pacientes
  const downloadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at");

      if (error) throw error;
      exportToExcel(data, "usuarios_y_pacientes");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al generar el reporte de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reporte de citas
  const downloadAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          status,
          specialist_role,
          created_at,
          patient:patient_id (full_name, email)
        `);

      if (error) throw error;

      const formatted = data.map((row) => ({
        ID: row.id,
        Paciente: row.patient?.full_name || "Sin nombre",
        Email: row.patient?.email || "Sin correo",
        Especialista: row.specialist_role,
        Estado: row.status,
        Fecha_Cita: row.scheduled_at,
        Creado_En: row.created_at,
      }));

      exportToExcel(formatted, "citas");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al generar el reporte de citas.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reporte de exámenes
  const downloadExams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          id,
          scheduled_at,
          performed,
          observations,
          specialist_role,
          created_at,
          patient:patient_id (full_name, email)
        `);

      if (error) throw error;

      const formatted = data.map((row) => ({
        ID: row.id,
        Paciente: row.patient?.full_name || "Sin nombre",
        Email: row.patient?.email || "Sin correo",
        Especialista: row.specialist_role,
        Realizado: row.performed ? "Sí" : "No",
        Observaciones: row.observations || "",
        Fecha: row.scheduled_at,
        Creado_En: row.created_at,
      }));

      exportToExcel(formatted, "examenes");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al generar el reporte de exámenes.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reporte de remisiones
  const downloadReferrals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          id,
          reason,
          from_role,
          to_role,
          created_at,
          patient:patient_id (full_name, email)
        `);

      if (error) throw error;

      const formatted = data.map((row) => ({
        ID: row.id,
        Paciente: row.patient?.full_name || "Sin nombre",
        Email: row.patient?.email || "Sin correo",
        De: row.from_role,
        Para: row.to_role,
        Motivo: row.reason,
        Creado_En: row.created_at,
      }));

      exportToExcel(formatted, "remisiones");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al generar el reporte de remisiones.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-appointment-wrapper">
      <div className="card create-appointment-card" style={{ maxWidth: 700 }}>
        <h2 style={{ marginBottom: "1rem" }}>📊 Reportes del sistema</h2>
        <p>Descarga la información de cada módulo en formato Excel.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          <button className="btn btn-ghost" onClick={downloadUsers} disabled={loading} style={{ textAlign: "left", width: "100%", padding: "12px 16px" }}>
            📁 Descargar usuarios / pacientes
          </button>
          <button className="btn btn-ghost" onClick={downloadAppointments} disabled={loading} style={{ textAlign: "left", width: "100%", padding: "12px 16px" }}>
            📅 Descargar citas
          </button>
          <button className="btn btn-ghost" onClick={downloadExams} disabled={loading} style={{ textAlign: "left", width: "100%", padding: "12px 16px" }}>
            🧾 Descargar exámenes
          </button>
          <button className="btn btn-ghost" onClick={downloadReferrals} disabled={loading} style={{ textAlign: "left", width: "100%", padding: "12px 16px" }}>
            🩺 Descargar remisiones
          </button>
        </div>
      </div>
    </div>
  );
}
