import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export const useRoleGuard = (allowedRoles) => {
  const { profile, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // Si no hay perfil o el rol no está permitido, redirige
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo bien, retorna null (deja pasar)
  return null;
};
