export const SITE = {
  publicName: "Aman Choudhary",
  shortName: "Aman",
  title: "Software Developer & Full-Stack Engineer",
  location: "New Delhi, India",
  email: "amanchoudhary782767@gmail.com",
  github: "https://github.com/amanchoudhary92",
  linkedin: "https://www.linkedin.com/in/aman-c-1887143b1",
  description:
    "Aman Choudhary is a Software Developer and Full-Stack Engineer in New Delhi building secure web applications, backend systems, REST APIs, authentication flows, databases and modern frontend experiences with Next.js, React, Node.js, Go and PostgreSQL.",
  keywords: [
    "Aman Choudhary",
    "Aman developer portfolio",
    "Aman Choudhary portfolio",
    "Aman Choudhary software developer",
    "software developer portfolio",
    "full stack developer portfolio",
    "software engineer portfolio",
    "full stack engineer India",
    "software developer New Delhi",
    "Next.js developer",
    "React developer",
    "Node.js developer",
    "backend developer",
    "REST API developer",
    "web application security",
    "software engineering intern",
  ],
} as const;

export const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
export const siteUrl = configuredSiteUrl || "http://localhost:3000";
export const isProductionSiteConfigured = Boolean(configuredSiteUrl);
export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
