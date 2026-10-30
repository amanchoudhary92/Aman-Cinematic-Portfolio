"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL_FRAMES = 120;
const framePath = (index: number) => `/frames/aman/frame-${String(index + 1).padStart(3, "0")}.webp`;

const CHAPTERS = [
  { selector: ".v5-hero", from: 0, to: 13 },
  { selector: ".v5-system", from: 13, to: 27 },
  { selector: ".v5-manifesto", from: 27, to: 50 },
  { selector: ".v5-work", from: 50, to: 68 },
  { selector: ".v5-philosophy", from: 68, to: 78 },
  { selector: ".v5-about", from: 78, to: 92 },
  { selector: ".v5-stack", from: 92, to: 106 },
  { selector: ".v5-beyond", from: 106, to: 113 },
  { selector: ".v5-contact", from: 113, to: 119 },
] as const;

const clampFrame = (value: number) => Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(value)));

export default function FrameSequenceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const loadStep = mobile ? 2 : 1;
    const maxCachedFrames = mobile ? 44 : 76;
    const images: Array<HTMLImageElement | undefined> = new Array(TOTAL_FRAMES);
    const loading = new Set<number>();
    const usedAt = new Map<number, number>();
    let disposed = false;
    let activeFrame = reducedMotion ? 56 : 0;
    let lastDrawn = -1;
    let usageTick = 0;
    let drawRaf = 0;
    let idleHandle: number | null = null;

    const requestIdle = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
      if (window.requestIdleCallback) return window.requestIdleCallback(callback, options);
      return window.setTimeout(
        () => callback({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline),
        options?.timeout ?? 180
      );
    };

    const cancelIdle = (handle: number) => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };

    const markUsed = (index: number) => {
      usageTick += 1;
      usedAt.set(index, usageTick);
    };

    const pruneCache = () => {
      const loaded = images
        .map((image, index) => ({ image, index, tick: usedAt.get(index) || 0 }))
        .filter((entry) => entry.image);

      if (loaded.length <= maxCachedFrames) return;

      loaded
        .sort((a, b) => a.tick - b.tick)
        .slice(0, loaded.length - maxCachedFrames)
        .forEach(({ index }) => {
          if (Math.abs(index - activeFrame) <= 8 || CHAPTERS.some((chapter) => chapter.from === index || chapter.to === index)) return;
          images[index] = undefined;
          usedAt.delete(index);
        });
    };

    const loadFrame = (index: number, sync = false) => {
      const safeIndex = clampFrame(index);
      if (images[safeIndex] || loading.has(safeIndex)) return;
      loading.add(safeIndex);
      const image = new Image();
      image.decoding = sync ? "sync" : "async";
      image.src = framePath(safeIndex);
      image.onload = () => {
        if (disposed) return;
        images[safeIndex] = image;
        loading.delete(safeIndex);
        markUsed(safeIndex);
        if (lastDrawn < 0 || Math.abs(safeIndex - activeFrame) <= loadStep * 2) scheduleDraw(activeFrame);
        pruneCache();
      };
      image.onerror = () => {
        loading.delete(safeIndex);
        images[safeIndex] = undefined;
      };
    };

    const warmAround = (center: number) => {
      const distance = mobile ? 8 : 12;
      for (let offset = 0; offset <= distance; offset += loadStep) {
        loadFrame(center + offset);
        if (offset > 0) loadFrame(center - offset);
      }
    };

    const nearestLoaded = (wanted: number) => {
      const safeWanted = clampFrame(wanted);
      if (images[safeWanted]?.complete) return safeWanted;
      for (let distance = loadStep; distance < TOTAL_FRAMES; distance += loadStep) {
        const down = safeWanted - distance;
        const up = safeWanted + distance;
        if (down >= 0 && images[down]?.complete) return down;
        if (up < TOTAL_FRAMES && images[up]?.complete) return up;
      }
      return -1;
    };

    const drawNow = (requested = activeFrame) => {
      if (disposed) return;
      drawRaf = 0;
      const index = nearestLoaded(clampFrame(requested));
      if (index < 0) return;
      const image = images[index];
      if (!image || !image.naturalWidth || !image.naturalHeight) return;

      const rect = canvas.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width || window.innerWidth);
      const cssHeight = Math.max(1, rect.height || window.innerHeight);
      // V5 visual master values retained: high-quality canvas, with the same mobile/desktop caps.
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5);
      const pixelWidth = Math.round(cssWidth * dpr);
      const pixelHeight = Math.round(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = pixelWidth / pixelHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (canvasRatio > imageRatio) {
        sourceHeight = image.naturalWidth / canvasRatio;
        sourceY = (image.naturalHeight - sourceHeight) * 0.5;
      } else {
        sourceWidth = image.naturalHeight * canvasRatio;
        const focus = mobile ? 0.52 : 0.5;
        sourceX = Math.max(0, Math.min(image.naturalWidth - sourceWidth, image.naturalWidth * focus - sourceWidth * 0.5));
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#050507";
      context.fillRect(0, 0, pixelWidth, pixelHeight);
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, pixelWidth, pixelHeight);
      lastDrawn = index;
      markUsed(index);
    };

    function scheduleDraw(requested = activeFrame) {
      if (drawRaf) return;
      drawRaf = window.requestAnimationFrame(() => drawNow(requested));
    }

    const priority = [0, 13, 27, 38, 50, 68, 78, 92, 106, 113, 119];
    priority.forEach((index) => loadFrame(index, index === activeFrame));
    loadFrame(activeFrame, true);
    warmAround(activeFrame);

    const idlePreload = () => {
      if (disposed) return;
      const remaining = Array.from({ length: TOTAL_FRAMES }, (_, i) => i).find(
        (index) => index % loadStep === 0 && !images[index] && !loading.has(index)
      );
      if (remaining === undefined) return;
      loadFrame(remaining);
      idleHandle = requestIdle(idlePreload, { timeout: 700 });
    };

    idleHandle = requestIdle(idlePreload, { timeout: 900 });

    const onResize = () => scheduleDraw(activeFrame);
    window.addEventListener("resize", onResize, { passive: true });

    const chapterTriggers: ScrollTrigger[] = [];
    if (!reducedMotion) {
      CHAPTERS.forEach((chapter) => {
        const element = document.querySelector(chapter.selector);
        if (!element) return;
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top top",
          end: "bottom top",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const raw = chapter.from + (chapter.to - chapter.from) * self.progress;
            activeFrame = mobile
              ? Math.round(raw / loadStep) * loadStep
              : Math.round(raw);
            activeFrame = clampFrame(activeFrame);
            warmAround(activeFrame);
            scheduleDraw(activeFrame);
          },
          onEnter: () => {
            activeFrame = chapter.from;
            warmAround(activeFrame);
            scheduleDraw(activeFrame);
          },
          onEnterBack: () => {
            activeFrame = chapter.to;
            warmAround(activeFrame);
            scheduleDraw(activeFrame);
          },
        });
        chapterTriggers.push(trigger);
      });
    } else {
      activeFrame = 56;
      warmAround(activeFrame);
    }

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      if (drawRaf) window.cancelAnimationFrame(drawRaf);
      if (idleHandle !== null) cancelIdle(idleHandle);
      window.removeEventListener("resize", onResize);
      chapterTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="v5-frame-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="v5-frame-canvas" />
      <div className="v5-frame-tone" />
      <div className="v5-frame-vignette" />
      <div className="film-grain" />
    </div>
  );
}
