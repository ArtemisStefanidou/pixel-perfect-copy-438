import { useEffect, useState } from "react";

export type ListingType = "Internship" | "Full-time" | "Part-time";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Listing {
  id: string;
  title: string;
  company: string;
  emoji: string;
  city: string;
  country: string;
  type: ListingType;
  remote: "Remote" | "On-site" | "Hybrid";
  duration: string;
  sector: string;
  skills: string[];
  postedDaysAgo: number;
  description: string;
  requirements: string[];
  closingSoon?: boolean;
  postedBy?: string; // SME email
}

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
  "Public Sector",
];

export const SEED_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Junior UI/UX Designer",
    company: "TechFlow Solutions",
    emoji: "⚡",
    city: "Belgrade",
    country: "Serbia",
    type: "Internship",
    remote: "Remote",
    duration: "3 Months",
    sector: "Design",
    skills: ["Figma", "User Research", "Prototyping"],
    postedDaysAgo: 2,
    description:
      "Join our design team to craft delightful interfaces for fintech products used across the Balkans. You will collaborate with senior designers on production-ready flows.",
    requirements: [
      "Portfolio with 2+ case studies",
      "Working knowledge of Figma",
      "English B2 or higher",
    ],
  },
  {
    id: "2",
    title: "Sustainability Analyst",
    company: "GreenGrowth NGO",
    emoji: "🌱",
    city: "Sarajevo",
    country: "Bosnia and Herzegovina",
    type: "Internship",
    remote: "On-site",
    duration: "6 Months",
    sector: "Sustainability",
    skills: ["Data Analysis", "Excel", "Reporting"],
    postedDaysAgo: 4,
    description:
      "Support our research team in measuring the regional impact of Erasmus+ green initiatives. Includes field visits and stakeholder interviews.",
    requirements: [
      "Background in environmental studies or economics",
      "Erasmus+ eligibility",
      "Strong analytical writing",
    ],
  },
  {
    id: "3",
    title: "Market Research Intern",
    company: "Global Insights",
    emoji: "📊",
    city: "Skopje",
    country: "North Macedonia",
    type: "Internship",
    remote: "Hybrid",
    duration: "6 Months",
    sector: "Research",
    skills: ["Market Research", "SPSS", "Survey Design"],
    postedDaysAgo: 7,
    description:
      "Conduct primary and secondary market research for SME clients entering the EU market. Closing soon — apply early.",
    requirements: [
      "3rd year or above in Economics/Business",
      "Familiarity with statistical tools",
      "Excellent communication skills",
    ],
    closingSoon: true,
  },
  {
    id: "4",
    title: "Junior Frontend Developer",
    company: "Altos Tech",
    emoji: "💻",
    city: "Tirana",
    country: "Albania",
    type: "Internship",
    remote: "Remote",
    duration: "4 Months",
    sector: "Technology",
    skills: ["React", "TypeScript", "TailwindCSS"],
    postedDaysAgo: 1,
    description:
      "Build modern web applications alongside a senior team. Pair-programming, code reviews, and a clear mentorship plan.",
    requirements: [
      "Basic React knowledge",
      "Git workflow familiarity",
      "Curiosity and willingness to learn",
    ],
  },
  {
    id: "5",
    title: "Content Marketing Intern",
    company: "BalkanBrand",
    emoji: "✏️",
    city: "Podgorica",
    country: "Montenegro",
    type: "Part-time",
    remote: "Hybrid",
    duration: "3 Months",
    sector: "Marketing",
    skills: ["Copywriting", "SEO", "Social Media"],
    postedDaysAgo: 9,
    description:
      "Help shape the editorial voice for a fast-growing regional consumer brand. You'll publish weekly and learn analytics.",
    requirements: [
      "Strong writing portfolio",
      "Native or near-native English",
      "Interest in brand storytelling",
    ],
  },
  {
    id: "6",
    title: "Public Policy Research Assistant",
    company: "Pristina Institute",
    emoji: "🏛️",
    city: "Pristina",
    country: "Kosovo",
    type: "Internship",
    remote: "On-site",
    duration: "5 Months",
    sector: "Public Sector",
    skills: ["Policy Analysis", "Academic Writing", "Stakeholder Mapping"],
    postedDaysAgo: 12,
    description:
      "Support a multi-country study on youth employability outcomes for Erasmus+ alumni in the Western Balkans.",
    requirements: [
      "Political Science or Public Admin background",
      "Research experience preferred",
      "English C1",
    ],
  },
];

/* ============ Listings store (seed + localStorage SME additions) ============ */

const LISTINGS_KEY = "skillsbox.listings.custom";

function readCustom(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    return raw ? (JSON.parse(raw) as Listing[]) : [];
  } catch {
    return [];
  }
}

function writeCustom(list: Listing[]) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("skillsbox:listings"));
}

export function getAllListings(): Listing[] {
  return [...readCustom(), ...SEED_LISTINGS];
}

export function getListingById(id: string): Listing | undefined {
  return getAllListings().find((l) => l.id === id);
}

export function addListing(input: Omit<Listing, "id" | "postedDaysAgo">): Listing {
  const created: Listing = {
    ...input,
    id: `sme-${Date.now()}`,
    postedDaysAgo: 0,
  };
  const next = [created, ...readCustom()];
  writeCustom(next);
  return created;
}

export function useListings(): Listing[] {
  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  useEffect(() => {
    const sync = () => setListings(getAllListings());
    sync();
    window.addEventListener("skillsbox:listings", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("skillsbox:listings", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return listings;
}

// Backwards-compat export used by some components.
export const LISTINGS = SEED_LISTINGS;

/* ============ Learning modules + badges ============ */

export interface ModuleLesson {
  kind: "ppt" | "video";
  title: string;
  url: string; // demo URL (slideshare, youtube embed, etc.)
  duration: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface LearningModule {
  id: string;
  title: string;
  emoji: string;
  description: string;
  estMinutes: number;
  badgeName: string;
  badgeColor: string;
  lessons: ModuleLesson[]; // exactly 2 ppt + 2 video
  quiz: QuizQuestion[];
}

export const MODULES: LearningModule[] = [
  {
    id: "digital-skills",
    title: "Digital Skills Essentials",
    emoji: "💡",
    description: "Build foundational digital literacy — from collaboration tools to cybersecurity hygiene.",
    estMinutes: 90,
    badgeName: "Digital Citizen",
    badgeColor: "#2563eb",
    lessons: [
      { kind: "ppt", title: "Intro to Digital Collaboration", url: "https://www.slideshare.net/", duration: "12 slides" },
      { kind: "ppt", title: "Cybersecurity Basics", url: "https://www.slideshare.net/", duration: "18 slides" },
      { kind: "video", title: "Cloud Tools Tour", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "8 min" },
      { kind: "video", title: "Data Privacy 101", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "10 min" },
    ],
    quiz: [
      { q: "Which is the strongest password?", options: ["123456", "password", "Tr0ub4dor&3!"], answer: 2 },
      { q: "What does 2FA stand for?", options: ["Two-Factor Auth", "Two-File Access", "Twin Firewall App"], answer: 0 },
      { q: "Which is a cloud collaboration suite?", options: ["Photoshop", "Google Workspace", "VLC"], answer: 1 },
    ],
  },
  {
    id: "europass-cv",
    title: "Europass CV Mastery",
    emoji: "📄",
    description: "Craft a Europass CV recruiters actually read — structure, keywords, and tailoring per role.",
    estMinutes: 60,
    badgeName: "CV Pro",
    badgeColor: "#0891b2",
    lessons: [
      { kind: "ppt", title: "Europass Structure", url: "https://www.slideshare.net/", duration: "14 slides" },
      { kind: "ppt", title: "Keyword Tailoring", url: "https://www.slideshare.net/", duration: "10 slides" },
      { kind: "video", title: "Writing Strong Bullets", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "7 min" },
      { kind: "video", title: "Common CV Mistakes", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "6 min" },
    ],
    quiz: [
      { q: "A strong bullet starts with…", options: ["A noun", "An action verb", "An adjective"], answer: 1 },
      { q: "Best CV length for a student?", options: ["1 page", "3 pages", "5 pages"], answer: 0 },
      { q: "Europass is maintained by…", options: ["UN", "European Commission", "OECD"], answer: 1 },
    ],
  },
  {
    id: "interview-skills",
    title: "Interview Skills",
    emoji: "🎤",
    description: "STAR method, behavioural questions, and confident delivery for online and on-site interviews.",
    estMinutes: 75,
    badgeName: "Interview Ready",
    badgeColor: "#7c3aed",
    lessons: [
      { kind: "ppt", title: "STAR Method", url: "https://www.slideshare.net/", duration: "12 slides" },
      { kind: "ppt", title: "Question Bank", url: "https://www.slideshare.net/", duration: "20 slides" },
      { kind: "video", title: "Body Language Tips", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "9 min" },
      { kind: "video", title: "Salary Negotiation", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "11 min" },
    ],
    quiz: [
      { q: "STAR stands for…", options: ["Situation, Task, Action, Result", "Skill, Talent, Aim, Reward", "Story, Theme, Arc, Resolution"], answer: 0 },
      { q: "Best answer to 'tell me about yourself'?", options: ["Life story", "30-60s career pitch", "Hobbies"], answer: 1 },
      { q: "When to discuss salary?", options: ["First minute", "When invited / final stage", "Never"], answer: 1 },
    ],
  },
  {
    id: "entrepreneurship",
    title: "Entrepreneurship 101",
    emoji: "🚀",
    description: "From idea validation to lean canvas — the basics of building something users want.",
    estMinutes: 100,
    badgeName: "Founder Mindset",
    badgeColor: "#ea580c",
    lessons: [
      { kind: "ppt", title: "Lean Canvas Walkthrough", url: "https://www.slideshare.net/", duration: "16 slides" },
      { kind: "ppt", title: "Customer Discovery", url: "https://www.slideshare.net/", duration: "12 slides" },
      { kind: "video", title: "MVP in 1 week", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "12 min" },
      { kind: "video", title: "Pitching to Investors", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "14 min" },
    ],
    quiz: [
      { q: "MVP stands for…", options: ["Most Valuable Player", "Minimum Viable Product", "Market Volume Projection"], answer: 1 },
      { q: "Lean Canvas was created by…", options: ["Ash Maurya", "Steve Jobs", "Peter Thiel"], answer: 0 },
      { q: "First step in customer discovery?", options: ["Build the product", "Talk to users", "Raise funding"], answer: 1 },
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability at Work",
    emoji: "🌍",
    description: "ESG basics, the SDGs, and applying sustainable practices in any role.",
    estMinutes: 80,
    badgeName: "Green Professional",
    badgeColor: "#16a34a",
    lessons: [
      { kind: "ppt", title: "The 17 SDGs", url: "https://www.slideshare.net/", duration: "20 slides" },
      { kind: "ppt", title: "ESG in SMEs", url: "https://www.slideshare.net/", duration: "14 slides" },
      { kind: "video", title: "Circular Economy", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "10 min" },
      { kind: "video", title: "Measuring Carbon Footprint", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "8 min" },
    ],
    quiz: [
      { q: "How many UN SDGs are there?", options: ["12", "17", "21"], answer: 1 },
      { q: "ESG stands for…", options: ["Environmental, Social, Governance", "Energy, Safety, Growth", "Ethics, Strategy, Goals"], answer: 0 },
      { q: "A circular economy aims to…", options: ["Maximise waste", "Eliminate waste & reuse materials", "Use only fossil fuels"], answer: 1 },
    ],
  },
];

/* ============ Earned badges store ============ */

const BADGES_KEY = "skillsbox.badges";

export interface EarnedBadge {
  moduleId: string;
  earnedAt: string;
  score: number;
}

export function getEarnedBadges(): EarnedBadge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? (JSON.parse(raw) as EarnedBadge[]) : [];
  } catch {
    return [];
  }
}

export function awardBadge(moduleId: string, score: number) {
  const all = getEarnedBadges().filter((b) => b.moduleId !== moduleId);
  all.push({ moduleId, earnedAt: new Date().toISOString(), score });
  localStorage.setItem(BADGES_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("skillsbox:badges"));
}

export function useEarnedBadges(): EarnedBadge[] {
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  useEffect(() => {
    const sync = () => setBadges(getEarnedBadges());
    sync();
    window.addEventListener("skillsbox:badges", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("skillsbox:badges", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return badges;
}
