import { supabase } from "@/integrations/supabase/client";
import type { Company, Profile, Role } from "@/lib/auth-context";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/* ---------- fetch plumbing ---------- */

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.detail ?? message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Like `api`, but a 404 resolves to `null` instead of throwing — for lookups that are
 * expected to sometimes have no result (e.g. "did this student already apply?"). */
async function apiOrNull<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    return await api<T>(path, init);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/* ---------- current user ---------- */

export interface MeResponse {
  profile: Profile | null;
  roles: Role[];
  company: Company | null;
}

export async function fetchMe(): Promise<MeResponse> {
  return api<MeResponse>("/me");
}

/* ---------- shared option lists ---------- */

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

export type ApplicationStatus = "submitted" | "reviewed" | "interview" | "accepted" | "rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted",
  "reviewed",
  "interview",
  "accepted",
  "rejected",
];

/* ---------- listings ---------- */

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

export async function fetchListings() {
  return api<ListingRow[]>("/listings");
}

export async function fetchListing(id: string) {
  return apiOrNull<ListingRow>(`/listings/${id}`);
}

export async function fetchMyListings(_ownerId: string) {
  return api<ListingRow[]>("/listings/mine");
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
  const { company_id: _company_id, owner_id: _owner_id, ...body } = input;
  return api<{ id: string }>("/listings", { method: "POST", body: JSON.stringify(body) });
}

export async function setListingStatus(id: string, status: "active" | "closed") {
  await api(`/listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

/* ---------- applications ---------- */

export async function applyToListing(listingId: string, _studentId: string, coverNote: string) {
  await api("/applications", {
    method: "POST",
    body: JSON.stringify({ listing_id: listingId, cover_note: coverNote || null }),
  });
}

export async function fetchMyApplications(_studentId: string) {
  return api<ApplicationRow[]>("/applications/mine");
}

export async function fetchApplicationForListing(listingId: string, _studentId: string) {
  return api<ApplicationRow | null>(`/applications/by-listing/${listingId}`);
}

export async function fetchApplicationsForOwner(_ownerId: string) {
  return api<ApplicationRow[]>("/applications/for-owner");
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  await api(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
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

/* ---------- admin ---------- */

export interface CompanyRow {
  id: string;
  owner_id: string;
  name: string;
  sector: string | null;
  city: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export async function fetchCompanies() {
  return api<CompanyRow[]>("/companies");
}

export async function setCompanyStatus(id: string, status: "pending" | "approved" | "rejected") {
  await api(`/companies/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function updateMyInstitution(_userId: string, institution: string) {
  await api("/me/profile", { method: "PATCH", body: JSON.stringify({ institution }) });
}

export interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  pendingCompanies: number;
  approvedCompanies: number;
  totalListings: number;
  activeListings: number;
  totalApplications: number;
}

interface PlatformStatsResponse {
  total_users: number;
  total_students: number;
  total_companies: number;
  pending_companies: number;
  approved_companies: number;
  total_listings: number;
  active_listings: number;
  total_applications: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const r = await api<PlatformStatsResponse>("/admin/platform-stats");
  return {
    totalUsers: r.total_users,
    totalStudents: r.total_students,
    totalCompanies: r.total_companies,
    pendingCompanies: r.pending_companies,
    approvedCompanies: r.approved_companies,
    totalListings: r.total_listings,
    activeListings: r.active_listings,
    totalApplications: r.total_applications,
  };
}

export interface InstitutionStats {
  studentCount: number;
  applicationCount: number;
  statusBreakdown: Record<ApplicationStatus, number>;
}

interface InstitutionStatsResponse {
  student_count: number;
  application_count: number;
  status_breakdown: Record<ApplicationStatus, number>;
}

export async function fetchInstitutionStats(_institution: string): Promise<InstitutionStats> {
  const r = await api<InstitutionStatsResponse>("/admin/institution-stats");
  return {
    studentCount: r.student_count,
    applicationCount: r.application_count,
    statusBreakdown: r.status_breakdown,
  };
}

export async function grantRole(
  email: string,
  role: Extract<Role, "hei_admin" | "platform_admin">,
) {
  return api<{ id: string; full_name: string }>("/admin/grant-role", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}
