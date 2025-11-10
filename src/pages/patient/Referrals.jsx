import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function PatientReferrals() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchReferrals();
  }, [profile]);

  const fetchReferrals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referrals")
      .select(`
        id,
        from_role,
        to_role,
        reason,
        created_at,
        profiles!referrals_patient_id_fkey(full_name)
      `)
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Error al cargar tus remisiones");
    } else {
      setReferrals(data || []);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Mis Remisiones</h1>

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : referrals.length === 0 ? (
          <p>No tienes remisiones registradas.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr>
                <th>De</th>
                <th>Para</th>
                <th>Motivo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.from_role === "optometrist" ? "Optometrista" : "Ortoptista"}
                  </td>
                  <td>
                    {r.to_role === "optometrist" ? "Optometrista" : "Ortoptista"}
                  </td>
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
