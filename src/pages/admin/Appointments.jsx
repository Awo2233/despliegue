// src/pages/admin/AdminAppointments.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, scheduled_at, status, specialist_role,
        patient:profiles!appointments_patient_id_fkey(full_name),
        specialist:profiles!appointments_specialist_id_fkey(full_name)
      `)
      .order("scheduled_at", { ascending: false });

    if (error) console.error(error);
    else setAppointments(data || []);
    setLoading(false);
  };

  const deleteAppointment = async (id) => {
    if (!confirm("¿Eliminar cita?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) alert("No se pudo eliminar la cita");
    else fetchAppointments();
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.patient?.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
      a.specialist?.full_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Gestión de Citas</h2>

      <button
        onClick={() => navigate("/admin/new-appointment")}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        + Agendar nueva cita
      </button>

      <input
        type="text"
        placeholder="Buscar por paciente o especialista..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px" }}>
        {loading ? (
          <p>Cargando...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No hay citas.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f4ff", textAlign: "left" }}>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Especialista</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td>{a.patient?.full_name || "Sin nombre"}</td>
                  <td>
                    {a.specialist
                      ? a.specialist.full_name
                      : `No asignado (${a.specialist_role || "rol no definido"})`}
                  </td>
                  <td>{a.status}</td>
                  <td>
                    <button
                      onClick={() => deleteAppointment(a.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
