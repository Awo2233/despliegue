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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Gestión de Citas</h1>
        <button
          onClick={() => navigate("/admin/new-appointment")}
          className="btn btn-primary"
          style={{ padding: "8px 12px", fontSize: "0.9rem" }}
        >
          ➕ Nueva cita
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por paciente o especialista..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "8px 12px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid rgba(0,72,255,0.1)",
        }}
      />

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No hay citas.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr style={{ textAlign: "left" }}>
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
