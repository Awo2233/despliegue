import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AppointmentsList() {
  const { profile } = useAuth(); // <-- Nombre del paciente
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logoPath = "/logo.png"; // debe estar en /public/

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
          profiles!appointments_specialist_id_fkey(full_name)
        `)
        .eq("patient_id", profile.id)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      alert("Error cargando citas.");
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
        .eq("patient_id", profile.id);

      if (error) throw error;

      alert("Cita cancelada.");
      fetchAppointments();
    } catch {
      alert("No se pudo cancelar la cita.");
    }
  };

  // 🔥 PDF PROFESIONAL PREMIUM
  const downloadPDF = async (appointment) => {
    const doc = new jsPDF();

    // LOGO
    const logo = new Image();
    logo.src = logoPath;

    logo.onload = () => {
      // Fondo superior elegante
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, 210, 40, "F");

      doc.addImage(logo, "PNG", 10, 8, 26, 26);

      // Nombre de la empresa
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("JBSOPTICS", 45, 20);

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Confirmación de Cita Médica", 45, 30);

      // Línea elegante
      doc.setDrawColor(180, 180, 180);
      doc.line(10, 42, 200, 42);

      // Datos de la cita
      const fecha = new Date(appointment.scheduled_at).toLocaleString("es-CO");
      const direccion = "Cl. 142a #111-27, Bogotá";
      const especialistaRol = appointment.specialist_role;
      const nombreEspecialista = appointment.profiles?.full_name || "Especialista";
      const nombrePaciente = profile.full_name; // <-- agregado

      // 🟦 TARJETA DE DATOS
      autoTable(doc, {
        startY: 55,
        theme: "plain",
        styles: { fontSize: 12, cellPadding: 6 },
        headStyles: { fillColor: [0, 0, 0] },
        bodyStyles: { fillColor: [250, 250, 250] },
        tableWidth: "auto",
        body: [
          ["Paciente", nombrePaciente],
          ["Fecha de la cita", fecha],
          ["Especialista (rol)", especialistaRol],
          ["Nombre del especialista", nombreEspecialista],
          ["Dirección", direccion],
        ],
      });

      // Pie de página elegante
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Gracias por confiar en JBSOPTICS", 10, 285);

      doc.save(`cita-${appointment.id}.pdf`);
    };
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
        <h1>Mis Citas</h1>

        <button
          onClick={() => navigate("/patient/new-appointment")}
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
          <p>No tienes citas registradas.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>Fecha</th>
                <th>Especialista</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.scheduled_at).toLocaleString("es-CO")}</td>
                  <td>{a.specialist_role}</td>
                  <td>Cl. 142a #111-27, Bogotá</td>
                  <td>{a.status}</td>

                  <td style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => downloadPDF(a)}
                      style={{
                        background: "#0d6efd",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Descargar PDF
                    </button>

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
