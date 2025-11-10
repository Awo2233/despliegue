import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import "../styles/Sidebar.css";
import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaGamepad,
  FaUsersCog,
  FaStethoscope,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  // 🔹 Menu items según rol
  const menuItems =
    role === "admin"
      ? [
          { label: "Usuarios / Pacientes", icon: <FaUsersCog />, path: "/admin/users" },
          { label: "Citas", icon: <FaCalendarAlt />, path: "/admin/appointments" },
          { label: "Examenes", icon: <FaFileAlt />, path: "/admin/Exams" },
          { label: "Remisiones", icon: <FaStethoscope />, path: "/admin/referrals" },
        ]
      : role === "optometrist" || role === "ortoptist"
      ? [
          
          { label: "Citas", icon: <FaCalendarAlt />, path: "/specialist/appointments" },
          { label: "Examenes", icon: <FaFileAlt />, path: "/specialist/exams" },
          { label: "Remisiones", icon: <FaStethoscope />, path: "/specialist/referrals" },
          { label: "Usuarios", icon: <FaStethoscope />, path: "/specialist/users" },
          { label: "Mi perfil", icon: <FaUser />, path: "/specialist/profile" },
        ]
      : [
          
          { label: "Mis Citas", icon: <FaCalendarAlt />, path: "/patient/appointments" },
          { label: "Mis Examenes", icon: <FaFileAlt />, path: "/patient/exams" },
          { label: "Mis Remisiones", icon: <FaStethoscope />, path: "/patient/referrals" },
          { label: "Juegos", icon: <FaGamepad />, path: "/patient/games" },
          { label: "Mi Prerfi", icon: <FaUser />, path: "/patient/profile" },
        ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          {role === "admin"
            ? "Administrator"
            : role === "optometrist" || role === "ortoptist"
            ? "Specialist"
            : "Patient"}
        </h2>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link to={item.path} className="sidebar-link">
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Cerrar Sesion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
