import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function SpecialistProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at")
      .eq("id", user.id)
      .single();

    if (error) console.error("❌ Error al obtener perfil:", error);
    else setProfile(data);

    setLoading(false);
  }

  if (loading) return <p className="loading">Cargando perfil...</p>;
  if (!profile) return <p className="error">No se pudo cargar el perfil.</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Mi Perfil Profesional</h2>
        <div className="profile-info">
          <div className="info-group">
            <label>Nombre completo:</label>
            <p>{profile.full_name || "—"}</p>
          </div>

          <div className="info-group">
            <label>Correo electrónico:</label>
            <p>{profile.email || "—"}</p>
          </div>

          <div className="info-group">
            <label>Teléfono:</label>
            <p>{profile.phone || "—"}</p>
          </div>

          <div className="info-group">
            <label>Rol:</label>
            <p className="role-tag">{profile.role}</p>
          </div>

          <div className="info-group">
            <label>Miembro desde:</label>
            <p>
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
