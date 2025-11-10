import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function PatientExams() {
  const { profile } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchExams();
  }, [profile]);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select(`
        id,
        scheduled_at,
        performed,
        observations,
        diagnosis,
        specialist_role,
        storage_path,
        created_at
      `)
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener exámenes:", error);
      alert("No se pudieron cargar tus exámenes");
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const getPublicUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("exams-pdfs").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  return (
    <div className="exams-container">
      <h2 className="exams-title">🩺 Mis Exámenes</h2>

      <div className="exams-card">
        {loading ? (
          <p className="loading-text">Cargando tus exámenes...</p>
        ) : exams.length === 0 ? (
          <p className="no-exams">No tienes exámenes registrados.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Especialista</th>
                <th>Estado</th>
                <th>Diagnóstico</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{new Date(exam.created_at).toLocaleString()}</td>
                  <td>
                    {exam.specialist_role === "optometrist"
                      ? "Optometrista"
                      : exam.specialist_role === "ortoptist"
                      ? "Ortoptista"
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={
                        exam.performed
                          ? "status-badge done"
                          : "status-badge pending"
                      }
                    >
                      {exam.performed ? "Realizado" : "Pendiente"}
                    </span>
                  </td>
                  <td>{exam.diagnosis || "—"}</td>
                  <td>
                    {exam.storage_path ? (
                      <a
                        href={getPublicUrl(exam.storage_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        📄 Ver resultado
                      </a>
                    ) : (
                      <span className="no-file">No disponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
