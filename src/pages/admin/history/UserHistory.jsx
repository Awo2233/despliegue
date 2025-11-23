import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";

const UserHistory = () => {
  const { userId } = useParams();
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadLogs();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    setUser(data);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setLogs(data);
  };

  return (
    <div className="container">
      <h2>Historial de {user?.full_name || "Usuario"}</h2>

      {logs.length === 0 ? (
        <p>Este usuario no tiene cambios registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Tabla</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.table_name}</td>
                <td>
                  <button
                    onClick={() =>
                      alert(
                        JSON.stringify(
                          { old: log.old_data, new: log.new_data },
                          null,
                          2
                        )
                      )
                    }
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserHistory;
