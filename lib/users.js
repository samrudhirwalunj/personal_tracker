import { getSupabase } from "./supabase";

export async function findUserByPhone(phone) {
  const { data, error } = await getSupabase().from("personal_tracker_users").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findUserById(id) {
  const { data, error } = await getSupabase().from("personal_tracker_users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUser(phone, profile) {
  const {
    name = null,
    age = null,
    gender = null,
    jobType = null,
    lifestyle = null,
    wakeTime = null,
    focusArea = null,
    healthNotes = null,
    selfReview = null,
    bestThing = null,
    reminderOptIn = true,
  } = profile;

  const { data, error } = await getSupabase()
    .from("personal_tracker_users")
    .insert({
      phone,
      name,
      age,
      gender,
      job_type: jobType,
      lifestyle,
      wake_time: wakeTime,
      focus_area: focusArea,
      health_notes: healthNotes,
      self_review: selfReview,
      best_thing: bestThing,
      reminder_opt_in: reminderOptIn,
      onboarding_completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId, profile) {
  const map = {
    name: "name",
    age: "age",
    gender: "gender",
    jobType: "job_type",
    lifestyle: "lifestyle",
    wakeTime: "wake_time",
    focusArea: "focus_area",
    healthNotes: "health_notes",
    selfReview: "self_review",
    bestThing: "best_thing",
    reminderOptIn: "reminder_opt_in",
  };

  const update = {};
  for (const [key, column] of Object.entries(map)) {
    if (key in profile) update[column] = profile[key];
  }

  if (Object.keys(update).length === 0) return findUserById(userId);

  const { data, error } = await getSupabase().from("personal_tracker_users").update(update).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}

export async function listUsersForAdmin() {
  const { data, error } = await getSupabase()
    .from("personal_tracker_users")
    .select("id, phone, name, onboarding_completed_at, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function countUsers() {
  const { count, error } = await getSupabase().from("personal_tracker_users").select("*", { count: "exact", head: true });
  if (error) throw error;
  return count;
}
