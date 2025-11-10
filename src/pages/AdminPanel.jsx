import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminPanel = () => {
  const [profiles, setProfiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
    fetchRole();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error) setProfiles(data);
  };

  const fetchRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data.role);
    }
  };

  const handleRoleUpdate = async (id) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);

    if (!error) {
      alert("Rol actualizado correctamente");
      setEditingId(null);
      fetchProfiles();
    }
  };

  if (!role) return <p>Cargando...</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role={role} />
      <div style={{ marginLeft: "240px", padding: "20px", width: "100%" }}>
        <h1>Panel de Administración</h1>
        <h2>Usuarios registrados</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Fecha de creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.full_name || "Sin nombre"}</td>
                <td>{profile.email || "Sin correo"}</td>
                <td>
                  {editingId === profile.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="patient">Patient</option>
                      <option value="optometrist">Optometrist</option>
                      <option value="ortoptist">Ortoptist</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    profile.role
                  )}
                </td>
                <td>
                  {new Date(profile.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  {editingId === profile.id ? (
                    <button
                      onClick={() => handleRoleUpdate(profile.id)}
                      className="save-btn"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(profile.id);
                        setNewRole(profile.role);
                      }}
                      className="edit-btn"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
