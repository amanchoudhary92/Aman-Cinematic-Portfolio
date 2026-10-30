import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE, absoluteUrl, siteUrl, isProductionSiteConfigured } from "../lib/site";
import "./globals.css";
import { getPublicSite } from "../lib/cms-data";

export async function generateMetadata(): Promise<Metadata> {
  const site=await getPublicSite();
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.publicName} | ${site.title}`,
    template: `%s | ${site.publicName}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.publicName, url: site.github }],
  creator: site.publicName,
  publisher: site.publicName,
  category: "technology",
  applicationName: `${site.publicName} Portfolio`,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: `${site.publicName} | ${site.title}`,
    description: site.description,
    siteName: `${site.publicName} Portfolio`,
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Aman Choudhary portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.publicName} | ${site.title}`,
    description: site.description,
    images: ["/opengraph-image"],
  },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050508",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site=await getPublicSite();
  const sameAs=[site.github,site.linkedin].filter(Boolean);
  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.publicName,
    alternateName: site.shortName,
    jobTitle: site.title,
    description: site.description,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Delhi Skills and Entrepreneurship University",
    },
    knowsAbout: [
      "Software Development",
      "Full-Stack Engineering",
      "Next.js",
      "React",
      "Node.js",
      "Go",
      "REST APIs",
      "PostgreSQL",
      "Authentication",
      "Web Application Security",
    ],
    sameAs,
    url: isProductionSiteConfigured ? siteUrl : undefined,
    image: absoluteUrl("/images/aman-about.webp"),
  };

  const profilePage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: person,
    url: siteUrl,
  };

  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
