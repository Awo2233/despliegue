import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import CreateExamForm from "./CreateExamForm"

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [editingExam, setEditingExam] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [filterState, filterRole]);

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
        created_at,
        profiles!exams_patient_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (filterState === "pending") query = query.eq("performed", false);
    if (filterState === "done") query = query.eq("performed", true);
    if (filterRole !== "all") query = query.eq("specialist_role", filterRole);

    const { data, error } = await query;
    if (error) console.error("Error al obtener exámenes:", error);
    else setExams(data || []);
    setLoading(false);
  };

  const getPublicUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("exams-pdfs").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const togglePerformed = async (exam) => {
    const { error } = await supabase
      .from("exams")
      .update({ performed: !exam.performed })
      .eq("id", exam.id);
    if (error) console.error(error);
    else fetchExams();
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

  const deleteExam = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este examen?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Error al eliminar examen");
    } else {
      alert("Examen eliminado correctamente");
      fetchExams();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Gestión de Exámenes</h2>

      {/* 🔹 Botón para crear nuevo examen */}
      <button
        onClick={() => navigate("/admin/create-exam")}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "10px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        ➕ Crear nuevo examen
      </button>

      {/* 🔹 Filtros */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontWeight: 600, marginRight: "8px" }}>Estado:</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px" }}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="done">Realizados</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600, marginRight: "8px" }}>Especialista:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px" }}
          >
            <option value="all">Ambos</option>
            <option value="optometrist">Optometrista</option>
            <option value="ortoptist">Ortoptista</option>
          </select>
        </div>
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
                <th>Especialista</th>
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
                  <td>{exam.specialist_role}</td>
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
                      <>
                        <button className="edit-btn" onClick={() => setEditingExam(exam.id)}>
                          ✏️ Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteExam(exam.id)}
                          style={{ marginLeft: "6px" }}
                        >
                          🗑 Eliminar
                        </button>
                      </>
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
