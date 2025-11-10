// src/api/profile.js
import { supabase } from "../api/supabaseClient";

/**
 * Obtener perfil (profiles) y datos extra de patients (si existen)
 * @param {string} userId
 */
export async function getFullProfile(userId) {
  // Obtener profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  // Obtener datos extra de patients (puede ser null)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // may return null

  if (patientError) throw patientError;

  return { profile, patient };
}

/**
 * Actualizar tabla profiles
 * @param {string} userId
 * @param {object} payload  { full_name, phone, role? }
 */
export async function updateProfile(userId, payload) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Upsert a patients (datos extra como birthdate, address)
 * @param {string} userId
 * @param {object} payload { birthdate, address }
 */
export async function upsertPatientExtra(userId, payload) {
  // Upsert: insert or update by primary key id
  const row = { id: userId, ...payload };
  const { data, error } = await supabase.from("patients").upsert(row, {
    onConflict: "id",
    returning: "representation",
  });

  return { data, error };
}
