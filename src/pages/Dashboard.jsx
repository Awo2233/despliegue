import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import Sidebar from "../components/Sidebar";

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
    <div style={{ display: "flex" }}>
      <Sidebar role={profile.role} />
      <div style={{ marginLeft: "240px", padding: "20px", width: "100%" }}>
        <h2>👋 Hola, {profile.full_name}</h2>
        <p>Rol: <strong>{profile.role}</strong></p>
        <p>Bienvenido a tu panel de control.</p>
      </div>
    </div>
  );
};

export default Dashboard;
