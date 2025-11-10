// src/pages/specialist/SpecialistAppointments.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.id) fetchAppointments();
  }, [profile]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, scheduled_at, status, specialist_role,
        patient_id, created_at,
        patient:profiles!appointments_patient_id_fkey(full_name)
      `)
      .eq("specialist_role", profile.role)
      .order("scheduled_at", { ascending: true });

    if (error) console.error(error);
    else setAppointments(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error al actualizar cita");
    } else {
      fetchAppointments();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Citas Asignadas ({profile.role})
      </h2>

      <button
        onClick={() => navigate("/specialist/new-appointment")}
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

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px" }}>
        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No hay citas registradas.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f4ff", textAlign: "left" }}>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td>{a.patient?.full_name || "Desconocido"}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => updateStatus(a.id, "done")}
                          style={{
                            background: "#28a745",
                            color: "white",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            marginRight: "8px",
                          }}
                        >
                          Hecha
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, "canceled")}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
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
