import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function SpecialistExams() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingExam, setEditingExam] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    if (profile?.id) fetchExams();
  }, [profile, filter]);

  const fetchExams = async () => {
    setLoading(true);
    let query = supabase
      .from("exams")
      .select(`
        id,
        patient_id,
        scheduled_at,
        performed,
        observations,
        diagnosis,
        specialist_role,
        storage_path,
        profiles!exams_patient_id_fkey(full_name)
      `)
      .eq("specialist_role", profile.role)
      .order("created_at", { ascending: false });

    if (filter === "done") query = query.eq("performed", true);
    if (filter === "pending") query = query.eq("performed", false);

    const { data, error } = await query;
    if (error) {
      console.error("Error al obtener exámenes:", error);
      alert("No se pudieron cargar los exámenes");
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (examId) => {
    const fields = updatedFields[examId];
    if (!fields) return;

    const { error } = await supabase.from("exams").update(fields).eq("id", examId);
    if (error) {
      console.error(error);
      alert("Error al guardar cambios");
    } else {
      alert("Cambios guardados correctamente");
      setEditingExam(null);
      setUpdatedFields((prev) => {
        const copy = { ...prev };
        delete copy[examId];
        return copy;
      });
      fetchExams();
    }
  };

  const togglePerformed = async (exam) => {
    const { error } = await supabase
      .from("exams")
      .update({ performed: !exam.performed })
      .eq("id", exam.id);
    if (error) {
      console.error(error);
      alert("Error al actualizar estado");
    } else fetchExams();
  };

  const uploadFile = async (examId, file) => {
    if (!file) return;
    const filePath = `exams/${examId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("exams-pdfs")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      alert("Error al subir archivo");
      return;
    }

    const { error: updateError } = await supabase
      .from("exams")
      .update({ storage_path: filePath })
      .eq("id", examId);

    if (updateError) console.error(updateError);
    else alert("Archivo subido correctamente");
    fetchExams();
  };

  const getPublicUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("exams-pdfs").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const handleNewExam = () => {
  navigate("/specialist/create-exam");
};

  return (
    <div>
      {/* 🔹 Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <label style={{ fontWeight: 600, marginRight: "8px" }}>Filtrar por estado:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px" }}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="done">Realizados</option>
          </select>
        </div>

        <button
          onClick={handleNewExam}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Nuevo examen
        </button>
      </div>

      {/* 🔹 Tabla */}
      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : exams.length === 0 ? (
          <p>No hay exámenes en este estado.</p>
        ) : (
          <table className="exams-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Diagnóstico</th>
                <th>Archivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.profiles?.full_name || "—"}</td>
                  <td>{new Date(exam.scheduled_at).toLocaleString()}</td>
                  <td>
                    <button
                      className={`status-btn ${exam.performed ? "done" : "pending"}`}
                      onClick={() => togglePerformed(exam)}
                    >
                      {exam.performed ? "Realizado" : "Pendiente"}
                    </button>
                  </td>
                  <td>
                    {editingExam === exam.id ? (
                      <textarea
                        value={updatedFields[exam.id]?.observations ?? exam.observations ?? ""}
                        onChange={(e) =>
                          setUpdatedFields({
                            ...updatedFields,
                            [exam.id]: {
                              ...updatedFields[exam.id],
                              observations: e.target.value,
                            },
                          })
                        }
                        rows="3"
                        style={{ width: "100%", padding: "6px" }}
                      />
                    ) : (
                      exam.observations || "—"
                    )}
                  </td>
                  <td>
                    {editingExam === exam.id ? (
                      <input
                        type="text"
                        value={updatedFields[exam.id]?.diagnosis ?? exam.diagnosis ?? ""}
                        onChange={(e) =>
                          setUpdatedFields({
                            ...updatedFields,
                            [exam.id]: {
                              ...updatedFields[exam.id],
                              diagnosis: e.target.value,
                            },
                          })
                        }
                        style={{ width: "100%", padding: "6px" }}
                      />
                    ) : (
                      exam.diagnosis || "—"
                    )}
                  </td>
                  <td>
                    {exam.storage_path ? (
                      <a
                        href={getPublicUrl(exam.storage_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📄 Ver archivo
                      </a>
                    ) : (
                      <input type="file" onChange={(e) => uploadFile(exam.id, e.target.files[0])} />
                    )}
                  </td>
                  <td>
                    {editingExam === exam.id ? (
                      <>
                        <button className="save-btn" onClick={() => handleSave(exam.id)}>
                          💾 Guardar
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingExam(null)}>
                          ✖ Cancelar
                        </button>
                      </>
                    ) : (
                      <button className="edit-btn" onClick={() => setEditingExam(exam.id)}>
                        ✏️ Editar
                      </button>
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
