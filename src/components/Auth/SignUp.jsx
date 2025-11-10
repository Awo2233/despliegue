import { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Verificar contraseñas
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data?.user ?? data?.session?.user;

    if (user) {
      // Insertar en tabla profiles
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: fullName,
          email,
          phone,
          role: "patient", // por defecto paciente
        },
      ]);

      if (profileError) {
        console.error("Error al insertar en profiles:", profileError.message);
        alert("Error al crear el perfil: " + profileError.message);
        return;
      }

      // Insertar entrada vacía en patients
      const { error: patientError } = await supabase.from("patients").insert([
        {
          id: user.id,
          birthdate: null,
          address: null,
          observations: null,
          document: null,
        },
      ]);

      if (patientError) {
        console.error("Error al insertar en patients:", patientError.message);
        alert("Error al crear detalles del paciente.");
      }
    }

    alert("Cuenta creada correctamente. Verifica tu correo.");
    navigate("/signin");
  };

  return (
    <div className="auth-container">
      <h2>Registro de Paciente</h2>
      <p style={{ marginBottom: "20px", color: "var(--muted)", fontSize: "0.95rem", textAlign: "center", maxWidth: "420px" }}>
        Crea tu cuenta para acceder a la plataforma de óptica.
      </p>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Número de teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Registrarse</button>
      </form>

      <p className="register-link">
        ¿Ya tienes cuenta?{" "}
        <Link to="/signin" className="link">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}
