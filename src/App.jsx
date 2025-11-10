// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// ⚙️ Ajustes globales
// SettingsProvider is provided in main.jsx; don't wrap again here
import SettingsBubble from "./components/SettingsBubble";

// Auth
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Dashboard base
import Dashboard from "./pages/Dashboard";

// Admin pages
import AdminUsers from "./pages/admin/Users";
import AdminAppointments from "./pages/admin/Appointments";
import AdminNewAppointment from "./pages/admin/AdminNewAppointment"
import Exams from "./pages/admin/Exams";
import CreateExamForm from "./pages/admin/CreateExamForm";
import AdminReferrals from "./pages/admin/Referrals";

// Especialistas pages
import SpecialistProfile from "./pages/specialist/Profile";
import SpecialistAppointments from "./pages/specialist/Appointments";
import SpecialistNewAppointment from "./pages/specialist/SpecialistNewAppointment"
import SpecialistExams from "./pages/specialist/Exams";
import SpecialistCreateExamForm from "./pages/specialist/SpecialistCreateExamForm"
import SpecialistReferrals from "./pages/specialist/Referrals";
import SpecialistCreateReferral from "./pages/specialist/SpecialistCreateReferral";
import SpecialistUsers from "./pages/specialist/Users";

// PAciente pages
import PatientProfile from "./pages/patient/Profile";
import AppointmentsList from "./pages/patient/AppointmentsList";
import NewAppointment from "./pages/patient/NewAppointment";
import PatientExams from "./pages/patient/Exams";
import PatientReferrals from "./pages/patient/Referrals";
import PatientGames from "./pages/patient/Games/Games";

export default function App() {
  const { session, profile, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Cargando autenticación...</div>;

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Si NO hay sesión → redirigir a /signin */}
        {!session ? (
          <Route path="*" element={<Navigate to="/signin" replace />} />
        ) : (
          // Rutas privadas: todo dentro del DashboardLayout para mantener Sidebar fijo
          <Route element={<DashboardLayout />}>
            {/* Dashboard general (visible para todos los roles) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Rutas ADMIN */}
            {profile?.role === "admin" && (
              <>
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                <Route path="/admin/new-appointment" element={<AdminNewAppointment />} />
                <Route path="/admin/exams" element={<Exams />} />
                <Route path="/admin/create-exam" element={<CreateExamForm />} />
                <Route path="/admin/referrals" element={<AdminReferrals />} />
                <Route path="*" element={<Navigate to="/admin/users" replace />} />
              </>
            )}

            {/* Rutas ESPECIALISTA */}
            {(profile?.role === "optometrist" || profile?.role === "ortoptist") && (
              <>
                <Route path="/specialist/profile" element={<SpecialistProfile />} />
                <Route path="/specialist/appointments" element={<SpecialistAppointments />} />
                <Route path="/specialist/exams" element={<SpecialistExams />} />
                <Route path="/specialist/create-exam" element={<SpecialistCreateExamForm />} />
                <Route path="/specialist/referrals" element={<SpecialistReferrals />} />
                <Route path="/specialist/referrals/new" element={<SpecialistCreateReferral />} />
                <Route path="/specialist/new-appointment" element={<SpecialistNewAppointment />} />
                <Route path="/specialist/users" element={<SpecialistUsers />} />
                <Route path="*" element={<Navigate to="/specialist/profile" replace />} />
              </>
            )}

            {/* Rutas PACIENTE */}
            {profile?.role === "patient" && (
              <>
                <Route path="/patient/profile" element={<PatientProfile />} />
                <Route path="/patient/appointments" element={<AppointmentsList />} />
                <Route path="/patient/new-appointment" element={<NewAppointment />} />
                <Route path="/patient/exams" element={<PatientExams />} />
                <Route path="/patient/referrals" element={<PatientReferrals />} />
                <Route path="/patient/games" element={<PatientGames />} />
                <Route path="*" element={<Navigate to="/patient/profile" replace />} />
              </>
            )}
          </Route>
        )}
      </Routes>
    </BrowserRouter>

     <SettingsBubble />
    </>
  );
}
