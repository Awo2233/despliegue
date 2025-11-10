// src/components/ProfileForm.jsx
import React, { useEffect, useState } from "react";
import { getFullProfile, updateProfile, upsertPatientExtra } from "../api/profile";
import { useAuth } from "../hooks/useAuth";

export default function ProfileForm({ userId: externalUserId }) {
  const { profile: authProfile } = useAuth();
  const isAdminEditing = Boolean(externalUserId);
  const userId = externalUserId || authProfile?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    full_name: "",
    email: "",
    phone: "",
    // patient extras:
    birthdate: "",
    address: "",
    role: "",
  });

  const role = data.role;

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { profile, patient } = await getFullProfile(userId);
        if (!mounted) return;
        setData({
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          role: profile?.role || "",
          birthdate: patient?.birthdate ? patient.birthdate.slice(0, 10) : "",
          address: patient?.address || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Error al cargar el perfil: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // actualizar profiles
      const { error: err1 } = await updateProfile(userId, {
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
      });
      if (err1) throw err1;

      // Si es paciente, guardar datos en tabla patients (birthdate, address)
      if (role === "patient") {
        const { error: err2 } = await upsertPatientExtra(userId, {
          birthdate: data.birthdate || null,
          address: data.address || null,
        });
        if (err2) throw err2;
      }

      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      alert("Error actualizando perfil: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <form onSubmit={handleSubmit} className="profile-form" style={{ maxWidth: 720 }}>
      <h2>{isAdminEditing ? `Editando a ${data.full_name}` : "Mi perfil"}</h2>

      <label style={{ display: "block", marginTop: 12 }}>
        Nombre completo
        <input
          name="full_name"
          value={data.full_name}
          onChange={handleChange}
          type="text"
          required
          style={{ width: "100%", padding: 8, marginTop: 6 }}
        />
      </label>

      <label style={{ display: "block", marginTop: 12 }}>
        Correo electrónico
        <input
          name="email"
          value={data.email}
          disabled
          type="email"
          style={{ width: "100%", padding: 8, marginTop: 6, background: "#f0f0f0" }}
        />
      </label>

      <label style={{ display: "block", marginTop: 12 }}>
        Teléfono
        <input
          name="phone"
          value={data.phone}
          onChange={handleChange}
          type="text"
          style={{ width: "100%", padding: 8, marginTop: 6 }}
        />
      </label>

      {isAdminEditing && (
        <label style={{ display: "block", marginTop: 12 }}>
          Rol
          <select
            name="role"
            value={data.role}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="patient">Paciente</option>
            <option value="optometrist">Optometrista</option>
            <option value="ortoptist">Ortoptista</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      )}

      {role === "patient" && (
        <>
          <label style={{ display: "block", marginTop: 12 }}>
            Fecha de nacimiento
            <input
              name="birthdate"
              value={data.birthdate}
              onChange={handleChange}
              type="date"
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            Dirección
            <input
              name="address"
              value={data.address}
              onChange={handleChange}
              type="text"
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
