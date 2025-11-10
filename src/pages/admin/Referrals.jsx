import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

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
        patient:profiles!referrals_patient_id_fkey(full_name),
        creator:profiles!referrals_created_by_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener remisiones:", error);
      alert("No se pudieron cargar las remisiones");
    } else {
      setReferrals(data || []);
      setFiltered(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (!value) {
      setFiltered(referrals);
      return;
    }
    const results = referrals.filter(
      (r) =>
        r.patient?.full_name?.toLowerCase().includes(value) ||
        r.creator?.full_name?.toLowerCase().includes(value) ||
        r.reason?.toLowerCase().includes(value)
    );
    setFiltered(results);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Remisiones</h1>
      </div>

      <input
        type="text"
        placeholder="Buscar por paciente, especialista o motivo..."
        value={search}
        onChange={handleSearch}
        style={{
          marginBottom: "1rem",
          padding: "8px 12px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid rgba(0,72,255,0.1)",
        }}
      />

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p>No hay remisiones registradas.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>De</th>
                <th>Para</th>
                <th>Motivo</th>
                <th>Creado por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.patient?.full_name || "—"}</td>
                  <td>
                    {r.from_role === "optometrist" ? "Optometrista" : "Ortoptista"}
                  </td>
                  <td>
                    {r.to_role === "optometrist" ? "Optometrista" : "Ortoptista"}
                  </td>
                  <td>{r.reason}</td>
                  <td>{r.creator?.full_name || "—"}</td>
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
