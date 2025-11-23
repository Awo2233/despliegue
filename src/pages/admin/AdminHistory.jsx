// src/pages/admin/history/AdminHistory.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

export default function AdminHistory() {
  const [logs, setLogs] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error: logsErr } = await supabase
        .from("logs")
        .select("id, user_id, action, table_name, old_data, new_data, created_at")
        .order("created_at", { ascending: false });

      if (logsErr) {
        console.error("Error cargando logs:", logsErr);
        return;
      }

      const logsList = logsData || [];
      setLogs(logsList);

      const userIds = Array.from(new Set(logsList.map((l) => l.user_id).filter(Boolean)));
      if (userIds.length === 0) return;

      const { data: usersData, error: usersErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .in("id", userIds);

      if (usersErr) {
        console.error("Error cargando profiles:", usersErr);
        return;
      }

      const map = {};
      (usersData || []).forEach((u) => {
        map[u.id] = {
          full_name: u.full_name,
          email: u.email,
          role: u.role,
        };
      });

      setProfilesMap(map);
    } catch (err) {
      console.error("fetchLogs error:", err);
    }
  };

  const humanizeObject = (obj) => {
    if (!obj) return null;
    try {
      const clone = JSON.parse(JSON.stringify(obj));
      const walk = (node) => {
        if (Array.isArray(node)) {
          node.forEach((it) => walk(it));
        } else if (node && typeof node === "object") {
          for (const k of Object.keys(node)) {
            const v = node[k];
            if (typeof v === "string" && profilesMap[v]) {
              node[k] = profilesMap[v].full_name || profilesMap[v].email || v;
            } else {
              walk(v);
            }
          }
        }
      };
      walk(clone);
      return clone;
    } catch {
      return obj;
    }
  };

  const formatJSON = (o) => {
    try {
      return JSON.stringify(o, null, 2);
    } catch {
      return String(o);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial del Sistema</h1>

      {logs.length === 0 ? (
        <p>No hay registros aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Acción</th>
                <th className="px-4 py-2 text-left">Tabla</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Antes</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => {
                const user = profilesMap[log.user_id];
                const userLabel = user
                  ? `${user.full_name}${user.role ? ` — ${user.role}` : ""}`
                  : `ID: ${log.user_id}`;

                const humanOld = humanizeObject(log.old_data);

                return (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">{log.table_name}</td>
                    <td className="px-4 py-2">{userLabel}</td>
                    <td className="px-4 py-2">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {humanOld ? (
                        <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                          {formatJSON(humanOld)}
                        </pre>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
