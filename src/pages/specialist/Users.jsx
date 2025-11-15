import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function SpecialistUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // 🔹 Trae solo pacientes
  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        patients (
          birthdate,
          address,
          document,
          observations,
          eps
        )
      `)
      .eq("role", "patient");

    if (error) console.error(error);
    else {
      const mapped = data.map((u) => ({
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

  function handleEdit(id) {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelected(id);
      setForm(user);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    // Validación: todos los campos deben estar completos
    const required = [
      "full_name",
      "email",
      "phone",
      "document",
      "birth_date",
      "address",
      "observations",
    ];

    const missing = required.some((k) => {
      const v = form[k];
      return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
    });

    if (missing) {
      alert("es obligatorio llenar todos los campos para actualizar la informacion de este paciente");
      return;
    }

    setSaving(true);
    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
        })
        .eq("id", selected);

      const { error: patientErr } = await supabase
        .from("patients")
        .upsert(
          {
            id: selected,
            birthdate: form.birth_date || null,
            address: form.address || null,
            document: form.document || null,
            observations: form.observations || null,
            eps: form.eps || null,
          },
          { onConflict: "id" }
        );

      if (profileErr || patientErr) {
        console.error(profileErr || patientErr);
        alert("Error al actualizar paciente");
      } else {
        alert("Paciente actualizado correctamente");
        setSelected(null); // 🔹 Cierra la edición al guardar
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar paciente");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando pacientes...</p>;

  const filteredUsers = users.filter((u) => {
    if (!search || !search.trim()) return true;
    const term = search.trim().toLowerCase();
    const name = (u.full_name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const doc = (u.document || "").toLowerCase();
    return name.includes(term) || email.includes(term) || doc.includes(term);
  });

  return (
    <div className="admin-users-container">
      <div className="users-list card">
        <h2>Pacientes registrados</h2>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Buscar paciente por nombre, documento o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <ul>
          {filteredUsers.map((u) => (
            <li
              key={u.id}
              onClick={() => handleEdit(u.id)}
              className={selected === u.id ? "selected" : ""}
            >
              <strong>{u.full_name || "Sin nombre"}</strong>
              <span>({u.role})</span>
            </li>
          ))}
        </ul>
      </div>

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
                placeholder="Nombre del paciente"
              />

              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />

              <label>Teléfono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ej: +57 312 345 6789"
              />

              <label>Documento</label>
              <input
                type="text"
                name="document"
                value={form.document}
                onChange={handleChange}
                placeholder="Cédula o documento de identidad"
              />

              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date || ""}
                onChange={handleChange}
              />

              <label>Dirección</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Ej: Calle 123 #45-67, Ciudad"
                rows="2"
              />

              <label>Observaciones</label>
              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el paciente"
                rows="3"
              />

              <label>EPS</label>
              <select name="eps" value={form.eps || ""} onChange={handleChange} style={{ display: "block", width: "100%", padding: "8px", margin: "0.5rem 0 1rem 0" }}>
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

              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? "Guardando..." : "Actualizar paciente"}
              </button>
            </form>
          </>
        ) : (
          <p>Selecciona un paciente para editar</p>
        )}
      </div>
    </div>
  );
}
