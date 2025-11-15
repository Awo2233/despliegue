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
  const [search, setSearch] = useState("");
  const [editingExam, setEditingExam] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    if (profile?.id) fetchExams();
  }, [profile, filter, search]);

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
        profiles!exams_patient_id_fkey(full_name, email, patients ( document ))
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
      let results = data || [];
      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        results = results.filter((exam) => {
          const p = exam.profiles || {};
          const name = (p.full_name || "").toLowerCase();
          const email = (p.email || "").toLowerCase();
          const doc = (
            (p.patients && (p.patients.document || (Array.isArray(p.patients) && p.patients[0]?.document))) || ""
          ).toLowerCase();
          return name.includes(term) || email.includes(term) || doc.includes(term);
        });
      }
      setExams(results);
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

  // Descargar plantilla desde el bucket 'pantilla' en Supabase Storage
  const downloadTemplate = async () => {
    // Nombre exacto del archivo en el bucket (según imagen proporcionada)
    const filename = "prantilla examenes optica.pdf";
    const bucket = "pantilla";
    try {
      // Primero intentar URL pública
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
      const publicUrl = publicData?.publicUrl;
      if (publicUrl) {
        // Forzar descarga abriendo en nueva pestaña
        const a = document.createElement("a");
        a.href = publicUrl;
        a.download = filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Si no es pública, obtener signed URL y descargar el blob para forzar descarga
      const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(filename, 120);
      if (signedError || !signedData?.signedUrl) throw signedError || new Error("No se pudo generar la URL de descarga");

      const resp = await fetch(signedData.signedUrl);
      if (!resp.ok) throw new Error("Error al obtener el archivo desde storage");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar la plantilla: " + (err?.message || err));
    }
  };

  return (
    <div>
      {/* 🔹 Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
        <h1>Examenes</h1>
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
          <input
            type="text"
            placeholder="Buscar por nombre, documento o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginLeft: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.12)", minWidth: 220 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={downloadTemplate}
            className="btn btn-ghost"
            style={{ padding: "8px 12px", fontSize: "0.9rem" }}
          >
            📥 Plantilla de examenes
          </button>

          <button
            onClick={handleNewExam}
            className="btn btn-primary new-exam-btn"
          >
            ➕ Nuevo examen
          </button>
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
                  <td>{new Date(exam.scheduled_at).toLocaleString("es-CO", { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</td>
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
