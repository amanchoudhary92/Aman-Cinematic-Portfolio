import * as THREE from "three";

/** 3D category presets for new CMS projects. None uses an original project model. */
export type GenericSceneKey = "platform" | "security" | "backend" | "abstract" | "portfolio" | "minimal";
type Disposable = { dispose: () => void };
type Point = [number, number, number];

export function addGenericScene(
  kind: GenericSceneKey,
  root: THREE.Group,
  scene: THREE.Scene,
  disposables: Disposable[],
): void {
  const keep = <T extends Disposable>(resource: T): T => { disposables.push(resource); return resource; };
  const metal = (color: number, glow = 0) => keep(new THREE.MeshPhysicalMaterial({
    color, metalness: 0.7, roughness: 0.23, clearcoat: 0.86,
    emissive: color, emissiveIntensity: glow,
  }));
  const flat = (color: number, opacity = 1) => keep(new THREE.MeshBasicMaterial({
    color, transparent: opacity < 1, opacity, side: THREE.DoubleSide,
  }));
  const box = (parent: THREE.Object3D, dims: Point, material: THREE.Material, pos: Point, rotY = 0) => {
    const mesh = new THREE.Mesh(keep(new THREE.BoxGeometry(...dims)), material);
    mesh.position.set(...pos);
    mesh.rotation.y = rotY;
    parent.add(mesh);
    return mesh;
  };
  const ring = (radius: number, tube: number, color: number, opacity: number, rotation: Point) => {
    const mesh = new THREE.Mesh(keep(new THREE.TorusGeometry(radius, tube, 8, 120)), flat(color, opacity));
    mesh.rotation.set(...rotation);
    root.add(mesh);
    return mesh;
  };
  const light = (color: number, intensity: number, pos: Point) => {
    const pointLight = new THREE.PointLight(color, intensity, 20, 2);
    pointLight.position.set(...pos);
    scene.add(pointLight);
  };

  if (kind === "platform") {
    // Floating application panels, not Campus Hub's icosahedron/network sculpture.
    const navy = metal(0x10152c, 0.11);
    const lilac = metal(0x7566d2, 0.15);
    const mint = flat(0x88ffe2);
    const panelPositions: Point[] = [[-1.83, 0.35, -0.35], [0.12, 0.05, 0.56], [2.02, -0.22, -0.65]];
    panelPositions.forEach(([x, y, z], i) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.y = i === 0 ? 0.21 : i === 1 ? -0.08 : -0.34;
      root.add(group);
      box(group, [1.62, 2.08, 0.12], navy, [0, 0, 0]);
      box(group, [1.36, 0.13, 0.016], lilac, [0, 0.76, 0.071]);
      box(group, [1.25, 0.57, 0.015], flat(i === 1 ? 0x3a436e : 0x252a53), [0, 0.21, 0.072]);
      for (let j = 0; j < 3; j++) {
        box(group, [1.16 - j * 0.16, 0.045, 0.017], j === 0 ? mint : lilac, [-0.07 - j * 0.08, -0.26 - j * 0.24, 0.075]);
      }
    });
    ring(3.05, 0.012, 0x7d87ff, 0.25, [0.86, 0.2, 0.3]);
    light(0x8b81ff, 36, [-3, 2, 4]); light(0x72ffd7, 24, [3, -1, 3]);
  }

  if (kind === "security") {
    // Standalone security shield: intentionally not CodeShield's scanner/box model.
    const edge = metal(0x35e2d4, 0.14);
    const body = metal(0x0b2630, 0.09);
    const shieldOutline = new THREE.Shape();
    shieldOutline.moveTo(0, 1.78);
    shieldOutline.lineTo(1.33, 1.15);
    shieldOutline.lineTo(1.12, -0.75);
    shieldOutline.lineTo(0, -1.92);
    shieldOutline.lineTo(-1.12, -0.75);
    shieldOutline.lineTo(-1.33, 1.15);
    shieldOutline.closePath();
    const shield = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(shieldOutline, {
      depth: 0.24, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.045, bevelThickness: 0.045,
    })), body);
    shield.rotation.y = -0.15;
    root.add(shield);
    const shieldPoints = [
      [0, 1.78], [1.33, 1.15], [1.12, -0.75], [0, -1.92], [-1.12, -0.75], [-1.33, 1.15],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0.3));
    const rimGeometry = keep(new THREE.BufferGeometry().setFromPoints(shieldPoints));
    const rimMaterial = keep(new THREE.LineBasicMaterial({ color: 0x6bffe0 }));
    const rim = new THREE.LineLoop(rimGeometry, rimMaterial);
    root.add(rim);
    // Stylized lock symbol: open geometry rather than a copied logo.
    box(root, [0.79, 0.75, 0.19], edge, [0, -0.18, 0.49]);
    const lockArc = new THREE.Mesh(keep(new THREE.TorusGeometry(0.32, 0.075, 10, 32, Math.PI)), edge);
    lockArc.position.set(0, 0.24, 0.49);
    root.add(lockArc);
    ring(2.58, 0.018, 0x41fded, 0.30, [0.77, 0.13, -0.20]);
    ring(3.2, 0.011, 0x8d8aff, 0.18, [-0.42, 0.35, 0.35]);
    light(0x29ecd7, 43, [2, 2, 4]); light(0x5569ff, 20, [-3, 0, 3]);
  }

  if (kind === "backend") {
    // Three server-rack towers and signal LEDs, not the CodeShield hero.
    const graphite = metal(0x171c30, 0.08);
    const panel = metal(0x252d42);
    const cyan = metal(0x4ccffc, 0.45);
    const amber = metal(0xffb86f, 0.25);
    [-1.5, 0, 1.5].forEach((x, i) => {
      const rack = new THREE.Group();
      rack.position.set(x, i === 1 ? 0.30 : -0.16, 0);
      rack.rotation.y = i === 0 ? -0.2 : i === 2 ? 0.24 : 0;
      root.add(rack);
      box(rack, [1.15, 2.66, 0.94], graphite, [0, 0, 0]);
      for (let j = 0; j < 6; j++) {
        const y = 0.95 - j * 0.37;
        box(rack, [0.90, 0.23, 0.03], panel, [0, y, 0.49]);
        box(rack, [0.12, 0.095, 0.04], j % 3 === 0 ? amber : cyan, [0.32, y, 0.52]);
      }
    });
    ring(2.98, 0.012, 0x69a9ff, 0.17, [1.18, 0.14, 0]);
    light(0x64b2ff, 33, [-2, 2, 5]); light(0xff9a65, 27, [2.5, -1, 3]);
  }

  if (kind === "abstract") {
    // Generic design-system sculpture: intertwined knots and floating facets.
    const violet = metal(0x5b4cb4, 0.11);
    const pink = metal(0xc65a83, 0.14);
    const teal = metal(0x3ba39e, 0.12);
    const main = new THREE.Mesh(keep(new THREE.TorusKnotGeometry(1.36, 0.23, 160, 14, 2, 5)), violet);
    main.rotation.x = 0.48;
    root.add(main);
    const small = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(0.45, 1)), pink);
    small.position.set(1.65, 1.42, -0.65);
    root.add(small);
    const facet = new THREE.Mesh(keep(new THREE.OctahedronGeometry(0.56, 0)), teal);
    facet.position.set(-1.8, -1.25, 0.5);
    root.add(facet);
    ring(2.95, 0.012, 0xe67fa9, 0.22, [0.35, 1.1, 0.4]);
    light(0xb37cff, 33, [2, 2, 4]); light(0xf97496, 25, [-3, -1, 4]);
  }

  if (kind === "portfolio") {
    // Creative workstation / layered web canvases, not a campus or tea visual.
    const ink = metal(0x171a27, 0.08);
    const silver = metal(0xb5bfd5, 0.12);
    const pop = metal(0xeb6c86, 0.22);
    [[-1.25, 0.38, -0.65], [0, 0, 0.3], [1.32, -0.25, -0.35]].forEach(([x, y, z], i) => {
      const card = new THREE.Group();
      card.position.set(x, y, z);
      card.rotation.y = (1 - i) * 0.28;
      card.rotation.z = (1 - i) * -0.14;
      root.add(card);
      box(card, [1.75, 2.12, 0.12], silver, [0, 0, 0]);
      box(card, [1.59, 1.93, 0.02], ink, [0, 0, 0.069]);
      box(card, [1.30, 0.55, 0.03], i === 1 ? pop : silver, [0, 0.34, 0.084]);
      box(card, [1.30, 0.085, 0.03], silver, [0, -0.22, 0.085]);
      box(card, [0.87, 0.085, 0.03], pop, [-0.22, -0.51, 0.085]);
    });
    ring(3.15, 0.013, 0xff85a9, 0.21, [1.0, 0.2, 0]);
    light(0xf17fa5, 38, [2.4, 2.8, 4]); light(0x83a5ff, 25, [-3, -1, 3]);
  }

  if (kind === "minimal") {
    // Quiet gallery of geometric forms, no inherited product-specific imagery.
    const stone = metal(0xb0b0c0);
    const charcoal = metal(0x191c27, 0.05);
    const gold = metal(0xdaa878, 0.16);
    const cube = box(root, [1.8, 1.8, 1.8], charcoal, [0, 0, 0]);
    cube.rotation.set(0.35, 0.52, 0.32);
    const sphere = new THREE.Mesh(keep(new THREE.SphereGeometry(0.62, 48, 32)), stone);
    sphere.position.set(-1.64, 1.07, 0.76);
    root.add(sphere);
    const pyramid = new THREE.Mesh(keep(new THREE.ConeGeometry(0.78, 1.47, 4)), gold);
    pyramid.position.set(1.7, -0.84, 0.3);
    pyramid.rotation.y = Math.PI / 4;
    root.add(pyramid);
    ring(2.75, 0.012, 0xe9bc95, 0.19, [0.6, -0.2, 0]);
    light(0xffffff, 31, [3, 2, 5]); light(0x9b88cc, 19, [-3, -2, 3]);
  }
}
