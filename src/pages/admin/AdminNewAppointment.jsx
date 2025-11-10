// src/pages/admin/AdminNewAppointment.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminNewAppointment() {
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    specialist_id: "",
    scheduled_at: "",
  });
  const [patients, setPatients] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const [{ data: pat }, { data: spec }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("role", "patient"),
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["optometrist", "ortoptist"]),
    ]);
    setPatients(pat || []);
    setSpecialists(spec || []);
  };

  const createAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.patient_id || !newAppointment.specialist_id || !newAppointment.scheduled_at)
      return alert("Completa todos los campos");

    const specialist = specialists.find((s) => s.id === newAppointment.specialist_id);

    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: newAppointment.patient_id,
        specialist_id: newAppointment.specialist_id,
        specialist_role: specialist?.role || null,
        scheduled_at: newAppointment.scheduled_at,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear cita");
    } else {
      alert("Cita creada correctamente");
      navigate("/admin/appointments");
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "700px",
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
            width: "100%",
            marginBottom: "1rem",
            padding: "8px",
          }}
        >
          <option value="">-- Selecciona paciente --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>

        <label>Especialista:</label>
        <select
          value={newAppointment.specialist_id}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, specialist_id: e.target.value })
          }
          style={{
            display: "block",
            width: "100%",
            marginBottom: "1rem",
            padding: "8px",
          }}
        >
          <option value="">-- Selecciona especialista --</option>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.role})
            </option>
          ))}
        </select>

        <label>Fecha y hora:</label>
        <input
          type="datetime-local"
          value={newAppointment.scheduled_at}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, scheduled_at: e.target.value })
          }
          style={{
            display: "block",
            width: "100%",
            marginBottom: "1.5rem",
            padding: "8px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/appointments")}
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
