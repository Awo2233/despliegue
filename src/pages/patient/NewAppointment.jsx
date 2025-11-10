import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewAppointment() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialist_role: "optometrist",
    scheduled_at: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduled_at)
      return alert("Por favor selecciona una fecha y hora.");

    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: profile.id,
        specialist_role: form.specialist_role,
        scheduled_at: form.scheduled_at,
        created_by: profile.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear la cita");
    } else {
      alert("Cita agendada correctamente");
      navigate("/patient/appointments"); // volver a la lista
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "500px",
        margin: "2rem auto",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
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

        <label>Fecha y hora:</label>
        <input
          type="datetime-local"
          name="scheduled_at"
          value={form.scheduled_at}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            margin: "0.5rem 0 1rem 0",
          }}
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Crear cita
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
  );
}
