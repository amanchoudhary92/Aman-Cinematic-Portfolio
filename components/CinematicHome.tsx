"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import FrameSequenceCanvas from "./FrameSequenceCanvas";
import SiteHeader from "./SiteHeader";
import type { PortfolioProject, ProjectSceneKey } from "../lib/projects";
import type { PublicSite } from "../lib/cms-data";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

type WorkItem = {
  number: string;
  title: string;
  category: string;
  summary: string;
  stack: string;
  href: string;
  image?: string;
  tone: ProjectSceneKey;
  slug: string;
};

function mapWorkItems(projects: PortfolioProject[]): WorkItem[] { return projects.map((project) => ({
  number: project.number,
  title: project.displayTitle,
  category: project.category,
  summary: project.summary,
  stack: project.stack.slice(0, 4).map((item) => item.toUpperCase()).join(" · "),
  href: `/work/${project.slug}`,
  image: project.images[0]?.src,
  tone: project.scene,
  slug: project.slug,
})); }

const stackGroups = [
  {
    index: "01",
    title: "LANGUAGES",
    statement: "The languages I use to express logic, systems and product behavior.",
    items: [
      ["JS", "JavaScript", "Application Logic"],
      ["TS", "TypeScript", "Typed Product Systems"],
      ["PY", "Python", "Automation / Problem Solving"],
      ["JV", "Java", "Object-Oriented Systems"],
      ["GO", "Go", "Backend Services"],
      ["C", "C", "Core Programming"],
    ],
  },
  {
    index: "02",
    title: "FRONTEND",
    statement: "Interfaces are where system behavior becomes understandable to people.",
    items: [
      ["RE", "React", "Interactive Interfaces"],
      ["NX", "Next.js", "Full-Stack Web Applications"],
      ["HT", "HTML", "Semantic Structure"],
      ["CS", "CSS", "Responsive Visual Systems"],
      ["TW", "Tailwind CSS", "Interface Delivery"],
    ],
  },
  {
    index: "03",
    title: "BACKEND",
    statement: "Reliable APIs, permissions and application logic are where products become systems.",
    items: [
      ["ND", "Node.js", "Backend Services"],
      ["EX", "Express", "REST Applications"],
      ["GG", "Go Gin", "API Services"],
      ["API", "REST APIs", "Service Contracts"],
      ["JWT", "JWT", "Authentication"],
      ["BC", "bcrypt", "Credential Security"],
    ],
  },
  {
    index: "04",
    title: "DATA",
    statement: "Data models and persistence rules shape what an application can safely guarantee.",
    items: [
      ["PG", "PostgreSQL", "Relational Persistence"],
      ["MY", "MySQL", "Relational Data"],
      ["SQ", "SQLite", "Lightweight Persistence"],
      ["SB", "Supabase", "Auth / Storage / Data"],
      ["GM", "GORM", "Go Data Access"],
    ],
  },
  {
    index: "05",
    title: "TOOLS",
    statement: "The tools I use to ship, test, inspect and deploy software in real development workflows.",
    items: [
      ["GT", "Git", "Version Control"],
      ["GH", "GitHub", "Collaboration / Repositories"],
      ["VS", "VS Code", "Development Environment"],
      ["VL", "Vercel", "Frontend Deployment"],
      ["RY", "Railway", "Backend Deployment"],
      ["PM", "Postman", "API Testing"],
      ["VT", "Vitest", "Application Testing"],
    ],
  },
];

function CodeShieldPreview() {
  return (
    <div className="v5-code-preview" aria-label="CodeShield security scan preview">
      <div className="v5-code-top mono"><span>pull / 42 / changed-files</span><b>SECURITY SCAN</b></div>
      <div className="v5-code-body mono">
        <code><i>+</i> const token = process.env.GITHUB_TOKEN;</code>
        <code className="is-risk"><i>+</i> const query = `SELECT * FROM users WHERE id = ${"${id}"}`;</code>
        <code className="is-risk"><i>+</i> eval(userInput);</code>
        <code><i>+</i> verifyWebhookSignature(request);</code>
        <div className="v5-code-scan" />
      </div>
      <div className="v5-code-comment">
        <span className="mono">CODESHIELD AI / REVIEW BOT</span>
        <b>2 security findings before merge.</b>
        <p>Possible SQL injection · unsafe eval usage</p>
      </div>
    </div>
  );
}

export default function CinematicHome({ projects, site }: { projects: PortfolioProject[]; site: PublicSite }) {
  const workItems = mapWorkItems(projects);
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [workIndex, setWorkIndex] = useState(0);
  const [stackIndex, setStackIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const timer = window.setTimeout(() => setLoaded(true), 900);
    const lenis = reduced ? null : new Lenis({ duration: 0.95, smoothWheel: true, syncTouch: false });
    let raf = 0;

    if (lenis) {
      const loop = (time: number) => {
        lenis.raf(time);
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
      lenis.on("scroll", ScrollTrigger.update);
    }

    const ctx = gsap.context(() => {
      gsap.set(".v5-hero-kicker,.v5-hero-role,.v5-hero-line,.v5-hero-summary,.v5-hero-actions,.v5-hero-meta", { opacity: 0 });
      gsap.timeline({ delay: 0.72 })
        .fromTo(".v5-hero-kicker", { y: 14 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" })
        .fromTo(".v5-hero-role", { y: 18 }, { y: 0, opacity: 1, duration: 0.58, ease: "power2.out" }, "-=.24")
        .fromTo(".v5-hero-line", { yPercent: 110 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "power4.out" }, "-=.22")
        .fromTo(".v5-hero-summary", { y: 18 }, { y: 0, opacity: 1, duration: 0.55 }, "-=.3")
        .to(".v5-hero-actions,.v5-hero-meta", { opacity: 1, duration: 0.55, stagger: 0.06 }, "-=.2");

      if (!reduced) {
        gsap.timeline({
          scrollTrigger: { trigger: ".v5-hero", start: "top top", end: "bottom bottom", scrub: 0.8 },
        })
          .to(".v5-hero-content", { yPercent: -18, opacity: 0.08, ease: "none" }, 0.25)
          .to(".v5-hero-grid", { opacity: 0.1, scale: 1.08, ease: "none" }, 0.2);

        gsap.timeline({
          scrollTrigger: { trigger: ".v5-system", start: "top top", end: "bottom bottom", scrub: 0.75 },
        })
          .fromTo(".v5-system-stage", { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, ease: "none" }, 0)
          .fromTo(".v5-system-copy", { y: 90, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0.08)
          .to(".v5-system-copy", { y: -60, opacity: 0, ease: "none" }, 0.72)
          .to(".v5-system-stage", { scale: 1.16, opacity: 0.16, ease: "none" }, 0.76);
      }

      ScrollTrigger.create({
        trigger: ".v5-work",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const next = Math.max(0,Math.min(workItems.length - 1, Math.floor(self.progress * workItems.length)));
          setWorkIndex((current) => current === next ? current : next);
        },
      });

      ScrollTrigger.create({
        trigger: ".v5-stack",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const next = Math.min(stackGroups.length - 1, Math.floor(self.progress * stackGroups.length));
          setStackIndex((current) => current === next ? current : next);
        },
      });

      gsap.utils.toArray<HTMLElement>(".v5-reveal").forEach((element) => {
        gsap.fromTo(element, { y: 42, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".v5-philo-line").forEach((element) => {
        gsap.fromTo(element, { yPercent: 105, opacity: 0.1 }, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power4.out",
          scrollTrigger: { trigger: element, start: "top 92%", end: "top 54%", scrub: reduced ? false : 0.6 },
        });
      });

      const manifestoSteps = gsap.utils.toArray<HTMLElement>(".v5-manifesto-step");
      gsap.set(manifestoSteps, { opacity: 0, y: 42 });
      gsap.set(".v5-manifesto-line", { yPercent: 112, opacity: 0.1 });
      gsap.set(".v5-manifesto-chip", { y: 18, opacity: 0, scale: 0.96 });

      if (reduced) {
        gsap.set(manifestoSteps, { opacity: 1, y: 0 });
        gsap.set(".v5-manifesto-line", { yPercent: 0, opacity: 1 });
        gsap.set(".v5-manifesto-chip", { y: 0, opacity: 1, scale: 1 });
      } else {
        const manifestoTimeline = gsap.timeline({
          scrollTrigger: { trigger: ".v5-manifesto", start: "top top", end: "bottom bottom", scrub: 0.65 },
        });

        manifestoSteps.forEach((step, index) => {
          const lines = step.querySelectorAll(".v5-manifesto-line");
          const chips = step.querySelectorAll(".v5-manifesto-chip");
          const start = index * 0.92;
          const isLast = index === manifestoSteps.length - 1;

          manifestoTimeline
            .to(step, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, start)
            .to(lines, { yPercent: 0, opacity: 1, duration: 0.46, stagger: 0.055, ease: "power4.out" }, start + 0.06);

          if (chips.length) {
            manifestoTimeline.to(chips, { y: 0, opacity: 1, scale: 1, duration: 0.34, stagger: 0.045, ease: "power3.out" }, start + 0.12);
          }

          if (!isLast) {
            manifestoTimeline.to(step, { opacity: 0, y: -36, duration: 0.28, ease: "power2.in" }, start + 0.72);
          } else {
            manifestoTimeline.to(step, { opacity: 1, y: 0, duration: 0.42 }, start + 0.72);
          }
        });
      }

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
        },
      });

      window.setTimeout(() => ScrollTrigger.refresh(), 180);
    }, root);

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || !cursor.current) return;
      cursor.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onPointerOver = (event: PointerEvent) => {
      if (!finePointer || !cursor.current) return;
      const target = (event.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      cursor.current.dataset.mode = target?.dataset.cursor || "";
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerover", onPointerOver, { passive: true });
    }

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf);
      lenis?.destroy();
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, []);

  const work = workItems[workIndex] || workItems[0];
  const stack = stackGroups[stackIndex];

  return (
    <main ref={root} className="v5-home">
      <FrameSequenceCanvas />
      <div className="v5-global-shade" aria-hidden="true" />
      <div ref={progress} className="page-progress" />
      <div ref={cursor} className="v5-cursor mono" aria-hidden="true"><span>VIEW ↗</span></div>

      <div className={`loader v5-loader ${loaded ? "loader--hidden" : ""}`} aria-hidden={loaded}>
        <div className="loader-mark">AMAN.</div>
        <div className="loader-track"><span /></div>
        <div className="loader-copy mono">LOADING CINEMATIC SYSTEM</div>
      </div>

      <SiteHeader />

      <section className="v5-hero" id="top">
        <div className="v5-hero-sticky">
          <div className="v5-hero-grid" aria-hidden="true" />
          <div className="v5-hero-content">
            <p className="v5-hero-kicker mono">HI, I&apos;M AMAN.</p>
            <p className="v5-hero-role mono">SOFTWARE DEVELOPER &amp; FULL-STACK ENGINEER</p>
            <h1>
              <span className="v5-hero-mask"><span className="v5-hero-line">I BUILD</span></span>
              <span className="v5-hero-mask"><span className="v5-hero-line v5-outline">SYSTEMS</span></span>
              <span className="v5-hero-mask"><span className="v5-hero-line">THAT HOLD.</span></span>
            </h1>
            <p className="v5-hero-summary">From interface to infrastructure — building reliable software across frontend, backend, APIs, authentication and data.</p>
            <div className="v5-hero-actions">
              <a className="button button--primary" href="#work">VIEW MY WORK ↓</a>
              <a className="button button--ghost" href="#about">ABOUT ME ↗</a>
            </div>
          </div>
          <div className="v5-hero-meta mono">
            <span>NEW DELHI, INDIA</span><span>CSE / 2027</span><span>SCROLL TO ENTER ↓</span>
          </div>
        </div>
      </section>

      <section className="v5-system" aria-label="Systems in motion">
        <div className="v5-system-sticky">
          <div className="v5-system-stage"><SceneCanvas /></div>
          <div className="v5-system-copy">
            <p className="eyebrow mono">SYSTEM ARCHITECTURE / 02</p>
            <h2>SYSTEMS<br /><span>IN MOTION</span></h2>
            <p>Interfaces, APIs, authentication and data are not isolated layers. Good software is the movement between them.</p>
          </div>
          <div className="v5-system-rail mono"><span>FRONTEND</span><span>BACKEND</span><span>API</span><span>AUTH</span><span>DATA</span></div>
        </div>
      </section>

      <section className="v5-manifesto" aria-label="Aman software developer manifesto">
        <div className="v5-manifesto-sticky">
          <div className="v5-manifesto-step">
            <p className="eyebrow mono">03 / SOFTWARE DEVELOPER</p>
            <h2>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line">HI, I&apos;M</span></span>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line">AMAN.</span></span>
            </h2>
          </div>
          <div className="v5-manifesto-step v5-manifesto-step--right">
            <h2>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line">I DESIGN</span></span>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line">SOFTWARE.</span></span>
            </h2>
          </div>
          <div className="v5-manifesto-step">
            <h2>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line">I BUILD SYSTEMS</span></span>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line v5-manifesto-accent">THAT ACTUALLY WORK.</span></span>
            </h2>
          </div>
          <div className="v5-manifesto-step v5-manifesto-areas mono">
            <span className="v5-manifesto-chip">FRONTEND</span>
            <span className="v5-manifesto-chip">BACKEND</span>
            <span className="v5-manifesto-chip">APIs</span>
            <span className="v5-manifesto-chip">DATABASES</span>
            <span className="v5-manifesto-chip">AUTHENTICATION</span>
          </div>
          <div className="v5-manifesto-step v5-manifesto-step--right v5-manifesto-final">
            <h2>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line v5-final-line">FROM INTERFACE</span></span>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line v5-final-arrow">→</span></span>
              <span className="v5-manifesto-mask"><span className="v5-manifesto-line v5-final-line v5-final-accent">INFRASTRUCTURE.</span></span>
            </h2>
          </div>
        </div>
      </section>

      <section className="v5-work" id="work">
        <div className="v5-work-sticky">
          <div className="v5-work-heading">
            <p className="eyebrow mono">SELECTED WORK / {String(workItems.length).padStart(2, "0")}</p>
            <h2>SELECTED WORK.<br /><span>DIFFERENT SYSTEMS. REAL PROBLEMS.</span></h2>
            <div><p>A quick overview here. Open the Projects page or any case study for the full engineering story.</p><a className="v5-all-projects-link mono" href="/projects">VIEW ALL PROJECTS ↗</a></div>
          </div>

          {work ? <div className={`v5-work-stage v5-work-stage--${work.tone}`}>
            <div className="v5-work-copy" key={`copy-${work.number}`}>
              <span className="v5-work-number mono">{work.number}</span>
              <p className="v5-work-category mono">{work.category}</p>
              <h3>{work.title}</h3>
              <p>{work.summary}</p>
              <span className="v5-work-stack mono">{work.stack}</span>
              <a href={work.href} className="v5-project-link" data-cursor="view">VIEW PROJECT <b>↗</b></a>
            </div>

            <a href={work.href} className="v5-work-visual" data-cursor="view" aria-label={`Open ${work.title}`} key={`visual-${work.number}`}>
              {work.slug === "codeshield-ai" ? (
                <CodeShieldPreview />
              ) : (
                <div className="v5-project-browser">
                  <div className="v5-project-browser-top"><i /><i /><i /><span className="mono">aman / work / {work.number}</span></div>
                  <div className="v5-project-browser-image">
                    {work.image ? <Image src={work.image} alt={`${work.title} preview`} fill sizes="(max-width: 900px) 92vw, 58vw" /> : <div className="cms-generic-visual mono">{work.title}</div>}
                  </div>
                </div>
              )}
            </a>
          </div> : <p className="mono">PROJECT CASE STUDIES COMING SOON.</p>}
          <div className="v5-work-nav" aria-label="Featured projects">
            {workItems.map((item, index) => (
              <button type="button" key={item.number} onClick={() => setWorkIndex(index)} className={index === workIndex ? "is-active" : ""}>
                <span className="mono">{item.number}</span><b>{item.title}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="v5-philosophy">
        <div className="v5-philosophy-inner">
          <p className="eyebrow mono v5-reveal">ENGINEERING PHILOSOPHY / 05</p>
          <div className="v5-philo-mask"><h2 className="v5-philo-line">TOOLS ARE NOT THE STORY.</h2></div>
          <div className="v5-philo-mask"><h2 className="v5-philo-line v5-philo-accent">WHAT THEY ENABLE IS.</h2></div>
          <div className="v5-philo-rules mono">
            <span>BUILD FOR CLARITY.</span>
            <span>DESIGN FOR FAILURE.</span>
            <span>CONTROL COMPLEXITY.</span>
            <span>MAKE SYSTEMS UNDERSTANDABLE.</span>
          </div>
        </div>
      </section>

      <section className="v5-about" id="about">
        <div className="v5-about-inner">
          <div className="v5-about-portrait v5-reveal">
            <Image src="/images/aman-about.webp" alt="Aman Choudhary portrait" fill sizes="(max-width: 900px) 92vw, 42vw" />
            <div className="v5-about-portrait-shade" />
            <span className="mono">AMAN / SOFTWARE DEVELOPER</span>
          </div>
          <div className="v5-about-copy v5-reveal">
            <p className="eyebrow mono">ABOUT AMAN / 06</p>
            <h2>I LIKE BUILDING<br />THE PARTS THAT<br /><span>CAN&apos;T FAKE IT.</span></h2>
            <p>I&apos;m a Computer Science Engineering student graduating in 2027 with hands-on experience building full-stack and backend applications. I focus on reliable digital products and the systems behind them.</p>
            <p>I work across frontend interfaces, backend services, REST APIs, authentication and databases, supported by a strong foundation in Data Structures &amp; Algorithms, Object-Oriented Programming, DBMS, Operating Systems and Computer Networks.</p>
            <div className="v5-about-meta mono">
              <span>NEW DELHI, INDIA</span>
              <span>COMPUTER SCIENCE ENGINEERING · 2027</span>
              <span>SOFTWARE DEVELOPMENT</span>
              <span>FULL-STACK ENGINEERING</span>
              <span>OPEN TO INTERNSHIPS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="v5-stack" id="stack">
        <div className="v5-stack-sticky">
          <div className="v5-stack-heading">
            <p className="eyebrow mono">SYSTEM STACK / 07</p>
            <h2>TECHNOLOGY IS A TOOL.<br /><span>ENGINEERING IS THE SKILL.</span></h2>
          </div>
          <div className="v5-stack-layout v5-stack-desktop-layout">
            <div className="v5-stack-tabs">
              {stackGroups.map((group, index) => (
                <button type="button" key={group.title} className={stackIndex === index ? "is-active" : ""} onClick={() => setStackIndex(index)}>
                  <span className="mono">{group.index}</span><b>{group.title}</b>
                </button>
              ))}
            </div>
            <div className="v5-stack-content" key={stack.title}>
              <div className="v5-stack-intro"><p className="mono">{stack.index} / {stack.title}</p><h3>{stack.title}</h3><span>{stack.statement}</span></div>
              <div className="v5-skill-grid">
                {stack.items.map(([mark, name, capability]) => (
                  <article key={name}>
                    <div className="v5-tech-mark mono">{mark}</div>
                    <div><b>{name}</b><span>{capability}</span></div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="v5-stack-mobile-sequence">
            {stackGroups.map((group) => (
              <section className="v5-mobile-stack-group" key={group.title}>
                <div className="v5-stack-intro">
                  <p className="mono">{group.index} / {group.title}</p>
                  <h3>{group.title}</h3>
                  <span>{group.statement}</span>
                </div>
                <div className="v5-skill-grid">
                  {group.items.map(([mark, name, capability]) => (
                    <article key={name}>
                      <div className="v5-tech-mark mono">{mark}</div>
                      <div><b>{name}</b><span>{capability}</span></div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="v5-beyond">
        <div className="v5-beyond-inner">
          <div className="v5-beyond-title v5-reveal"><p className="eyebrow mono">BEYOND THE CODE / 08</p><h2>ENGINEERING<br /><span>WITH CONTEXT.</span></h2></div>
          <div className="v5-timeline v5-reveal">
            <article><span className="mono">2027</span><h3>B.Tech Computer Science Engineering</h3><p>Delhi Skills and Entrepreneurship University · Current CGPA 7.0/10.</p></article>
            <article><span className="mono">03+ YEARS</span><h3>Class Representative</h3><p>Student–faculty coordination, communication and academic operations.</p></article>
            <article><span className="mono">TECH-SPARK</span><h3>Coding Society Head</h3><p>Technical initiatives and developer engagement across campus.</p></article>
            <article><span className="mono">PLACEMENTS</span><h3>Placement Coordinator</h3><p>Placement activities and student information workflows.</p></article>
          </div>
          <div className="v5-coursework v5-reveal">
            <p className="mono">RELEVANT COURSEWORK</p>
            <div>
              <span>DATA STRUCTURES &amp; ALGORITHMS</span>
              <span>DATABASE MANAGEMENT SYSTEMS</span>
              <span>OBJECT-ORIENTED PROGRAMMING</span>
              <span>OPERATING SYSTEMS</span>
              <span>COMPUTER NETWORKS</span>
              <span>SOFTWARE ENGINEERING</span>
            </div>
          </div>
        </div>
      </section>

      <section className="v5-contact" id="contact">
        <div className="v5-contact-inner v5-reveal">
          <p className="eyebrow mono">CONTACT / 09</p>
          <h2>LET&apos;S BUILD<br />SOMETHING<br /><span>THAT WORKS.</span></h2>
          <p>Currently open to Software Development and Full-Stack Engineering internships and opportunities.</p>
          <div className="v5-contact-actions">
            <a className="button button--primary" href={`mailto:${site.email}`}>START A CONVERSATION ↗</a>
            <a className="button button--ghost" href={site.github} target="_blank" rel="noreferrer">GITHUB ↗</a>
            <a className="button button--ghost" href={site.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a>
            <a className="button button--ghost" href="/Aman-Resume.pdf" target="_blank" rel="noreferrer">RESUME ↗</a>
          </div>
        </div>
        <footer className="v5-footer mono"><span>AMAN / 2026</span><span>NEW DELHI, INDIA</span><a href="#top">BACK TO TOP ↑</a></footer>
      </section>
    </main>
  );
}
