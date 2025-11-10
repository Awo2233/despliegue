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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Remisiones</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/specialist/referrals/new")}
          style={{ padding: "8px 12px", fontSize: "0.9rem" }}
        >
          ➕ Nueva remisión
        </button>
      </div>

      <div className="card">

        {loading ? (
          <p>Cargando...</p>
        ) : referrals.length === 0 ? (
          <p>No hay remisiones registradas.</p>
        ) : (
          <table className="exams-table">
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
