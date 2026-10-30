"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { addGenericScene } from "./GenericProjectScenes";
import type { ProjectSceneKey } from "../lib/projects";

export type ProjectSceneVariant = ProjectSceneKey;

export default function ProjectScene({ variant }: { variant: ProjectSceneVariant }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let isInView = true;
    let isTabVisible = !document.hidden;

    const disposables: Array<{ dispose: () => void }> = [];

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
      camera.position.set(0, 0.15, 7.6);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const root = new THREE.Group();
      scene.add(root);

      const pointer = new THREE.Vector2();
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const visualVariant = variant;
      scene.add(new THREE.AmbientLight(0xffffff, 0.42));

      if (visualVariant === "campus") {
        const colors = [0x775cff, 0x79ffe4, 0xff426f];
        const centerGeometry = new THREE.IcosahedronGeometry(0.9, 2);
        const centerMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0a0a12,
          metalness: 0.92,
          roughness: 0.2,
          emissive: 0x28185c,
          emissiveIntensity: 1.2,
          clearcoat: 1,
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        root.add(center);
        disposables.push(centerGeometry, centerMaterial);

        const nodeGeometry = new THREE.SphereGeometry(0.12, 18, 18);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x806dff, transparent: true, opacity: 0.32 });
        disposables.push(nodeGeometry, lineMaterial);
        const positions = [
          [-2.4, 1.35, 0.2], [2.35, 1.2, -0.15], [-2.65, -1.05, -0.2],
          [2.6, -1.15, 0.1], [0, 2.25, -0.35], [0.25, -2.3, 0.25],
        ] as const;

        positions.forEach((position, index) => {
          const [x, y, z] = position;
          const material = new THREE.MeshStandardMaterial({
            color: colors[index % colors.length],
            emissive: colors[index % colors.length],
            emissiveIntensity: 0.5,
            metalness: 0.55,
            roughness: 0.28,
          });
          disposables.push(material);
          const node = new THREE.Mesh(nodeGeometry, material);
          node.position.set(x, y, z);
          root.add(node);

          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, y, z),
          ]);
          disposables.push(lineGeometry);
          root.add(new THREE.Line(lineGeometry, lineMaterial));
        });

        [1.35, 1.85, 2.35].forEach((radius, index) => {
          const geometry = new THREE.TorusGeometry(radius, 0.012, 8, 128);
          const material = new THREE.MeshBasicMaterial({ color: colors[index], transparent: true, opacity: 0.32 - index * 0.06 });
          disposables.push(geometry, material);
          const ring = new THREE.Mesh(geometry, material);
          ring.rotation.x = index * 0.62;
          ring.rotation.y = index * 0.34;
          root.add(ring);
        });

        const lightA = new THREE.PointLight(0x775cff, 34, 18, 2);
        lightA.position.set(-3, 2, 4);
        scene.add(lightA);
        const lightB = new THREE.PointLight(0x79ffe4, 24, 18, 2);
        lightB.position.set(3, -1, 4);
        scene.add(lightB);
      }

      if (visualVariant === "codeshield") {
        const coreGeometry = new THREE.BoxGeometry(1.45, 1.75, 0.55, 6, 6, 2);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x080b0d,
          metalness: 0.96,
          roughness: 0.16,
          emissive: 0x0e422d,
          emissiveIntensity: 1.25,
          clearcoat: 1,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        root.add(core);
        disposables.push(coreGeometry, coreMaterial);

        const edgeGeometry = new THREE.EdgesGeometry(coreGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x79ffe4, transparent: true, opacity: 0.65 });
        disposables.push(edgeGeometry, edgeMaterial);
        root.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

        [1.45, 2.05, 2.65].forEach((radius, index) => {
          const geometry = new THREE.TorusGeometry(radius, index === 0 ? 0.025 : 0.012, 10, 160);
          const material = new THREE.MeshBasicMaterial({
            color: index === 0 ? 0x79ffe4 : index === 1 ? 0x775cff : 0xff426f,
            transparent: true,
            opacity: 0.42 - index * 0.08,
          });
          disposables.push(geometry, material);
          const ring = new THREE.Mesh(geometry, material);
          ring.rotation.x = index === 1 ? Math.PI * 0.5 : 0.55 + index * 0.25;
          ring.rotation.z = index * 0.8;
          root.add(ring);
        });

        const scanGeometry = new THREE.PlaneGeometry(5.8, 0.035);
        const scanMaterial = new THREE.MeshBasicMaterial({ color: 0x79ffe4, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
        disposables.push(scanGeometry, scanMaterial);
        const scan = new THREE.Mesh(scanGeometry, scanMaterial);
        scan.position.z = 0.7;
        root.add(scan);
        scan.userData.scanner = true;

        const light = new THREE.PointLight(0x79ffe4, 34, 16, 2);
        light.position.set(2.5, 1.5, 4);
        scene.add(light);
        const red = new THREE.PointLight(0xff426f, 20, 16, 2);
        red.position.set(-3, -1, 3);
        scene.add(red);
      }

      if (visualVariant === "mistvale") {
        const tinGroup = new THREE.Group();
        root.add(tinGroup);
        const palettes = [0x173d2b, 0x7f1820, 0xd8c59d];
        [-1.7, 0, 1.7].forEach((x, index) => {
          const bodyGeometry = new THREE.CylinderGeometry(0.62, 0.62, 1.72, 48);
          const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: palettes[index],
            metalness: 0.72,
            roughness: 0.28,
            clearcoat: 0.85,
            clearcoatRoughness: 0.2,
          });
          disposables.push(bodyGeometry, bodyMaterial);
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.x = x;
          body.rotation.y = index * 0.35;
          tinGroup.add(body);

          const lidGeometry = new THREE.CylinderGeometry(0.66, 0.66, 0.12, 48);
          const lidMaterial = new THREE.MeshStandardMaterial({ color: 0xc7a35b, metalness: 0.85, roughness: 0.26 });
          disposables.push(lidGeometry, lidMaterial);
          const lidTop = new THREE.Mesh(lidGeometry, lidMaterial);
          lidTop.position.set(x, 0.92, 0);
          tinGroup.add(lidTop);
          const lidBottom = lidTop.clone();
          lidBottom.position.y = -0.92;
          tinGroup.add(lidBottom);
        });

        const ringGeometry = new THREE.TorusGeometry(2.95, 0.015, 8, 160);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd9ff7d, transparent: true, opacity: 0.22 });
        disposables.push(ringGeometry, ringMaterial);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = 1.05;
        root.add(ring);

        const warm = new THREE.PointLight(0xffc46f, 32, 20, 2);
        warm.position.set(4, 3, 5);
        scene.add(warm);
        const green = new THREE.PointLight(0x8fef8b, 22, 18, 2);
        green.position.set(-4, -1, 4);
        scene.add(green);
      }

      // E-commerce receives its own brand-neutral retail sculpture.
      // Mistvale's tea tins above are intentionally exclusive to "mistvale".
      if (visualVariant === "ecommerce") {
        const graphite = new THREE.MeshPhysicalMaterial({
          color: 0x17151e, metalness: 0.62, roughness: 0.28,
          clearcoat: 0.72, clearcoatRoughness: 0.18,
        });
        const oxblood = new THREE.MeshPhysicalMaterial({
          color: 0x58132b, metalness: 0.52, roughness: 0.31,
          clearcoat: 0.8,
        });
        const champagne = new THREE.MeshStandardMaterial({
          color: 0xe9b77c, metalness: 0.86, roughness: 0.2,
          emissive: 0x6f3414, emissiveIntensity: 0.24,
        });
        const violet = new THREE.MeshPhysicalMaterial({
          color: 0x32204f, metalness: 0.42, roughness: 0.23,
          emissive: 0x1c0e31, emissiveIntensity: 0.3,
          clearcoat: 1,
        });
        disposables.push(graphite, oxblood, champagne, violet);

        // Premium shopping bag: a real box silhouette with curved handles,
        // rather than product tins / cylinders used by Mistvale.
        const bagGroup = new THREE.Group();
        bagGroup.position.set(0.12, -0.05, 0.5);
        bagGroup.rotation.y = -0.22;
        root.add(bagGroup);

        const bagGeometry = new THREE.BoxGeometry(1.85, 1.9, 0.72);
        const bag = new THREE.Mesh(bagGeometry, graphite);
        bagGroup.add(bag);
        disposables.push(bagGeometry);
        const frontGeometry = new THREE.PlaneGeometry(1.55, 1.55);
        const front = new THREE.Mesh(frontGeometry, oxblood);
        front.position.set(0, -0.07, 0.369);
        bagGroup.add(front);
        disposables.push(frontGeometry);

        // A minimalist inset emblem, visually distinct from any actual logo.
        const crestGeometry = new THREE.TorusGeometry(0.34, 0.027, 10, 64);
        const crest = new THREE.Mesh(crestGeometry, champagne);
        crest.position.set(0, -0.01, 0.383);
        bagGroup.add(crest);
        disposables.push(crestGeometry);
        const crestLineGeo = new THREE.BoxGeometry(0.52, 0.034, 0.02);
        const crestLine = new THREE.Mesh(crestLineGeo, champagne);
        crestLine.position.set(0, -0.54, 0.389);
        bagGroup.add(crestLine);
        disposables.push(crestLineGeo);

        for (const z of [-0.20, 0.20]) {
          const handleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.40, 0.89, z),
            new THREE.Vector3(-0.40, 1.38, z),
            new THREE.Vector3(0, 1.55, z),
            new THREE.Vector3(0.40, 1.38, z),
            new THREE.Vector3(0.40, 0.89, z),
          ]);
          const handleGeometry = new THREE.TubeGeometry(handleCurve, 48, 0.035, 8, false);
          const handle = new THREE.Mesh(handleGeometry, champagne);
          bagGroup.add(handle);
          disposables.push(handleGeometry);
        }

        // Left: ribbon-wrapped delivery parcel, representing fulfilment.
        const parcelGroup = new THREE.Group();
        parcelGroup.position.set(-2.0, -0.58, 0.05);
        parcelGroup.rotation.set(0.1, 0.27, -0.12);
        root.add(parcelGroup);
        const parcelGeo = new THREE.BoxGeometry(1.12, 1.04, 1.05);
        parcelGroup.add(new THREE.Mesh(parcelGeo, violet));
        disposables.push(parcelGeo);
        const ribbonVertical = new THREE.BoxGeometry(0.16, 1.065, 1.071);
        const ribbonHorizontal = new THREE.BoxGeometry(1.14, 0.16, 1.071);
        parcelGroup.add(new THREE.Mesh(ribbonVertical, champagne));
        parcelGroup.add(new THREE.Mesh(ribbonHorizontal, champagne));
        disposables.push(ribbonVertical, ribbonHorizontal);

        // Right: clean mobile-commerce screen silhouette, not a tea product.
        const phoneGroup = new THREE.Group();
        phoneGroup.position.set(2.08, 0.15, -0.20);
        phoneGroup.rotation.set(0.08, -0.28, 0.12);
        root.add(phoneGroup);
        const phoneGeo = new THREE.BoxGeometry(0.98, 1.8, 0.13);
        phoneGroup.add(new THREE.Mesh(phoneGeo, champagne));
        disposables.push(phoneGeo);
        const screenGeo = new THREE.BoxGeometry(0.88, 1.63, 0.015);
        const screen = new THREE.Mesh(screenGeo, graphite);
        screen.position.z = 0.074;
        phoneGroup.add(screen);
        disposables.push(screenGeo);
        const tileGeo = new THREE.BoxGeometry(0.68, 0.63, 0.021);
        const tile = new THREE.Mesh(tileGeo, oxblood);
        tile.position.set(0, 0.26, 0.088);
        phoneGroup.add(tile);
        disposables.push(tileGeo);
        for (const [y, width] of [[-0.28, 0.58], [-0.47, 0.43]] as const) {
          const lineGeo = new THREE.BoxGeometry(width, 0.036, 0.024);
          const line = new THREE.Mesh(lineGeo, champagne);
          line.position.set(-0.3 + width / 2, y, 0.088);
          phoneGroup.add(line);
          disposables.push(lineGeo);
        }

        // Editorial orbital details echo the portfolio's existing cinematic motion.
        for (const [radius, rotation, opacity] of [
          [2.93, 0.95, 0.25], [3.46, -0.48, 0.12],
        ] as const) {
          const orbitGeo = new THREE.TorusGeometry(radius, 0.013, 8, 156);
          const orbitMat = new THREE.MeshBasicMaterial({
            color: 0xffa780, transparent: true, opacity,
          });
          const orbit = new THREE.Mesh(orbitGeo, orbitMat);
          orbit.rotation.x = rotation;
          orbit.rotation.y = 0.3;
          root.add(orbit);
          disposables.push(orbitGeo, orbitMat);
        }

        const key = new THREE.PointLight(0xff997e, 48, 20, 2);
        key.position.set(3.2, 2.3, 4.4);
        scene.add(key);
        const fill = new THREE.PointLight(0xc6a2ff, 33, 20, 2);
        fill.position.set(-3.3, -0.5, 3.2);
        scene.add(fill);
      }

      // Independent, reusable category sculptures (never the three originals).
      if (visualVariant === "platform" || visualVariant === "security" ||
          visualVariant === "backend" || visualVariant === "abstract" ||
          visualVariant === "portfolio" || visualVariant === "minimal") {
        addGenericScene(visualVariant, root, scene, disposables);
      }

      const starCount = 160;
      const starArray = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starArray[i * 3] = (Math.random() - 0.5) * 14;
        starArray[i * 3 + 1] = (Math.random() - 0.5) * 8;
        starArray[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starArray, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xc9c4d1, size: 0.018, transparent: true, opacity: 0.36 });
      disposables.push(starGeometry, starMaterial);
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const resize = () => {
        if (!renderer) return;
        const width = Math.max(1, mount.clientWidth);
        const height = Math.max(1, mount.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      const shouldRender = () => !disposed && Boolean(renderer) && isInView && isTabVisible;
      const stopRenderLoop = () => {
        if (!frame) return;
        window.cancelAnimationFrame(frame);
        frame = 0;
      };
      const startRenderLoop = () => {
        if (frame || !shouldRender()) return;
        clock.getDelta();
        frame = window.requestAnimationFrame(animate);
      };

      const visibilityObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            isInView = Boolean(entry?.isIntersecting);
            if (isInView) startRenderLoop();
            else stopRenderLoop();
          }, { threshold: 0.05 })
        : null;
      visibilityObserver?.observe(mount);

      const onVisibilityChange = () => {
        isTabVisible = !document.hidden;
        if (isTabVisible) startRenderLoop();
        else stopRenderLoop();
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const clock = new THREE.Clock();
      const animate = () => {
        if (!shouldRender() || !renderer) {
          frame = 0;
          return;
        }
        const t = clock.getElapsedTime();
        root.rotation.y = t * (visualVariant === "mistvale" ? 0.08 : 0.12);
        root.rotation.x += (pointer.y * 0.08 - root.rotation.x) * 0.035;
        root.rotation.z += (-pointer.x * 0.045 - root.rotation.z) * 0.035;
        camera.position.x += (pointer.x * 0.18 - camera.position.x) * 0.025;
        camera.position.y += (pointer.y * 0.12 + 0.15 - camera.position.y) * 0.025;
        camera.lookAt(0, 0, 0);
        stars.rotation.y = t * 0.01;

        if (visualVariant === "codeshield") {
          const scanner = root.children.find((child) => child.userData.scanner) as THREE.Mesh | undefined;
          if (scanner) scanner.position.y = Math.sin(t * 1.8) * 1.8;
        }

        renderer.render(scene, camera);
        frame = window.requestAnimationFrame(animate);
      };
      startRenderLoop();

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        visibilityObserver?.disconnect();
        resizeObserver.disconnect();
        disposables.forEach((item) => item.dispose());
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    } catch {
      mount.dataset.webgl = "unavailable";
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [variant]);

  return <div ref={mountRef} className={`project-three project-three--${variant}`} aria-hidden="true" />;
}
