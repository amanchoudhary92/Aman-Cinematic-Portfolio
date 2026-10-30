"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let isInView = true;
    let isTabVisible = !document.hidden;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 7.2);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const root = new THREE.Group();
      scene.add(root);

      const coreGeometry = new THREE.IcosahedronGeometry(1.05, 4);
      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0b0b12,
        metalness: 0.92,
        roughness: 0.16,
        emissive: new THREE.Color(0x6d0f2e),
        emissiveIntensity: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      root.add(core);

      const wireGeometry = new THREE.IcosahedronGeometry(1.14, 2);
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4775,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
      });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      root.add(wire);

      const ringMaterialA = new THREE.MeshBasicMaterial({ color: 0xff3a69, transparent: true, opacity: 0.36 });
      const ringMaterialB = new THREE.MeshBasicMaterial({ color: 0x745cff, transparent: true, opacity: 0.26 });
      const ringMaterialC = new THREE.MeshBasicMaterial({ color: 0x73ffe2, transparent: true, opacity: 0.16 });

      const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.012, 8, 128), ringMaterialA);
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.008, 8, 128), ringMaterialB);
      const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.48, 0.007, 8, 128), ringMaterialC);
      ringB.rotation.x = Math.PI * 0.5;
      ringB.rotation.z = 0.72;
      ringC.rotation.x = 1.04;
      ringC.rotation.y = 0.52;
      root.add(ringA, ringB, ringC);

      const nodePositions: THREE.Vector3[] = [];
      const nodeCount = 46;
      const nodeArray = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        const y = 1 - (i / (nodeCount - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = i * 2.399963229728653;
        const point = new THREE.Vector3(
          Math.cos(angle) * radius * 3.0,
          y * 2.35,
          Math.sin(angle) * radius * 3.0
        );
        nodePositions.push(point);
        nodeArray[i * 3] = point.x;
        nodeArray[i * 3 + 1] = point.y;
        nodeArray[i * 3 + 2] = point.z;
      }

      const nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodeArray, 3));
      const nodeMaterial = new THREE.PointsMaterial({
        color: 0xff7197,
        size: 0.055,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
      });
      const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
      root.add(nodes);

      const lineVertices: number[] = [];
      for (let i = 0; i < 32; i++) {
        const a = nodePositions[i];
        const b = nodePositions[(i * 7 + 9) % nodePositions.length];
        lineVertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lineVertices, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x875cff, transparent: true, opacity: 0.18 });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      root.add(lines);

      const dustCount = 220;
      const dustArray = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustArray[i * 3] = (Math.random() - 0.5) * 13;
        dustArray[i * 3 + 1] = (Math.random() - 0.5) * 9;
        dustArray[i * 3 + 2] = (Math.random() - 0.5) * 7;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustArray, 3));
      const dustMaterial = new THREE.PointsMaterial({ color: 0xd6d0ff, size: 0.018, transparent: true, opacity: 0.42 });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      scene.add(new THREE.AmbientLight(0xffffff, 0.52));
      const redLight = new THREE.PointLight(0xff315f, 36, 16, 2);
      redLight.position.set(4, 2, 5);
      scene.add(redLight);
      const violetLight = new THREE.PointLight(0x6e4cff, 28, 16, 2);
      violetLight.position.set(-4, -2, 4);
      scene.add(violetLight);
      const cyanLight = new THREE.PointLight(0x65ffe0, 16, 14, 2);
      cyanLight.position.set(0, 4, -1);
      scene.add(cyanLight);

      const pointer = new THREE.Vector2(0, 0);
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const resize = () => {
        if (!mount || !renderer) return;
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
        const delta = Math.min(clock.getDelta(), 0.04);

        root.rotation.y += 0.0014 + delta * 0.01;
        root.rotation.x += (pointer.y * 0.11 - root.rotation.x) * 0.035;
        root.rotation.z += (-pointer.x * 0.075 - root.rotation.z) * 0.035;
        core.rotation.y = -t * 0.2;
        wire.rotation.x = t * 0.09;
        ringA.rotation.z = t * 0.16;
        ringB.rotation.y = t * 0.13;
        ringC.rotation.z = -t * 0.08;
        dust.rotation.y = t * 0.009;

        camera.position.x += (pointer.x * 0.22 - camera.position.x) * 0.025;
        camera.position.y += (pointer.y * 0.14 - camera.position.y) * 0.025;
        camera.lookAt(0, 0, 0);

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
        coreGeometry.dispose();
        coreMaterial.dispose();
        wireGeometry.dispose();
        wireMaterial.dispose();
        ringA.geometry.dispose();
        ringB.geometry.dispose();
        ringC.geometry.dispose();
        ringMaterialA.dispose();
        ringMaterialB.dispose();
        ringMaterialC.dispose();
        nodeGeometry.dispose();
        nodeMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    } catch {
      mount.dataset.webgl = "unavailable";
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div ref={mountRef} className="three-mount" aria-hidden="true" />;
}
