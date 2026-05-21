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

export const LISTINGS: Listing[] = [
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
