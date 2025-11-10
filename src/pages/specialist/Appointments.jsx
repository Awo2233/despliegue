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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Citas Asignadas</h1>
        <button
          onClick={() => navigate("/specialist/new-appointment")}
          className="btn btn-primary"
          style={{ padding: "8px 12px", fontSize: "0.9rem" }}
        >
          ➕ Nueva cita
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No hay citas registradas.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr style={{ background: "var(--color-50)", textAlign: "left" }}>
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
