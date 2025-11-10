import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AppointmentsList() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.id) fetchAppointments();
  }, [profile]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          status,
          specialist_role,
          created_at,
          specialist_id,
          profiles!appointments_specialist_id_fkey(full_name)
        `)
        .eq("patient_id", profile.id)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Error al cargar citas:", err.message);
      alert("Error al cargar las citas. Verifica tu conexión o permisos.");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta cita?")) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "canceled" })
        .eq("id", id)
        .eq("patient_id", profile.id); // <- asegura que solo pueda cancelar sus citas

      if (error) throw error;

      alert("La cita ha sido cancelada correctamente.");
      fetchAppointments();
    } catch (err) {
      console.error("Error al cancelar cita:", err.message);
      if (err.message.includes("RLS")) {
        alert(
          "No tienes permisos para cancelar esta cita. Verifica la política RLS en Supabase."
        );
      } else {
        alert("No se pudo cancelar la cita. Inténtalo nuevamente.");
      }
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.8rem" }}>Mis Citas</h2>
        <button
          onClick={() => navigate("/patient/new-appointment")}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Agendar nueva cita
        </button>
      </div>

      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No tienes citas registradas.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f4ff", textAlign: "left" }}>
                <th>Fecha</th>
                <th>Especialista</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td>{a.specialist_role}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.status === "scheduled" && (
                      <button
                        onClick={() => cancelAppointment(a.id)}
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
