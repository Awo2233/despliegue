// src/pages/admin/Users.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
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
  };

  const [form, setForm] = useState(emptyUser);

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Trae todos los usuarios con datos de pacientes
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
          observations
        )
      `);

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
      }));
      setUsers(mapped);
    }
    setLoading(false);
  }

  async function handleEdit(id) {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelected(id);
      setForm(user);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este paciente?")) return;

    const { error: patientErr } = await supabase
      .from("patients")
      .delete()
      .eq("id", id);

    const { error: profileErr } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (patientErr || profileErr) {
      console.error(patientErr || profileErr);
      alert("Error al eliminar paciente");
    } else {
      alert("Paciente eliminado correctamente");
      fetchUsers();
      setSelected(null); // 🔹 Cierra el formulario si estaba abierto
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!selected) {
      alert("Selecciona un paciente para editar");
      setSaving(false);
      return;
    }

    // 🔹 Actualizar profile
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      })
      .eq("id", selected);

    // 🔹 Actualizar paciente
    const { error: patientErr } = await supabase
      .from("patients")
      .upsert(
        {
          id: selected,
          birthdate: form.birth_date || null,
          address: form.address || null,
          document: form.document || null,
          observations: form.observations || null,
        },
        { onConflict: "id" }
      );

    if (profileErr || patientErr) {
      console.error(profileErr || patientErr);
      alert("Error al actualizar paciente");
    } else {
      alert("✅ Paciente actualizado correctamente");
      setSelected(null); // 🔹 Cierra el panel de edición
      setForm(emptyUser);
      fetchUsers();
    }

    setSaving(false);
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="admin-users-container">
      <div className="users-list">
        <div className="list-header">
          <h2>Usuarios registrados</h2>
        </div>

        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              onClick={() => handleEdit(u.id)}
              className={selected === u.id ? "selected" : ""}
            >
              <div>
                <strong>{u.full_name || "Sin nombre"}</strong>
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

      <div className="user-form">
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

              <label>Rol</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="patient">Paciente</option>
                <option value="optometrist">Optometrista</option>
                <option value="ortoptist">Ortoptista</option>
                <option value="admin">Administrador</option>
              </select>

              <label>Documento de identidad</label>
              <input
                type="text"
                name="document"
                value={form.document}
                onChange={handleChange}
                placeholder="Ej: 1002456789"
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
                placeholder="Notas o comentarios del paciente"
                rows="3"
              />

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
            </form>
          </>
        ) : (
          <p>Selecciona un paciente para editar sus datos</p>
        )}
      </div>
    </div>
  );
}
