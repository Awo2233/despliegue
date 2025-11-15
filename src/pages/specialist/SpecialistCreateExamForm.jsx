import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function SpecialistCreateExamForm() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [newExam, setNewExam] = useState({
    patient_id: "",
    scheduled_at: "",
    observations: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "patient");

    if (error) console.error("Error al cargar pacientes:", error);
    else setPatients(data || []);
  };

  const createExam = async (e) => {
    e.preventDefault();
    if (!newExam.patient_id || !newExam.scheduled_at) {
      alert("Selecciona un paciente y una fecha");
      return;
    }

    const selectedDate = new Date(newExam.scheduled_at);
    const now = new Date();

    if (selectedDate < now) {
      alert("No puedes seleccionar una fecha anterior a la actual.");
      return;
    }

    const hour = selectedDate.getHours();
    if (hour < 8 || hour >= 16) {
      alert("Solo puedes programar exámenes entre 8:00 a.m. y 4:00 p.m.");
      return;
    }

    const { error } = await supabase.from("exams").insert([
      {
        patient_id: newExam.patient_id,
        scheduled_at: newExam.scheduled_at,
        observations: newExam.observations,
        specialist_role: profile.role,
        created_by: profile.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear examen");
    } else {
      alert("✅ Examen creado correctamente");
      setNewExam({ patient_id: "", scheduled_at: "", observations: "" });
    }
  };

  return (
    <div className="create-exam-wrapper">
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
          Crear Examen ({profile.role === "optometrist" ? "Optometrista" : "Ortoptista"})
        </h2>

        <form
          onSubmit={createExam}
          className="card create-exam-card"
          style={{ marginBottom: "2rem", maxWidth: 600 }}
        >
        <h3>Nuevo examen</h3>

        <label>Paciente:</label>
        <select
          value={newExam.patient_id}
          onChange={(e) =>
            setNewExam({ ...newExam, patient_id: e.target.value })
          }
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        >
          <option value="">-- Selecciona paciente --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>

        <label>Fecha programada:</label>
        <input
          type="datetime-local"
          min={new Date().toISOString().slice(0, 16)}
          value={newExam.scheduled_at}
          onChange={(e) =>
            setNewExam({ ...newExam, scheduled_at: e.target.value })
          }
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />

        <label>Observaciones iniciales:</label>
        <textarea
          value={newExam.observations}
          onChange={(e) =>
            setNewExam({ ...newExam, observations: e.target.value })
          }
          rows="3"
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />

        <button className="save-btn" type="submit">
          ➕ Crear examen
        </button>
        </form>
      </div>
    </div>
  );
}
