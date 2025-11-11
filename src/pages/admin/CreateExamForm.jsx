import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function CreateExamForm() {
  const [patients, setPatients] = useState([]);
  const [newExam, setNewExam] = useState({
    patient_id: "",
    scheduled_at: "",
    observations: "",
    specialist_role: "optometrist",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "patient");
    if (error) console.error(error);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("exams").insert([
      {
        patient_id: newExam.patient_id,
        scheduled_at: newExam.scheduled_at,
        observations: newExam.observations,
        specialist_role: newExam.specialist_role,
        created_by: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear examen");
    } else {
      alert("✅ Examen creado correctamente");
      setNewExam({
        patient_id: "",
        scheduled_at: "",
        observations: "",
        specialist_role: "optometrist",
      });
    }
  };

  return (
    <form
      onSubmit={createExam}
      className="card"
      style={{ marginBottom: "2rem", maxWidth: 700 }}
    >
      <h3>Crear nuevo examen</h3>

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

      <label>Especialista:</label>
      <select
        value={newExam.specialist_role}
        onChange={(e) =>
          setNewExam({ ...newExam, specialist_role: e.target.value })
        }
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      >
        <option value="optometrist">Optometrista</option>
        <option value="ortoptist">Ortoptista</option>
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
  );
}
