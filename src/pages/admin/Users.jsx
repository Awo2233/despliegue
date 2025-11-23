// src/pages/admin/Users.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const emptyUser = {
    full_name: "",
    email: "",
    phone: "",
    role: "patient",
    birth_date: "",
    address: "",
    document: "",
    observations: "",
    eps: "",
  };

  const [form, setForm] = useState(emptyUser);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================================================
  // FETCH USUARIOS (SOLO LOS NO ELIMINADOS)
  // ============================================================
  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        is_deleted,
        patients (
          birthdate,
          address,
          document,
          observations,
          eps,
          is_deleted
        )
      `)
      .eq("is_deleted", false); // <<--- SOLO LOS NO ELIMINADOS

    if (error) {
      console.error(error);
      alert("Error cargando usuarios");
    } else {
      const mapped = data
        .filter((u) => !u.is_deleted) // seguridad extra
        .map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          birth_date: u.patients?.birthdate || "",
          address: u.patients?.address || "",
          document: u.patients?.document || "",
          observations: u.patients?.observations || "",
          eps: u.patients?.eps || "",
        }));

      setUsers(mapped);
    }

    setLoading(false);
  }

  // ============================================================
  // GET PROFILES MAP
  // ============================================================
  async function getProfilesMap(ids) {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    if (uniqueIds.length === 0) return {};

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", uniqueIds);

    if (error) return {};

    const map = {};
    data.forEach((p) => (map[p.id] = p.full_name));
    return map;
  }

  // Excel helper
  async function exportRowsToExcel(rows, filename) {
    try {
      const XLSX = (await import("xlsx")).default || (await import("xlsx"));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error(err);
      alert("Error generando el Excel.");
    }
  }

  // ============================================================
  // EDITAR
  // ============================================================
  function handleEdit(id) {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelected(id);
      setForm(user);
    }
  }

  // ============================================================
  // 🗑️ ELIMINACIÓN LÓGICA (SOFT DELETE)
  // ============================================================
  async function handleDelete(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este paciente?")) return;

    // Marcar como eliminado en profiles
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ is_deleted: true })
      .eq("id", id);

    // Marcar como eliminado en patients
    const { error: patientErr } = await supabase
      .from("patients")
      .update({ is_deleted: true })
      .eq("id", id);

    if (profileErr || patientErr) {
      console.error(profileErr || patientErr);
      alert("Error al eliminar paciente");
    } else {
      alert("Paciente eliminado correctamente (soft delete)");
      fetchUsers();
      setSelected(null);
    }
  }

  // ============================================================
  // CAMBIO FORM
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ============================================================
  // GUARDAR
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selected) {
      alert("Selecciona un paciente para editar");
      return;
    }

    const required = [
      "full_name",
      "email",
      "phone",
      "role",
      "document",
      "birth_date",
      "address",
      "observations",
    ];

    const missing = required.some(
      (k) => !form[k] || form[k].trim() === ""
    );

    if (missing) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    setSaving(true);

    try {
      await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
        })
        .eq("id", selected);

      await supabase
        .from("patients")
        .upsert(
          {
            id: selected,
            birthdate: form.birth_date,
            address: form.address,
            document: form.document,
            observations: form.observations,
            eps: form.eps,
          },
          { onConflict: "id" }
        );

      alert("Paciente actualizado correctamente");

      setSelected(null);
      setForm(emptyUser);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  // ============================================================
  // BUSCADOR
  // ============================================================
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.document || "").toLowerCase().includes(term)
    );
  });

  // ============================================================
  // EXPORTS (NO CAMBIADOS)
  // ============================================================
  async function exportPatientAppointments(patientId, patientName) {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("scheduled_at");

      if (error) throw error;

      const specialistIds = data.map((r) => r.specialist_id).filter(Boolean);
      const specialistsMap = await getProfilesMap(specialistIds);

      const rows = data.map((r) => ({
        Fecha: r.scheduled_at
          ? new Date(r.scheduled_at).toLocaleString()
          : "",
        Estado: r.status,
        Especialista: specialistsMap[r.specialist_id] || "N/A",
        RolEspecialista: r.specialist_role,
        Creado: r.created_at
          ? new Date(r.created_at).toLocaleString()
          : "",
      }));

      await exportRowsToExcel(rows, `citas_${patientName}.xlsx`);
    } catch (err) {
      alert("Error generando reporte");
    } finally {
      setExporting(false);
    }
  }

  async function exportPatientExams(patientId, patientName) {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("patient_id", patientId)
        .order("scheduled_at");

      if (error) throw error;

      const specialistIds = data.map((r) => r.created_by).filter(Boolean);
      const specialistsMap = await getProfilesMap(specialistIds);

      const rows = data.map((r) => ({
        Fecha: r.scheduled_at
          ? new Date(r.scheduled_at).toLocaleString()
          : "",
        Tipo: r.specialist_role,
        Diagnóstico: r.diagnosis,
        Observaciones: r.observations,
        "Realizado por": specialistsMap[r.created_by] || "N/A",
        Creado: r.created_at
          ? new Date(r.created_at).toLocaleString()
          : "",
      }));

      await exportRowsToExcel(rows, `examenes_${patientName}.xlsx`);
    } catch (err) {
      alert("Error generando reporte");
    } finally {
      setExporting(false);
    }
  }

  async function exportSpecialistAppointments(specialistId, specialistName) {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("specialist_id", specialistId)
        .order("scheduled_at");

      if (error) throw error;

      const patientIds = data.map((r) => r.patient_id).filter(Boolean);
      const patientsMap = await getProfilesMap(patientIds);

      const rows = data.map((r) => ({
        Fecha: r.scheduled_at
          ? new Date(r.scheduled_at).toLocaleString()
          : "",
        Paciente: patientsMap[r.patient_id] || "N/A",
        Estado: r.status,
        Motivo: r.reason,
        Creado: r.created_at
          ? new Date(r.created_at).toLocaleString()
          : "",
      }));

      await exportRowsToExcel(rows, `citas_atendidas_${specialistName}.xlsx`);
    } catch (err) {
      alert("Error generando reporte");
    } finally {
      setExporting(false);
    }
  }

  async function exportSpecialistExams(specialistId, specialistName) {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("created_by", specialistId)
        .order("scheduled_at");

      if (error) throw error;

      const patientIds = data.map((r) => r.patient_id).filter(Boolean);
      const patientsMap = await getProfilesMap(patientIds);

      const rows = data.map((r) => ({
        Fecha: r.scheduled_at
          ? new Date(r.scheduled_at).toLocaleString()
          : "",
        Paciente: patientsMap[r.patient_id] || "N/A",
        Tipo: r.specialist_role,
        Resultado: r.diagnosis || r.observations,
        Creado: r.created_at
          ? new Date(r.created_at).toLocaleString()
          : "",
      }));

      await exportRowsToExcel(
        rows,
        `examenes_realizados_${specialistName}.xlsx`
      );
    } catch (err) {
      alert("Error generando reporte");
    } finally {
      setExporting(false);
    }
  }

  async function exportSpecialistReferrals(specialistId, specialistName) {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("created_by", specialistId)
        .order("created_at");

      if (error) throw error;

      const patientIds = data.map((r) => r.patient_id).filter(Boolean);
      const patientsMap = await getProfilesMap(patientIds);

      const rows = data.map((r) => ({
        Fecha: r.created_at
          ? new Date(r.created_at).toLocaleString()
          : "",
        Paciente: patientsMap[r.patient_id] || "N/A",
        FromRole: r.from_role,
        ToRole: r.to_role,
        Motivo: r.reason || r.notes,
      }));

      await exportRowsToExcel(rows, `remisiones_${specialistName}.xlsx`);
    } catch (err) {
      alert("Error generando reporte");
    } finally {
      setExporting(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="admin-users-container">
      <div className="users-list card">
        <div className="list-header">
          <h2>Usuarios registrados</h2>

          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Buscar por nombre, documento o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <ul>
          {filteredUsers.map((u) => (
            <li
              key={u.id}
              onClick={() => handleEdit(u.id)}
              className={selected === u.id ? "selected" : ""}
            >
              <div>
                <strong>{u.full_name}</strong>
                <span> ({u.role})</span>
              </div>

              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(u.id);
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* FORMULARIO */}
      <div className="user-form card">
        {selected ? (
          <>
            <h2>Editando paciente</h2>

            <form onSubmit={handleSubmit}>
              <label>Nombre completo</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />

              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <label>Teléfono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <label>Rol</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="patient">Paciente</option>
                <option value="optometrist">Optometrista</option>
                <option value="ortoptist">Ortoptista</option>
                <option value="admin">Administrador</option>
              </select>

              <label>Documento</label>
              <input
                type="text"
                name="document"
                value={form.document}
                onChange={handleChange}
              />

              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
              />

              <label>Dirección</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="2"
              />

              <label>Observaciones</label>
              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                rows="3"
              />

              <label>EPS</label>
              <select
                name="eps"
                value={form.eps}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "0.5rem 0",
                }}
              >
                
                <option value="">-- Selecciona EPS --</option>
                {[
                  "ALIANSALUD ENTIDAD PROMOTORA DE SALUD S.A.",
                  "ASOCIACIÓN INDÍGENA DEL CAUCA",
                  "CAPITAL SALUD",
                  "CAPRESOCA  EPS",
                  "COMFENALCO  VALLE  E.P.S.",
                  "COMPENSAR   E.P.S.",
                  "COOPERATIVA DE SALUD Y DESARROLLO INTEGRAL ZONA SUR ORIENTAL DE CARTAGENA",
                  "E.P.S.  FAMISANAR LTDA.",
                  "E.P.S.  SANITAS S.A.",
                  "EPS  CONVIDA",
                  "EPS SERVICIO OCCIDENTAL DE SALUD S.A.",
                  "EPS Y MEDICINA PREPAGADA SURAMERICANA S.A",
                  "MALLAMAS",
                  "NUEVA EPS S.A.",
                  "PIJAOS SALUD EPSI",
                  "SALUD TOTAL S.A.  E.P.S.",
                  "SALUDVIDA S.A. E.P.S",
                  "SAVIA SALUD EPS",
                  "ninguna de las anteriores",
                ].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setSelected(null)}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? "Guardando..." : "Actualizar paciente"}
                </button>
              </div>

              {/* REPORTES */}
              <div
                style={{
                  marginTop: "2rem",
                  borderTop: "1px solid #ddd",
                  paddingTop: "1.5rem",
                }}
              >
                <h3 style={{ fontWeight: "bold" }}>Reportes del usuario</h3>

                {/* PACIENTE */}
                {form.role === "patient" && (
                  <>
                    <button
                      type="button"
                      className="btn-save"
                      style={{ width: "100%", marginBottom: 10 }}
                      disabled={exporting}
                      onClick={() =>
                        exportPatientAppointments(selected, form.full_name)
                      }
                    >
                      {exporting ? "Generando..." : "Descargar citas"}
                    </button>

                    <button
                      type="button"
                      className="btn-save"
                      style={{ width: "100%", marginBottom: 10 }}
                      disabled={exporting}
                      onClick={() =>
                        exportPatientExams(selected, form.full_name)
                      }
                    >
                      {exporting ? "Generando..." : "Descargar exámenes"}
                    </button>
                  </>
                )}

                {/* ESPECIALISTA */}
                {(form.role === "optometrist" ||
                  form.role === "ortoptist") && (
                  <>
                    <button
                      type="button"
                      className="btn-save"
                      style={{ width: "100%", marginBottom: 10 }}
                      disabled={exporting}
                      onClick={() =>
                        exportSpecialistAppointments(selected, form.full_name)
                      }
                    >
                      {exporting ? "Generando..." : "Descargar citas "}
                    </button>

                    <button
                      type="button"
                      className="btn-save"
                      style={{ width: "100%", marginBottom: 10 }}
                      disabled={exporting}
                      onClick={() =>
                        exportSpecialistExams(selected, form.full_name)
                      }
                    >
                      {exporting ? "Generando..." : "Descargar exámenes"}
                    </button>

                    <button
                      type="button"
                      className="btn-save"
                      style={{ width: "100%", marginBottom: 10 }}
                      disabled={exporting}
                      onClick={() =>
                        exportSpecialistReferrals(selected, form.full_name)
                      }
                    >
                      {exporting ? "Generando..." : "Descargar remisiones"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </>
        ) : (
          <p>Selecciona un paciente para editar sus datos</p>
        )}
      </div>
    </div>
  );
}
