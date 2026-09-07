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
