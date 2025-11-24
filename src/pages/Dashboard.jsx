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
          width: 720,
          maxWidth: "95%",
          background: "white",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: 300,
            height: "auto",
            objectFit: "contain",
            marginBottom: 18,
          }}
        />

        <h1 style={{ margin: 0, fontSize: 28 }}>Bienvenido, {profile.full_name}</h1>
        <p style={{ color: "#444", marginTop: 8 }}>
          Aquí podrás acceder a tus interfaces.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
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
  background: "linear-gradient(90deg,#0b63ff,#0066cc)",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: 10,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(11,99,255,0.28)",
}
