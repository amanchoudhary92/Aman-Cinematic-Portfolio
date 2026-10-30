"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteHeader from "./SiteHeader";
import type { PortfolioProject, ProjectSceneKey } from "../lib/projects";

const focusByScene: Record<ProjectSceneKey, string> = {
  campus: "SECURITY / MODERATION / FULL-STACK",
  codeshield: "DEVSECOPS / GITHUB AUTOMATION",
  mistvale: "FRONTEND / E-COMMERCE UX",
  platform: "PLATFORM / PRODUCT SYSTEMS",
  security: "SECURITY / AI ENGINEERING",
  ecommerce: "E-COMMERCE / PRODUCT ENGINEERING",
  backend: "BACKEND / API ENGINEERING",
  abstract: "SYSTEM DESIGN / SOFTWARE ENGINEERING",
  portfolio: "PORTFOLIO / EXPERIENCE DESIGN",
  minimal: "SOFTWARE / CASE STUDY",
};

function CodeShieldTile() {
  return (
    <div className="projects-code-tile" aria-hidden="true">
      <div className="projects-code-top mono"><span>github / pull / 42</span><b>SECURITY SCAN</b></div>
      <div className="projects-code-lines mono">
        <code>+ verifyWebhookSignature(request)</code>
        <code className="risk">+ eval(userInput)</code>
        <code className="risk">+ SELECT * FROM users WHERE id = ${"${id}"}</code>
        <code>+ scanChangedFiles(diff)</code>
      </div>
      <div className="projects-code-result"><span className="mono">CODESHIELD AI</span><b>Findings surface before merge.</b></div>
    </div>
  );
}

export default function ProjectsIndex({projects}:{projects:PortfolioProject[]}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.fromTo(".projects-index-hero-inner > *", { y: 24, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.07,
          ease: "power3.out",
        });
      }
      gsap.utils.toArray<HTMLElement>(".projects-index-row").forEach((row) => {
        gsap.fromTo(row, { y: reduced ? 0 : 46, opacity: reduced ? 1 : 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 86%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="projects-index-page">
      <SiteHeader />

      <section className="projects-index-hero">
        <div className="projects-index-orb" aria-hidden="true" />
        <div className="projects-index-hero-inner">
          <p className="eyebrow mono">PROJECTS / {String(projects.length).padStart(2,"0")} SELECTED BUILDS</p>
          <h1>WORK THAT<br /><span>PROVES THE STACK.</span></h1>
          <div className="projects-index-intro">
            <p>Selected builds across full-stack product engineering, developer security tooling and frontend commerce. Open any project for the complete technical case study.</p>
            <div className="projects-index-hero-meta mono">
              <span><b>{String(projects.length).padStart(2,"0")}</b> PROJECTS</span>
              <span><b>03</b> DISCIPLINES</span>
              <span><b>2026</b> CURRENT WORK</span>
            </div>
          </div>
          <div className="projects-index-hero-actions">
            <a href="#selected-projects" className="button button--primary">EXPLORE PROJECTS ↓</a>
            <a href="/#work" className="button button--ghost">HOMEPAGE OVERVIEW ↙</a>
          </div>
        </div>
        <div className="projects-index-peek mono">01 / FIRST PROJECT ↓</div>
      </section>

      <section className="projects-index-list" id="selected-projects">
        <div className="projects-index-section-head">
          <p className="eyebrow mono">SELECTED PROJECTS</p>
          <p>Each project has its own visual language, but the same focus: clear systems, deliberate engineering and usable interfaces.</p>
        </div>

        {projects.map((project, index) => {
          const preview = project.images[0];
          return (
            <article className={`projects-index-row projects-index-row--${project.scene} ${index % 2 ? "is-reversed" : ""}`} key={project.slug}>
              <div className="projects-index-copy">
                <div className="projects-index-meta mono"><span>{project.number}</span><span>{project.year}</span><span>{focusByScene[project.scene]}</span></div>
                <h2>{project.displayTitle}</h2>
                <p>{project.summary}</p>
                <div className="projects-index-role"><span className="mono">MY ROLE</span><b>{project.role}</b></div>
                <div className="projects-index-stack mono">{project.stack.slice(0, 6).join(" · ")}</div>
                <div className="projects-index-links">
                  <a className="projects-index-open" href={`/work/${project.slug}`}>VIEW CASE STUDY <b>↗</b></a>
                  {project.live && <a className="projects-index-secondary mono" href={project.live} target="_blank" rel="noreferrer">LIVE ↗</a>}
                  {project.github && <a className="projects-index-secondary mono" href={project.github} target="_blank" rel="noreferrer">GITHUB ↗</a>}
                </div>
              </div>

              <a className="projects-index-visual" href={`/work/${project.slug}`} aria-label={`Open ${project.title} case study`}>
                <span className="projects-index-visual-label mono">OPEN / {project.number}</span>
                {project.slug === "codeshield-ai" ? <CodeShieldTile /> : (
                  <div className="projects-index-browser">
                    <div className="projects-index-browser-top"><i /><i /><i /><span className="mono">AMAN / PROJECT / {project.number}</span></div>
                    <div className="projects-index-browser-img">
                      {preview ? <Image
                        src={preview.src}
                        alt={`${project.title} project preview`}
                        width={preview.width}
                        height={preview.height}
                        sizes="(max-width: 900px) 94vw, 58vw"
                        priority={index === 0}
                      /> : <div className="cms-generic-visual mono">{project.title}</div>}
                    </div>
                  </div>
                )}
              </a>
            </article>
          );
        })}
      </section>

      <section className="projects-index-end">
        <p className="eyebrow mono">BEYOND THE PROJECTS</p>
        <h2>THE BUILDS ARE THE PROOF.<br /><span>THE ENGINEERING THINKING IS THE THREAD.</span></h2>
        <div>
          <a className="button button--primary" href="/#about">ABOUT AMAN ↗</a>
          <a className="button button--ghost" href="/#stack">SYSTEM STACK ↗</a>
          <a className="button button--ghost" href="/#contact">CONTACT ↗</a>
        </div>
      </section>
    </main>
  );
}
