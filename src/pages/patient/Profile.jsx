import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function PatientProfilePage() {
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
      .select(
        `
        id,
        full_name,
        email,
        phone,
        role,
        patients (
          document,
          birthdate,
          address,
          observations
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (error) console.error(error);
    else setProfile({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      document: data.patients?.document || "",
      birthdate: data.patients?.birthdate || "",
      address: data.patients?.address || "",
      observations: data.patients?.observations || "",
    });

    setLoading(false);
  }

  if (loading) return <p className="loading">Cargando perfil...</p>;
  if (!profile) return <p className="error">No se pudo cargar el perfil.</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Mi Perfil</h2>
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
            <label>Documento de identidad:</label>
            <p>{profile.document || "—"}</p>
          </div>

          <div className="info-group">
            <label>Fecha de nacimiento:</label>
            <p>
              {profile.birthdate
                ? new Date(profile.birthdate).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div className="info-group">
            <label>Dirección:</label>
            <p>{profile.address || "—"}</p>
          </div>

          <div className="info-group">
            <label>Observaciones del especialista:</label>
            <p className="observations">
              {profile.observations || "Sin observaciones registradas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
