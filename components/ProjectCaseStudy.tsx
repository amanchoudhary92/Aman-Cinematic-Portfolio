"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SiteHeader from "./SiteHeader";
import ProjectScene from "./ProjectScene";
import type { PortfolioProject, ProjectSceneKey } from "../lib/projects";
import { resolveProjectScene } from "../lib/scene-ownership";

type SceneKey = ProjectSceneKey;

type CaseDetail = {
  focus: string;
  type: string;
  status: string;
  architecture: string[];
  decisions: Array<{ title: string; body: string }>;
  features: Array<{ title: string; body: string }>;
  challengeNote: string;
};

const baseCaseDetails: Record<"campus" | "codeshield" | "mistvale", CaseDetail> = {
  campus: {
    focus: "SECURE RESOURCE SHARING",
    type: "FULL-STACK WEB PLATFORM",
    status: "PROJECT BUILD",
    architecture: ["STUDENT / ADMIN", "NEXT.JS APP", "SUPABASE AUTH", "SERVER VALIDATION", "POSTGRESQL + STORAGE", "MODERATION + AUDIT"],
    decisions: [
      { title: "PRIVATE BY DEFAULT", body: "Uploads stay private until moderation is complete, so public visibility is an explicit approval state rather than the default." },
      { title: "SHORT-LIVED DOWNLOADS", body: "Approved files are served through signed URLs instead of permanent public storage paths." },
      { title: "VALIDATE BEFORE TRUST", body: "File checks, server-side validation, duplicate detection and blocked-user restrictions protect the workflow before data becomes public." },
      { title: "ACCOUNTABILITY MATTERS", body: "Audit records keep sensitive admin actions and download events traceable instead of leaving moderation decisions invisible." },
    ],
    features: [
      { title: "Authentication & Recovery", body: "Registration, login, password recovery and reset flows give the platform a complete account lifecycle." },
      { title: "Moderation Queue", body: "Admins can approve, reject, block, delete and review submissions before public visibility." },
      { title: "Search & Discovery", body: "Resources can be filtered across title, subject, tags, branch, semester, resource type and summary." },
      { title: "Security Controls", body: "Hashing, duplicate detection, upload limits, audit logs, blocked-user rules and Row Level Security add defense in depth." },
    ],
    challengeNote: "The difficult part was not adding one security feature. It was making validation, moderation and permissions feel like one understandable product flow for both students and admins.",
  },
  codeshield: {
    focus: "PR-LEVEL SECURITY FEEDBACK",
    type: "GITHUB APP / DEVSECOPS TOOL",
    status: "WORKING DEMO",
    architecture: ["PULL REQUEST", "GITHUB WEBHOOK", "SIGNATURE VERIFY", "FETCH + SCAN DIFF", "SECURITY FINDINGS", "PR COMMENT"],
    decisions: [
      { title: "FEEDBACK WHERE REVIEW HAPPENS", body: "Findings are returned directly to the pull request, keeping security feedback inside the developer workflow instead of moving it to another dashboard." },
      { title: "VERIFY THE WEBHOOK FIRST", body: "Incoming GitHub events are signature-verified before the backend trusts or processes the payload." },
      { title: "SCAN THE CHANGE, NOT THE WORLD", body: "The demo focuses on pull-request diffs so feedback is tied to the code a developer is actively reviewing." },
      { title: "UPDATE, DON'T SPAM", body: "When new commits arrive, the workflow is designed to update the existing PR feedback rather than create a noisy stream of duplicate comments." },
    ],
    features: [
      { title: "Secret Detection", body: "Checks target leaked API keys, hardcoded credentials and database URLs in changed code." },
      { title: "Risk Pattern Scanning", body: "The demo flags possible SQL injection, unsafe eval usage and common JavaScript, TypeScript and Python risks." },
      { title: "GitHub App Flow", body: "Installation, repository selection, PR events and comments are handled through the GitHub App workflow." },
      { title: "Useful, Not Absolute", body: "The demo is intentionally presented as review assistance, not a replacement for a full security audit." },
    ],
    challengeNote: "The core UX challenge is signal quality: a security bot must be useful enough to influence a pull-request decision without pretending that heuristic checks are a complete security review.",
  },
  mistvale: {
    focus: "PRODUCT DISCOVERY + COMMERCE UX",
    type: "RESPONSIVE STOREFRONT",
    status: "STOREFRONT BUILD",
    architecture: ["LANDING", "BROWSE + SEARCH", "FILTER", "QUICK VIEW", "CART + OFFER", "DELIVERY + FAQ"],
    decisions: [
      { title: "BRAND WITHOUT FRICTION", body: "The visual system uses premium tea imagery and editorial typography, but the shopping actions remain obvious and functional." },
      { title: "KEEP BROWSING CONTEXT", body: "Quick View surfaces product information without forcing the user to abandon the collection they were exploring." },
      { title: "FILTER FOR DECISION-MAKING", body: "Tea type, availability, price and sorting controls reduce browsing effort instead of functioning as decoration." },
      { title: "SHOW PRACTICAL INFO EARLY", body: "Delivery checks, offer rules, stock state and FAQ content are placed close to the shopping journey so users do not have to hunt for them." },
    ],
    features: [
      { title: "Product Discovery", body: "Search, category navigation, filtering and sorting help users move quickly from browsing to a relevant product." },
      { title: "Product Quick View", body: "A focused modal provides price, stock, order limits, delivery information and cart actions without losing context." },
      { title: "Offer Visibility", body: "Promotional rules, free-shipping thresholds and the WELCOME10 offer are communicated clearly rather than hidden at checkout." },
      { title: "Support Layer", body: "Delivery checks, reviews, FAQs and newsletter/support content complete the storefront beyond the product grid." },
    ],
    challengeNote: "The design challenge was balancing a premium visual atmosphere with everyday commerce tasks. The interface still has to be fast to scan, easy to filter and clear about delivery, stock and offers.",
  },
};

function getCaseDetail(project: PortfolioProject): CaseDetail {
  const original = project.slug === "campus-hub" || project.slug === "codeshield-ai" || project.slug === "mistvale-tea";
  if (!original) {
    return {
      focus: "SOFTWARE ENGINEERING / PROJECT",
      type: project.category || "SOFTWARE CASE STUDY",
      status: "PROJECT BUILD",
      architecture: project.architecture?.length ? project.architecture : (project.stack.length ? project.stack.slice(0,6) : ["DETAILS TO BE ADDED"]),
      decisions: project.decisions?.length ? project.decisions : [
        {title:"IMPLEMENTATION APPROACH",body:project.approach || "Engineering decisions will be documented here."}
      ],
      features: project.features?.length ? project.features : [
        {title:"PROJECT OVERVIEW",body:project.summary || "Features will be documented here."}
      ],
      challengeNote:project.challengeNote || project.challenge || "Document the main challenge in the CMS editor.",
    };
  }
  const originalScene = project.slug === "campus-hub" ? "campus" : project.slug === "codeshield-ai" ? "codeshield" : "mistvale";
  const preset = baseCaseDetails[originalScene];
  return {
    ...preset,
    architecture:project.architecture?.length ? project.architecture : preset.architecture,
    decisions:project.decisions?.length ? project.decisions : preset.decisions,
    features:project.features?.length ? project.features : preset.features,
    challengeNote:project.challengeNote || preset.challengeNote,
  };
}

function CodeShieldVisual() {
  return (
    <div className="detail-terminal" aria-label="CodeShield PR security flow visualization">
      <div className="detail-terminal-bar mono"><span>github / pull / 42</span><b>SECURITY CHECK</b></div>
      <div className="detail-terminal-body mono">
        <code><i>+</i> const token = process.env.GITHUB_TOKEN;</code>
        <code><i>+</i> const query = `SELECT * FROM users WHERE id = ${"${id}"}`;</code>
        <code><i>+</i> eval(userInput);</code>
        <code><i>+</i> verifyWebhookSignature(req);</code>
        <div className="detail-scan-line" />
        <span className="detail-finding detail-finding--one">SQL INJECTION PATTERN</span>
        <span className="detail-finding detail-finding--two">UNSAFE EVAL</span>
        <span className="detail-finding detail-finding--three">SECRET HANDLING CHECK</span>
      </div>
      <div className="detail-comment">
        <b>CodeShield AI</b>
        <span className="mono">PR REVIEW BOT</span>
        <p>Security findings detected. Review flagged lines before merge.</p>
      </div>
    </div>
  );
}

function ProjectLinks({ project, compact = false }: { project: PortfolioProject; compact?: boolean }) {
  const missingLive = !project.live;
  const missingCode = !project.github;

  return (
    <div className={`case-actions${compact ? " case-actions--compact" : ""}`}>
      {project.live ? (
        <a className="button button--primary" href={project.live} target="_blank" rel="noreferrer">VIEW DEMO ↗</a>
      ) : (
        <span className="button button--primary button--disabled" aria-disabled="true" title="Public demo not published yet">VIEW DEMO ↗</span>
      )}
      {project.github ? (
        <a className="button button--ghost" href={project.github} target="_blank" rel="noreferrer">VIEW CODE ↗</a>
      ) : (
        <span className="button button--ghost button--disabled" aria-disabled="true" title="Public code repository not published yet">VIEW CODE ↗</span>
      )}
      {(missingLive || missingCode) && (
        <span className="case-link-note mono">{missingLive && missingCode ? "LOCAL / NOT PUBLIC YET" : missingLive ? "DEMO NOT PUBLIC YET" : "CODE NOT PUBLIC YET"}</span>
      )}
    </div>
  );
}

export default function ProjectCaseStudy({ project, projects }: { project: PortfolioProject; projects: PortfolioProject[] }) {
  const root = useRef<HTMLElement>(null);
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[(currentIndex - 1 + projects.length) % projects.length] || project;
  const nextProject = projects[(currentIndex + 1) % projects.length] || project;
  const detail = getCaseDetail(project);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lenis = reduced || coarse ? null : new Lenis({ duration: 0.92, smoothWheel: true });
    let raf = 0;

    if (lenis) {
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      lenis.on("scroll", ScrollTrigger.update);
    }

    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.timeline({ scrollTrigger: { trigger: ".case-hero", start: "top top", end: "bottom top", scrub: 1 } })
          .to(".case-hero-scene", { scale: 1.1, opacity: 0.42, ease: "none" }, 0)
          .to(".case-hero-copy", { yPercent: -16, opacity: 0.22, ease: "none" }, 0.2);
      }

      gsap.utils.toArray<HTMLElement>(".case-reveal").forEach((element) => {
        gsap.fromTo(element, { y: reduced ? 0 : 38, opacity: reduced ? 1 : 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.78,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%" },
        });
      });

      setTimeout(() => ScrollTrigger.refresh(), 120);
    }, root);

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [project.slug]);

  // Reserve all three original V5.9 sculptures for their original case studies.
  // Other projects always use independently designed, reusable category scenes.
  const visualScene: SceneKey = resolveProjectScene(project.slug, project.scene);

  return (
    <main ref={root} className={`case-page case-page--${visualScene}`}>
      <SiteHeader />

      <section className="case-hero" id="top">
        <div className="case-hero-scene"><ProjectScene variant={visualScene} /></div>
        <div className="case-hero-vignette" />
        <div className="film-grain" />
        <div className="case-hero-copy">
          <p className="case-kicker mono">{project.number} / {project.category}</p>
          <h1>{project.displayTitle}</h1>
          <p>{project.summary}</p>
          <div className="case-hero-actions">
            <a className="button button--primary" href="#case-study">EXPLORE CASE STUDY ↓</a>
            <ProjectLinks project={project} compact />
          </div>
        </div>
      </section>

      <section className="case-glance" aria-label="Project at a glance">
        <div><span className="mono">ROLE</span><b>{project.role}</b></div>
        <div><span className="mono">TYPE</span><b>{detail.type}</b></div>
        <div><span className="mono">FOCUS</span><b>{detail.focus}</b></div>
        <div><span className="mono">STATUS</span><b>{detail.status}</b></div>
      </section>

      <section className="case-switcher" aria-label="Project navigation">
        <a className="case-back mono" href="/projects">← ALL PROJECTS</a>
        <div className="case-project-tabs">
          {projects.map((item) => (
            <a key={item.slug} href={`/work/${item.slug}`} className={item.slug === project.slug ? "is-active" : ""}>
              <span className="mono">{item.number}</span>
              <b>{item.title}</b>
            </a>
          ))}
        </div>
      </section>

      <section className="case-overview" id="case-study">
        <div className="case-overview-title case-reveal">
          <p className="eyebrow mono">01 / PROJECT OVERVIEW</p>
          <h2>THE WHY<br /><span>BEHIND THE BUILD.</span></h2>
        </div>
        <div className="case-story case-reveal">
          <article><span className="mono">THE PROBLEM</span><h3>What needed solving.</h3><p>{project.challenge}</p></article>
          <article><span className="mono">THE APPROACH</span><h3>How I structured it.</h3><p>{project.approach}</p></article>
          <article><span className="mono">THE OUTCOME</span><h3>What the system became.</h3><p>{project.outcome}</p></article>
        </div>
      </section>

      <section className="case-architecture">
        <div className="case-section-heading case-reveal">
          <p className="eyebrow mono">02 / ARCHITECTURE</p>
          <h2>{project.architecture?.length || ["campus-hub", "codeshield-ai", "mistvale-tea"].includes(project.slug) ? "HOW THE" : "BUILT WITH"}<br /><span>{project.architecture?.length || ["campus-hub", "codeshield-ai", "mistvale-tea"].includes(project.slug) ? "SYSTEM FLOWS." : "THESE TOOLS."}</span></h2>
          <p>{project.architecture?.length || ["campus-hub", "codeshield-ai", "mistvale-tea"].includes(project.slug) ? "The core user or data path that shapes the project." : "A technical overview of the project stack. Edit the architecture steps in CMS for an accurate flow."}</p>
        </div>
        <div className="case-architecture-flow case-reveal">
          {detail.architecture.map((step, index) => (
            <div className="case-architecture-node" key={step}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <b>{step}</b>
              {index < detail.architecture.length - 1 && <i aria-hidden="true">→</i>}
            </div>
          ))}
        </div>
      </section>

      <section className="case-system-band">
        <div className="case-system-band-head">
          <p className="eyebrow mono case-reveal">03 / TECHNOLOGY + RESPONSIBILITY</p>
          <p className="case-reveal">The stack only matters when each tool has a clear job in the system.</p>
        </div>
        <div className="case-stack case-reveal">
          {project.stack.map((item, index) => <span key={item}><b className="mono">{String(index + 1).padStart(2, "0")}</b>{item}</span>)}
        </div>
      </section>

      <section className="case-decisions">
        <div className="case-section-heading case-reveal">
          <p className="eyebrow mono">04 / ENGINEERING DECISIONS</p>
          <h2>DECISIONS THAT<br /><span>SHAPED THE PRODUCT.</span></h2>
        </div>
        <div className="case-decisions-grid">
          {detail.decisions.map((decision, index) => (
            <article className="case-decision-card case-reveal" key={decision.title}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>{decision.title}</h3>
              <p>{decision.body}</p>
            </article>
          ))}
        </div>
        <aside className="case-challenge-note case-reveal"><span className="mono">THE HARD PART</span><p>{detail.challengeNote}</p></aside>
      </section>

      <section className="case-features">
        <div className="case-section-heading case-reveal">
          <p className="eyebrow mono">05 / KEY FEATURES</p>
          <h2>WHAT THE USER<br /><span>ACTUALLY GETS.</span></h2>
        </div>
        <div className="case-feature-list">
          {detail.features.map((feature, index) => (
            <article className="case-feature-row case-reveal" key={feature.title}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      {project.slug === "codeshield-ai" ? (
        <section className="case-visual case-visual--terminal">
          <div className="case-visual-heading case-reveal"><p className="eyebrow mono">06 / PR SECURITY FLOW</p><h2>SCAN BEFORE<br /><span>THE MERGE.</span></h2></div>
          <CodeShieldVisual />
          <div className="pipeline-large case-reveal">
            <div><b>01</b><span>PR EVENT</span></div>
            <div><b>02</b><span>VERIFY WEBHOOK</span></div>
            <div><b>03</b><span>SCAN DIFF</span></div>
            <div><b>04</b><span>COMMENT FINDINGS</span></div>
          </div>
        </section>
      ) : (
        <section className="case-gallery">
          <div className="case-gallery-heading case-reveal"><p className="eyebrow mono">06 / INTERFACE WALKTHROUGH</p><h2>FROM SYSTEM<br /><span>TO EXPERIENCE.</span></h2></div>
          {project.images.map((image, index) => (
            <figure className="case-gallery-frame case-reveal" key={image.src}>
              <div className="case-gallery-index mono">{String(index + 1).padStart(2, "0")} / {image.label.toUpperCase()}</div>
              <div className="case-gallery-image"><Image
                src={image.src}
                alt={`${project.title} — ${image.label}`}
                width={image.width}
                height={image.height}
                sizes="(max-width: 900px) 94vw, 84vw"
              /></div>
              <figcaption><b>{image.label}</b><span>{image.note}</span></figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="case-proof case-reveal">
        <div><span className="eyebrow mono">07 / FINAL TAKEAWAY</span><h2>BUILT TO SOLVE<br /><em>A REAL PROBLEM.</em></h2></div>
        <div className="case-proof-copy"><p>{project.outcome}</p><ProjectLinks project={project} /></div>
      </section>

      <section className="case-next">
        <div className="case-next-orb" />
        <div className="case-next-copy case-reveal">
          <p className="eyebrow mono">CONTINUE EXPLORING</p>
          <h2>{nextProject.displayTitle}</h2>
          <p>{nextProject.summary}</p>
          <div className="case-next-actions">
            <a className="button button--ghost" href={`/work/${previousProject.slug}`}>← PREVIOUS</a>
            <a className="button button--ghost" href="/projects">ALL PROJECTS</a>
            <a className="button button--primary" href={`/work/${nextProject.slug}`}>NEXT PROJECT ↗</a>
          </div>
        </div>
      </section>

      <footer className="case-footer mono"><span>AMAN CHOUDHARY © 2026</span><a href="/projects">PROJECTS</a><a href="/#top">HOME ↑</a><a href="/#contact">CONTACT ↗</a></footer>
    </main>
  );
}
