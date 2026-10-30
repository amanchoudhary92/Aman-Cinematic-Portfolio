export type ProjectSlug = string;
export type ProjectSceneKey = "campus" | "codeshield" | "mistvale" | "platform" | "security" | "ecommerce" | "backend" | "abstract" | "portfolio" | "minimal";

export type PortfolioProject = {
  slug: ProjectSlug;
  number: string;
  title: string;
  displayTitle: string;
  category: string;
  scene: ProjectSceneKey;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  role: string;
  year: string;
  stack: string[];
  images: Array<{ src: string; label: string; note: string; width: number; height: number }>;
  github?: string;
  live?: string;
  architecture?: string[];
  decisions?: Array<{ title: string; body: string }>;
  features?: Array<{ title: string; body: string }>;
  challengeNote?: string;
};

export const projects: PortfolioProject[] = [
  {
    slug: "campus-hub",
    number: "01",
    title: "Secure Campus Resource Hub",
    displayTitle: "SECURE CAMPUS HUB",
    category: "FULL-STACK / SECURITY / PRODUCT ENGINEERING",
    scene: "campus",
    summary: "A moderation-first academic resource platform built around secure uploads, controlled visibility, signed downloads, admin review and accountable system actions.",
    challenge: "Resource sharing becomes risky when uploads go public without validation, moderation, duplicate checks or clear access rules. The project treats trust and safety as part of the product flow instead of an afterthought.",
    approach: "I structured the experience around student and admin roles, private storage, approval states, file validation, duplicate detection, audit records and searchable resource discovery. The UI makes those rules visible without overwhelming the user.",
    outcome: "The result is a complete student-to-admin workflow: resources are uploaded privately, reviewed before visibility, controlled through role-aware actions and surfaced through a clearer discovery experience.",
    role: "Full-Stack Development / Product UI / Security Flows",
    year: "2026",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase Auth", "PostgreSQL", "Supabase Storage", "RLS", "Vitest", "Vercel"],
    images: [
      { src: "/projects/campus-dashboard.webp", label: "Dashboard", note: "Resource discovery and safety policy overview", width: 1916, height: 965 },
      { src: "/projects/campus-upload.webp", label: "Secure Upload", note: "Private storage, hashing and admin review states", width: 1919, height: 965 },
      { src: "/projects/campus-moderation.webp", label: "Moderation", note: "Approve, reject, block and inspect resource submissions", width: 1915, height: 956 },
      { src: "/projects/campus-audit.webp", label: "Audit Trail", note: "Accountability for sensitive moderation and download actions", width: 1919, height: 969 },
      { src: "/projects/campus-users.webp", label: "User Control", note: "Role-aware user access and restriction management", width: 1918, height: 953 },
      { src: "/projects/campus-profile.webp", label: "Student Profile", note: "Personal status, activity and upload visibility", width: 1915, height: 965 },
    ],
    github: "https://github.com/amanchoudhary92/secure-campus-resource-hub",
    live: "https://secure-campus-resource-hub.vercel.app",
  },
  {
    slug: "codeshield-ai",
    number: "02",
    title: "CodeShield AI",
    displayTitle: "CODESHIELD AI",
    category: "DEVSECOPS / GITHUB AUTOMATION / SECURITY",
    scene: "codeshield",
    summary: "A working GitHub PR security-bot demo that scans pull-request diffs for leaked secrets, hardcoded credentials and common vulnerability patterns before merge.",
    challenge: "Security problems often enter a codebase during normal pull-request work. The idea was to surface useful warnings where developers already review changes instead of forcing them into a separate workflow.",
    approach: "The GitHub App receives PR events, verifies webhook signatures, scans changed code and publishes findings back to the pull request. The demo targets secrets, credentials, database URLs, possible SQL injection, unsafe eval usage and common JavaScript, TypeScript and Python risks.",
    outcome: "The demo validates an end-to-end PR security workflow: event received, diff inspected, findings produced and review feedback returned directly inside GitHub.",
    role: "Backend / GitHub App Integration / Security Tooling / Frontend Demo",
    year: "2026",
    stack: ["Node.js", "GitHub App API", "Webhook Verification", "Custom Scanners", "Next.js", "Tailwind CSS", "Vercel", "Render"],
    images: [],
    github: "https://github.com/amanchoudhary92/codeshield-ai-demo",
    live: "https://codeshield-ai-demo.vercel.app",
  },
  {
    slug: "mistvale-tea",
    number: "03",
    title: "Mistvale Tea Co.",
    displayTitle: "MISTVALE TEA CO.",
    category: "E-COMMERCE / FRONTEND / SHOPPING UX",
    scene: "mistvale",
    summary: "A premium tea storefront project focused on visual merchandising, product discovery, useful filtering, delivery checking, offers and a calmer purchase journey.",
    challenge: "A storefront has to balance atmosphere with practical shopping tasks. The design needed to feel premium while keeping product search, filtering, delivery information and purchase actions obvious.",
    approach: "I used an editorial tea-brand visual system around a structured commerce flow: branded hero, category browsing, filtering, search, product quick view, offer messaging, pincode delivery checks, FAQ content and conversion support.",
    outcome: "The finished storefront presents a consistent brand experience while keeping the core shopping journey understandable from landing page to product decision and support information.",
    role: "Frontend Development / Storefront UI / Interaction Design",
    year: "2026",
    stack: ["HTML", "CSS", "JavaScript", "Responsive UI", "Search", "Filters", "Quick View", "Commerce UX"],
    images: [
      { src: "/projects/mistvale-home.webp", label: "Homepage", note: "Brand-led hero and shopping entry points", width: 1912, height: 887 },
      { src: "/projects/mistvale-shop.webp", label: "Collection", note: "Search, category filters and product browsing", width: 1907, height: 913 },
      { src: "/projects/mistvale-product.webp", label: "Quick View", note: "Focused product information without losing context", width: 1897, height: 907 },
      { src: "/projects/mistvale-footer.webp", label: "Support Layer", note: "Delivery, offer, FAQ and trust information", width: 1916, height: 960 },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
