import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistReferrals() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
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
        profiles!referrals_patient_id_fkey(full_name),
        creator:profiles!referrals_created_by_fkey(full_name)
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

      <div style={{ marginBottom: "1rem", display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Buscar por paciente, motivo o especialista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(0,72,255,0.1)", minWidth: 260 }}
        />
      </div>

      <div className="card">

        {loading ? (
          <p>Cargando...</p>
        ) : (
          (() => {
            const term = (search || "").trim().toLowerCase();
            const list = term
              ? referrals.filter((r) => {
                  const name = (r.profiles?.full_name || "").toLowerCase();
                  const reason = (r.reason || "").toLowerCase();
                  const from = (r.from_role || "").toLowerCase();
                  const to = (r.to_role || "").toLowerCase();
                  return (
                    name.includes(term) || reason.includes(term) || from.includes(term) || to.includes(term)
                  );
                })
              : referrals;

            if (list.length === 0) return <p>No hay remisiones registradas.</p>;

            return (
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
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>{r.profiles?.full_name || "—"}</td>
                    <td>{r.creator?.full_name ? `${r.creator.full_name} (${r.from_role === "optometrist" ? "Optometrista" : "Ortoptista"})` : (r.from_role === "optometrist" ? "Optometrista" : "Ortoptista")}</td>
                    <td>{r.to_role === "optometrist" ? `No asignado (Optometrista)` : `No asignado (Ortoptista)`}</td>
                    <td>{r.reason}</td>
                    <td>{new Date(r.created_at).toLocaleString("es-CO", { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</td>
                  </tr>
                ))}
            </tbody>
          </table>
            );
          })()
        )}
      </div>
    </div>
  );
}
