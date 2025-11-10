import { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data?.user;
    if (!user) {
      alert("No se pudo obtener el usuario.");
      return;
    }

    // 🔹 Obtener rol del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert("Error al obtener el perfil: " + profileError.message);
      return;
    }

    // 🔹 Redirección según rol
    if (profile.role === "admin") {
      navigate("/admin");
    } else if (profile.role === "optometrist" || profile.role === "ortoptist") {
      navigate("/specialist");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      {/* 🔹 Enlace de registro */}
      <p className="register-link">
        ¿No tienes cuenta?{" "}
        <Link to="/signup" className="link">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
