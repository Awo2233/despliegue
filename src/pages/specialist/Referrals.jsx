import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistReferrals() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.id) {
      fetchReferrals();
    }
  }, [profile]);

  const fetchReferrals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referrals")
      .select(`
        id,
        patient_id,
        from_role,
        to_role,
        reason,
        created_at,
        profiles!referrals_patient_id_fkey(full_name)
      `)
      .or(`from_role.eq.${profile.role},to_role.eq.${profile.role}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Error al cargar remisiones");
    } else {
      setReferrals(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="referrals-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="section-title">
          Remisiones de {profile.role === "optometrist" ? "Optometrista" : "Ortoptista"}
        </h2>
        <button
          className="btn-primary"
          onClick={() => navigate("/specialist/referrals/new")}
        >
          ➕ Nueva remisión
        </button>
      </div>

      <div className="table-card">
        <h3>Historial de remisiones</h3>

        {loading ? (
          <p>Cargando...</p>
        ) : referrals.length === 0 ? (
          <p>No hay remisiones registradas.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>De</th>
                <th>Para</th>
                <th>Motivo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td>{r.profiles?.full_name || "—"}</td>
                  <td>{r.from_role === "optometrist" ? "Optometrista" : "Ortoptista"}</td>
                  <td>{r.to_role === "optometrist" ? "Optometrista" : "Ortoptista"}</td>
                  <td>{r.reason}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
