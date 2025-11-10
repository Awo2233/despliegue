// src/pages/specialist/SpecialistNewAppointment.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistNewAppointment() {
  const { profile } = useAuth();
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    scheduled_at: "",
  });
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "patient")
      .order("full_name", { ascending: true });
    if (!error) setPatients(data || []);
  };

  const createAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.patient_id || !newAppointment.scheduled_at)
      return alert("Completa todos los campos");

    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: newAppointment.patient_id,
        specialist_id: profile.id,
        specialist_role: profile.role,
        scheduled_at: newAppointment.scheduled_at,
        created_by: profile.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear cita");
    } else {
      alert("Cita creada correctamente");
      navigate("/specialist/appointments");
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "600px",
        margin: "2rem auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Agendar Nueva Cita</h2>

      <form onSubmit={createAppointment}>
        <label>Paciente:</label>
        <select
          value={newAppointment.patient_id}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, patient_id: e.target.value })
          }
          style={{
            display: "block",
            margin: "0.5rem 0",
            width: "100%",
            padding: "8px",
          }}
        >
          <option value="">-- Selecciona un paciente --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>

        <label>Fecha y hora:</label>
        <input
          type="datetime-local"
          value={newAppointment.scheduled_at}
          onChange={(e) =>
            setNewAppointment({
              ...newAppointment,
              scheduled_at: e.target.value,
            })
          }
          style={{
            display: "block",
            margin: "0.5rem 0 1rem 0",
            width: "100%",
            padding: "8px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={() => navigate("/specialist/appointments")}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Crear cita
          </button>
        </div>
      </form>
    </div>
  );
}
