import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewAppointment() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialist_role: "optometrist",
    scheduled_date: "",
    scheduled_time: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduled_date || !form.scheduled_time)
      return alert("Por favor selecciona una fecha y una hora.");

    const selectedDate = new Date(`${form.scheduled_date}T${form.scheduled_time}:00`);
    const now = new Date();

    // ⛔ No permitir fechas anteriores a la actual
    if (selectedDate < now) {
      alert("No puedes seleccionar una fecha anterior a la actual.");
      return;
    }

    // 🕗 Validar horario entre 8am y 4pm
    const hour = selectedDate.getHours();
    if (hour < 8 || hour >= 16) {
      alert("Solo puedes agendar citas entre las 8:00 a.m. y las 4:00 p.m.");
      return;
    }

    setLoading(true);

    try {
      // 🔍 Verificar si ya hay una cita ocupando esa fecha y hora con ese especialista
      const scheduledAtISO = selectedDate.toISOString();
      const { data: existing, error: existingError } = await supabase
        .from("appointments")
        .select("id")
        .eq("scheduled_at", scheduledAtISO)
        .eq("specialist_role", form.specialist_role)
        .eq("status", "scheduled");

      if (existingError) throw existingError;

      if (existing.length > 0) {
        alert(
          "Esa fecha y hora ya están ocupadas. Por favor selecciona otra."
        );
        setLoading(false);
        return;
      }

      // 📝 Crear la nueva cita
      const { error } = await supabase.from("appointments").insert([
        {
          patient_id: profile.id,
          specialist_role: form.specialist_role,
          scheduled_at: scheduledAtISO,
          status: "scheduled",
          created_by: profile.id,
        },
      ]);

      if (error) throw error;

      alert("✅ Cita agendada correctamente.");
      navigate("/patient/appointments");
    } catch (err) {
      console.error("Error al crear cita:", err.message);
      alert("Error al crear la cita: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-appointment-wrapper">
      <div className="card create-appointment-card create-appointment-card--small">
        <h2>Agendar nueva cita</h2>
        <form onSubmit={handleSubmit}>
        <label>Tipo de especialista:</label>
        <select
          name="specialist_role"
          value={form.specialist_role}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "0.5rem 0" }}
        >
          <option value="optometrist">Optometrista</option>
          <option value="ortoptist">Ortoptista</option>
        </select>

        <label>Fecha:</label>
        <input
          type="date"
          name="scheduled_date"
          value={form.scheduled_date}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
          style={{ width: "100%", padding: "8px", margin: "0.5rem 0" }}
        />

        <label>Hora:</label>
        <select
          name="scheduled_time"
          value={form.scheduled_time}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", margin: "0.5rem 0 1rem 0" }}
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

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              flex: 1,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creando..." : "Crear cita"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/patient/appointments")}
            style={{
              background: "#ccc",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Cancelar
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
