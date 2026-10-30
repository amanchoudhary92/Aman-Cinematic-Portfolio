import type { ProjectSceneKey } from "./projects";

/**
 * The V5.9 originals have bespoke, project-owned 3D artwork.
 * CMS category presets must never re-use those three sculptures.
 * Older Neon records can still contain the previous shared scene keys;
 * safely interpret them as generic themes without changing project content.
 */
export const ORIGINAL_SCENES: Readonly<Record<string, ProjectSceneKey>> = {
  "campus-hub": "campus",
  "codeshield-ai": "codeshield",
  "mistvale-tea": "mistvale",
};

export function isOriginalCaseStudy(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ORIGINAL_SCENES, slug);
}

export function resolveProjectScene(slug: string, selected: ProjectSceneKey): ProjectSceneKey {
  const owned = ORIGINAL_SCENES[slug];
  if (owned) return owned;
  // Legacy saved selections that previously cloned a bespoke 3D model.
  switch (selected) {
    case "campus": return "platform";
    case "codeshield": return "security";
    case "mistvale": return "ecommerce";
    default: return selected;
  }
}
