import { supabase } from "@/integrations/supabase/client";

export const COUNTRIES = [
  "Albania",
  "Bosnia and Herzegovina",
  "Kosovo",
  "Montenegro",
  "North Macedonia",
  "Serbia",
];

export const SECTORS = [
  "Technology",
  "Design",
  "Marketing",
  "Sustainability",
  "Research",
  "Finance",
  "Education",
  "Tourism",
];

export const LISTING_TYPES = ["Internship", "Full-time", "Part-time"];
export const WORK_MODES = ["On-site", "Remote", "Hybrid"];

export type ApplicationStatus =
  | "submitted"
  | "reviewed"
  | "interview"
  | "accepted"
  | "rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted",
  "reviewed",
  "interview",
  "accepted",
  "rejected",
];

export interface ListingRow {
  id: string;
  company_id: string;
  owner_id: string;
  title: string;
  description: string;
  sector: string | null;
  listing_type: string;
  work_mode: string;
  required_skills: string[];
  duration: string | null;
  city: string | null;
  country: string | null;
  deadline: string | null;
  status: "active" | "closed";
  created_at: string;
  companies?: { name: string; sector: string | null; status: string } | null;
}

export interface ApplicationRow {
  id: string;
  listing_id: string;
  student_id: string;
  cover_note: string | null;
  status: ApplicationStatus;
  created_at: string;
  listings?: ListingRow | null;
  profiles?: {
    full_name: string;
    email: string | null;
    institution: string | null;
    skills: string[];
    headline: string | null;
  } | null;
}

const LISTING_SELECT = "*, companies(name, sector, status)";

export async function fetchListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingRow[];
}

export async function fetchListing(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ListingRow) ?? null;
}

export async function fetchMyListings(ownerId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingRow[];
}

export interface NewListingInput {
  company_id: string;
  owner_id: string;
  title: string;
  description: string;
  sector: string | null;
  listing_type: string;
  work_mode: string;
  required_skills: string[];
  duration: string | null;
  city: string | null;
  country: string | null;
  deadline: string | null;
}

export async function createListing(input: NewListingInput) {
  const { data, error } = await supabase
    .from("listings")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

export async function setListingStatus(id: string, status: "active" | "closed") {
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw error;
}

/* ---------- Applications ---------- */

export async function applyToListing(listingId: string, studentId: string, coverNote: string) {
  const { error } = await supabase.from("applications").insert({
    listing_id: listingId,
    student_id: studentId,
    cover_note: coverNote || null,
  });
  if (error) throw error;
}

export async function fetchMyApplications(studentId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(`*, listings(${LISTING_SELECT})`)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ApplicationRow[];
}

export async function fetchApplicationForListing(listingId: string, studentId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("listing_id", listingId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ApplicationRow) ?? null;
}

export async function fetchApplicationsForOwner(ownerId: string) {
  const { data: listings, error: le } = await supabase
    .from("listings")
    .select("id, title")
    .eq("owner_id", ownerId);
  if (le) throw le;
  const ids = (listings ?? []).map((l) => l.id);
  if (ids.length === 0) return [] as ApplicationRow[];
  const { data, error } = await supabase
    .from("applications")
    .select(
      "*, listings(id, title, city, country), profiles!applications_student_id_fkey(full_name, email, institution, skills, headline)",
    )
    .in("listing_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ApplicationRow[];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) throw error;
}

/* ---------- Admin ---------- */

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setCompanyStatus(id: string, status: "pending" | "approved" | "rejected") {
  const { error } = await supabase.from("companies").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, institution, skills, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function statusTone(status: ApplicationStatus) {
  switch (status) {
    case "accepted":
      return "bg-success/10 text-success";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    case "interview":
      return "bg-primary/10 text-primary";
    default:
      return "bg-secondary text-muted-foreground";
  }
}
