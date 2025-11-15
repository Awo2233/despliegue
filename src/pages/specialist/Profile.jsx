import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function SpecialistProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCard, setHasCard] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const BUCKET = "tarjeta-matricula-profesional";

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

    if (error) {
      console.error("❌ Error al obtener perfil:", error);
    } else {
      setProfile(data);
      checkProfessionalCard(data.id, data.role);
    }

    setLoading(false);
  }

  async function checkProfessionalCard(userId, role) {
    if (!userId) return;

    try {
      // Buscar archivos que comiencen con el userId en el nombre
      const { data, error } = await supabase.storage.from(BUCKET).list();

      if (error) {
        console.warn("Error listando storage:", error.message || error);
        setHasCard(false);

        if (role === "optometrist" || role === "ortoptist") {
          window.alert("Aún no sube su tarjeta o matrícula profesional, es obligatorio");
        }
        return;
      }

      // Filtrar archivos del usuario actual
      const userFiles = data ? data.filter((f) => f.name.startsWith(userId)) : [];

      if (userFiles && userFiles.length > 0) {
        setHasCard(true);
        const first = userFiles[0];
        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(first.name);
        setFileUrl(publicData?.publicUrl || null);
      } else {
        setHasCard(false);
        if (role === "optometrist" || role === "ortoptist") {
          window.alert("Aún no sube su tarjeta o matrícula profesional, es obligatorio");
        }
      }
    } catch (err) {
      console.error("Error comprobando tarjeta profesional:", err);
      setHasCard(false);
    }
  }

  // --- Limpieza de nombre de archivo para evitar errores 400 ---
  function sanitizeFileName(name) {
    return name
      .normalize("NFD") // separa tildes
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/\s+/g, "-") // espacios → guiones
      .replace(/[^a-zA-Z0-9._-]/g, ""); // quita cualquier carácter inválido
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor sube un archivo PDF.");
      return;
    }

    // Limpieza de nombre de archivo antes de subirlo
    const safeName = sanitizeFileName(file.name);
    // Guardar directamente en raíz con prefijo userId para evitar errores RLS
    const filePath = `${profile.id}-${safeName}`;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      setFileUrl(publicData?.publicUrl || null);
      setHasCard(true);

      alert("Archivo subido correctamente.");
    } catch (err) {
      console.error("❌ Error subiendo archivo:", err);
      alert("Error subiendo archivo: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
      return;
    }

    try {
      const list = await supabase.storage.from(BUCKET).list();

      if (list.error || !list.data || list.data.length === 0) {
        alert("No hay archivo disponible para descargar.");
        return;
      }

      // Filtrar archivos del usuario
      const userFiles = list.data.filter((f) => f.name.startsWith(profile.id));
      if (userFiles.length === 0) {
        alert("No hay archivo disponible para descargar.");
        return;
      }

      const first = userFiles[0];
      const path = first.name;

      const { data: signed, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60);

      if (error) throw error;

      window.open(signed.signedUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("No hay archivo disponible para descargar.");
    }
  };

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

          {(profile.role === "optometrist" || profile.role === "ortoptist") && (
            <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
              <label style={{ fontWeight: 700 }}>
                Sube tu tarjeta o matrícula profesional (obligatorio)
              </label>

              <div style={{ marginTop: 8 }}>
                {hasCard ? (
                  <>
                    <p>Archivo registrado.</p>
                    <button onClick={handleDownload} className="btn btn-ghost">
                      Ver/Descargar PDF
                    </button>
                  </>
                ) : (
                  <>
                    <input type="file" accept="application/pdf" onChange={handleFileChange} />
                    <p style={{ fontSize: "0.9rem", color: "#999", marginTop: 6 }}>
                      Formato requerido: PDF
                    </p>
                  </>
                )}
                {uploading && <p>Cargando archivo...</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
