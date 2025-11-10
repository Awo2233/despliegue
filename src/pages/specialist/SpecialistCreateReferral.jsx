import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistCreateReferral() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [newReferral, setNewReferral] = useState({
    patient_id: "",
    to_role: "",
    reason: "",
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

  const createReferral = async (e) => {
    e.preventDefault();
    if (!newReferral.patient_id || !newReferral.to_role || !newReferral.reason) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const { error } = await supabase.from("referrals").insert([
      {
        patient_id: newReferral.patient_id,
        from_role: profile.role,
        to_role: newReferral.to_role,
        reason: newReferral.reason,
        created_by: profile.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear la remisión");
    } else {
      alert("Remisión creada correctamente");
      navigate("/specialist/referrals"); // 🔹 Redirige al listado
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: 600 }}>
      <h2>
        Nueva remisión ({profile.role === "optometrist" ? "Optometrista" : "Ortoptista"})
      </h2>

      <form onSubmit={createReferral}>
        <label>Paciente:</label>
        <select
          value={newReferral.patient_id}
          onChange={(e) =>
            setNewReferral({ ...newReferral, patient_id: e.target.value })
          }
        >
          <option value="">-- Selecciona paciente --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>

        <label>Especialista destinatario:</label>
        <select
          value={newReferral.to_role}
          onChange={(e) =>
            setNewReferral({ ...newReferral, to_role: e.target.value })
          }
        >
          <option value="">-- Selecciona el tipo de especialista --</option>
          {profile.role === "optometrist" ? (
            <option value="ortoptist">Ortoptista</option>
          ) : (
            <option value="optometrist">Optometrista</option>
          )}
        </select>

        <label>Motivo:</label>
        <textarea
          value={newReferral.reason}
          onChange={(e) =>
            setNewReferral({ ...newReferral, reason: e.target.value })
          }
          rows="3"
          placeholder="Describe brevemente la razón de la remisión..."
        />

        <button type="submit" className="btn-primary">
          💾 Crear remisión
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/specialist/referrals")}
          style={{ marginLeft: "1rem" }}
        >
          ⬅️ Volver
        </button>
      </form>
    </div>
  );
}
