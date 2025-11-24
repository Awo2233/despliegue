import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#0836d6,#0050c7)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          padding: "2.5rem 2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
              width: 240,
            height: "auto",
            objectFit: "contain",
            marginBottom: 18,
          }}
        />

        <h1 style={{ margin: 0, fontSize: 28 }}>Bienvenido, {profile.full_name}</h1>
        <p style={{ color: "#444", marginTop: 8 }}>
          Aquí podrás acceder a tus interfaces.
        </p>

        <div style={{ width: "100%", maxWidth: 520, marginTop: 28, marginBottom: 28 }}>
          <button
            onClick={() => (window.location.href = "/patient/appointments")}
            style={buttonStyle}
            aria-label="Mis Citas"
          >
            <span style={{ marginRight: 10 }}>📅</span> Mis Citas
          </button>

          <button
            onClick={() => (window.location.href = "/patient/exams")}
            style={buttonStyle}
            aria-label="Mis Exámenes"
          >
            <span style={{ marginRight: 10 }}>📄</span> Mis Exámenes
          </button>

          <button
            onClick={() => (window.location.href = "/patient/referrals")}
            style={buttonStyle}
            aria-label="Mis Remisiones"
          >
            <span style={{ marginRight: 10 }}>🩺</span> Mis Remisiones
          </button>

          <button
            onClick={() => (window.location.href = "/patient/games")}
            style={buttonStyle}
            aria-label="Juegos"
          >
            <span style={{ marginRight: 10 }}>🎮</span> Juegos
          </button>

          <button
            onClick={() => (window.location.href = "/patient/profile")}
            style={buttonStyle}
            aria-label="Mi Perfil"
          >
            <span style={{ marginRight: 10 }}>👤</span> Mi Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Styles
const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  background: "linear-gradient(90deg,#0b63ff,#0066cc)",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(11,99,255,0.12)",
  marginBottom: 12,
}
