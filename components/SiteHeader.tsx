"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const homeSections = ["work", "about", "stack"] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const projectsActive = pathname === "/projects" || pathname.startsWith("/work/");
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const updateScrolled = () => {
      raf = 0;
      const next = window.scrollY > 32;
      setScrolled((current) => (current === next ? current : next));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(updateScrolled);
    };
    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!onHome) return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };

    const observers = homeSections
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((element) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          },
          { rootMargin: "-38% 0px -48% 0px", threshold: 0 }
        );
        observer.observe(element!);
        return observer;
      });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [onHome]);

  const close = () => setMenuOpen(false);

  return (
    <nav className={`main-nav v5-nav ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "is-menu-open" : ""}`} aria-label="Primary navigation">
      <a className="brand" href={onHome ? "#top" : "/#top"} onClick={close}>AMAN.</a>

      <button className="v5-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
        <span /><span />
      </button>

      <div className="nav-links mono v5-nav-links">
        {!onHome && <a href="/#top" onClick={close}>HOME</a>}
        <a className={active === "work" ? "is-active" : ""} href={onHome ? "#work" : "/#work"} onClick={close}>WORK</a>
        <a className={projectsActive ? "is-active" : ""} href="/projects" onClick={close}>PROJECTS</a>
        <a className={active === "about" ? "is-active" : ""} href={onHome ? "#about" : "/#about"} onClick={close}>ABOUT</a>
        <a className={active === "stack" ? "is-active" : ""} href={onHome ? "#stack" : "/#stack"} onClick={close}>STACK</a>
      </div>

      <div className="nav-actions v5-nav-actions">
        <span className="availability mono"><i /> OPEN TO INTERNSHIPS</span>
        <a className="nav-cta" href={onHome ? "#contact" : "/#contact"} onClick={close}>CONTACT ↗</a>
      </div>
    </nav>
  );
}
