import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";


export default function AppointmentsCreate() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);

  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    scheduled_date: "",
    scheduled_time: "",
  });

  // ============================
  //   🔹 Cargar perfil especialista
  // ============================
  const loadProfile = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.data.user.id)
      .single();

    setProfile(data);
  };

  // ============================
  //   🔹 Cargar pacientes
  // ============================
  const loadPatients = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "patient");

    setPatients(data || []);
  };

  useEffect(() => {
    loadProfile();
    loadPatients();
  }, []);

  // ============================
  //   🔹 Crear la cita (completo)
  // ============================
  const createAppointment = async (e) => {
    e.preventDefault();

    if (!newAppointment.patient_id || !newAppointment.scheduled_date || !newAppointment.scheduled_time) {
      alert("Completa todos los campos");
      return;
    }

    const selectedDate = new Date(
      `${newAppointment.scheduled_date}T${newAppointment.scheduled_time}:00`
    );
    const now = new Date();

    // ❌ No permitir fechas pasadas
    if (selectedDate < now) {
      alert("No puedes seleccionar una fecha anterior a la actual.");
      return;
    }

    // ⏰ Validar horario entre 8:00 AM y 4:00 PM
    const hour = selectedDate.getHours();
    if (hour < 8 || hour >= 16) {
      alert("Solo puedes agendar citas entre las 8:00 a.m. y las 4:00 p.m.");
      return;
    }

    const scheduledAtISO = selectedDate.toISOString();

    // ===========================================
    //   🔍 VALIDAR DISPONIBILIDAD DEL ESPECIALISTA
    // ===========================================
    const { data: existing, error: existingError } = await supabase
      .from("appointments")
      .select("id")
      .eq("specialist_id", profile.id)
      .eq("scheduled_at", scheduledAtISO)
      .eq("status", "scheduled");

    if (existingError) {
      console.error(existingError);
      alert("Error verificando disponibilidad del especialista");
      return;
    }

    if (existing && existing.length > 0) {
      alert("⚠️ El especialista ya tiene una cita en esa fecha y hora.");
      return;
    }

    // ============================
    //   🟢 Insertar cita
    // ============================
    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: newAppointment.patient_id,
        specialist_id: profile.id,
        specialist_role: profile.role,
        scheduled_at: scheduledAtISO,
        created_by: profile.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear cita");
    } else {
      alert("✅ Cita creada correctamente");
      navigate("/specialist/appointments");
    }
  };

  return (
    <div className="create-appointment-wrapper">
      <div className="card create-appointment-card">
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

        <label>Fecha:</label>
        <input
          type="date"
          value={newAppointment.scheduled_date}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, scheduled_date: e.target.value })
          }
          min={new Date().toISOString().slice(0, 10)}
          style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "8px" }}
        />

        <label>Hora:</label>
        <select
          value={newAppointment.scheduled_time}
          onChange={(e) =>
            setNewAppointment({ ...newAppointment, scheduled_time: e.target.value })
          }
          style={{ display: "block", width: "100%", marginBottom: "1.5rem", padding: "8px" }}
        >
          <option value="">-- Selecciona hora --</option>
          {[
            "08:00",
            "08:30",
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
          ].map((t) => (
            <option key={t} value={t}>
              {(() => {
                const [hh, mm] = t.split(":");
                let hour = parseInt(hh, 10);
                const ampm = hour >= 12 ? "pm" : "am";
                if (hour > 12) hour = hour - 12;
                return `${hour}:${mm} ${ampm}`;
              })()}
            </option>
          ))}
        </select>

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
    </div>
  );
}
