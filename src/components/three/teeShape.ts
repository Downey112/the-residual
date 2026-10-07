import * as THREE from "three";
import { createNoise2D, smoothstep } from "@/lib/noise";

/**
 * Procedural t-shirt.
 *
 * The shirt is described in a flat 2D "pattern space" (0..100 wide, 8..96 tall,
 * y up). A front and a back panel are built as dense grids over that space and
 * pushed out in z to form a draped, slightly rounded body with soft folds.
 * The silhouette is cut out with the texture's alpha channel, so edges stay
 * crisp without a custom triangulation, and the same outline drives both the
 * geometry (seam distance) and the canvas texture.
 */

export type Pt = [number, number];

export const PATTERN = { w: 100, yMin: 8, yMax: 96, h: 88 };
/** world units per pattern unit */
export const SCALE = 0.03;
export const CENTER: Pt = [50, 52];

// Neck openings, listed right to left as seen from the front.
const FRONT_NECK: Pt[] = [
  [58, 92], [56.6, 88.8], [53.8, 86.4], [50, 85.4], [46.2, 86.4], [43.4, 88.8], [42, 92],
];
const BACK_NECK: Pt[] = [
  [58, 92], [55, 91.2], [50, 90.8], [45, 91.2], [42, 92],
];

// Body outline, clockwise from the left neck point.
// Each entry: [x, y, closedEdgeToNext]. Closed edges are seams the front and
// back panels share; open edges (cuffs, hem, neck) leave the tube hollow.
const OUTLINE: { p: Pt; closed: boolean }[] = [
  { p: [42, 92], closed: true }, //  neck L -> shoulder L
  { p: [22, 88.5], closed: true }, // shoulder L -> sleeve top L
  { p: [3.5, 72.5], closed: false }, // sleeve cuff L
  { p: [11, 58.5], closed: true }, // sleeve underside L
  { p: [24, 63.5], closed: true }, // armpit L -> hem L
  { p: [24.5, 12], closed: false }, // hem
  { p: [75.5, 12], closed: true }, // hem R -> armpit R
  { p: [76, 63.5], closed: true }, // armpit R -> sleeve underside
  { p: [89, 58.5], closed: false }, // sleeve cuff R
  { p: [96.5, 72.5], closed: true }, // sleeve top R
  { p: [78, 88.5], closed: true }, // shoulder R -> neck R
  { p: [58, 92], closed: false }, // neck opening (handled separately)
];

type Seg = { a: Pt; b: Pt };

const closedSegments: Seg[] = [];
for (let i = 0; i < OUTLINE.length - 1; i++) {
  if (OUTLINE[i].closed) closedSegments.push({ a: OUTLINE[i].p, b: OUTLINE[i + 1].p });
}

function distToSegment(px: number, py: number, s: Seg): number {
  const [ax, ay] = s.a;
  const [bx, by] = s.b;
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function distClosed(x: number, y: number): number {
  let d = Infinity;
  for (const s of closedSegments) d = Math.min(d, distToSegment(x, y, s));
  return d;
}

/** Closed polygon (pattern space) for a panel, neck included */
export function panelPolygon(side: "front" | "back"): Pt[] {
  const neck = side === "front" ? FRONT_NECK : BACK_NECK;
  const pts: Pt[] = OUTLINE.slice(0, OUTLINE.length - 1).map((o) => o.p);
  // Walk the neck from right (58,92) back to left, then the loop closes at (42,92).
  pts.push(...neck.slice(0, neck.length - 1));
  return pts;
}

function chaikin(points: Pt[], iterations: number, cut = 0.22): Pt[] {
  let pts = points;
  for (let it = 0; it < iterations; it++) {
    const out: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      out.push([p[0] + (q[0] - p[0]) * cut, p[1] + (q[1] - p[1]) * cut]);
      out.push([p[0] + (q[0] - p[0]) * (1 - cut), p[1] + (q[1] - p[1]) * (1 - cut)]);
    }
    pts = out;
  }
  return pts;
}

/** Smoothed polygon for drawing the alpha silhouette */
export function smoothPanelPolygon(side: "front" | "back"): Pt[] {
  return chaikin(panelPolygon(side), 3);
}

const noiseA = createNoise2D(11);
const noiseB = createNoise2D(97);

export type Side = 1 | -1; // +1 front (toward +z), -1 back

/** Depth of the cloth surface at a pattern position, in pattern units */
export function clothDepth(x: number, y: number, side: Side): number {
  const d = distClosed(x, y);
  const isSleeve = x < 25.5 || x > 74.5;

  // Rounded tube cross-section: steep near seams, flat across the chest.
  const R = isSleeve ? 9 : 15;
  const k = Math.min(1, d / R);
  const profile = Math.sqrt(Math.max(0, 1 - (1 - k) * (1 - k)));
  const T = (isSleeve ? 2.6 : side === 1 ? 5.4 : 4.8) * (1 + 0.18 * Math.exp(-(((y - 62) / 16) ** 2)));
  let z = T * profile;

  // Fabric flares slightly toward the hem.
  z += 1.1 * smoothstep(34, 12, y) * profile;

  // Soft vertical drape folds, stronger near the hem.
  const wob = noiseA(x * 0.05, y * 0.04) * 2.2;
  z += 0.85 * smoothstep(74, 14, y) * Math.sin((x - 50) * 0.36 + wob) * profile;

  // Large, low-frequency undulation plus finer wrinkles.
  z += 0.9 * noiseB(x * 0.06 + 3.1, y * 0.06) * profile;
  z += 0.28 * noiseA(x * 0.22, y * 0.2) * profile;

  // Creases running from each armpit toward the centre of the chest.
  const crease = (ax: number, ay: number, bx: number, by: number) => {
    const dseg = distToSegment(x, y, { a: [ax, ay], b: [bx, by] });
    return Math.exp(-(dseg * dseg) / 5);
  };
  z -= 0.9 * crease(24, 62, 38, 48) * profile;
  z -= 0.9 * crease(76, 62, 62, 48) * profile;

  // The collar area pulls in slightly.
  z -= 1.4 * Math.exp(-(((y - 88) / 5) ** 2) - (((x - 50) / 14) ** 2));

  return Math.max(0, z) * side;
}

export type PanelGeometry = THREE.BufferGeometry;

/** Build one panel as a dense, displaced grid. */
export function buildPanelGeometry(side: Side, nx = 168, ny = 168): PanelGeometry {
  const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
  const uvs = new Float32Array((nx + 1) * (ny + 1) * 2);
  const indices: number[] = [];

  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = (i / nx) * PATTERN.w;
      const y = PATTERN.yMin + (j / ny) * PATTERN.h;
      const z = clothDepth(x, y, side);
      const idx = j * (nx + 1) + i;
      positions[idx * 3] = (x - CENTER[0]) * SCALE;
      positions[idx * 3 + 1] = (y - CENTER[1]) * SCALE;
      positions[idx * 3 + 2] = z * SCALE;
      // The back panel is seen from behind, so mirror u to keep prints readable.
      uvs[idx * 2] = side === 1 ? x / PATTERN.w : 1 - x / PATTERN.w;
      uvs[idx * 2 + 1] = (y - PATTERN.yMin) / PATTERN.h;
    }
  }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const b = a + 1;
      const c = a + (nx + 1);
      const d = c + 1;
      if (side === 1) indices.push(a, b, d, a, d, c);
      else indices.push(a, d, b, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/** Ribbed collar: a thin tube that follows the neck opening on both panels. */
export function buildCollarGeometry(): THREE.TubeGeometry {
  const toWorld = (x: number, y: number, side: Side) =>
    new THREE.Vector3((x - CENTER[0]) * SCALE, (y - CENTER[1]) * SCALE, clothDepth(x, y, side) * SCALE);

  const pts: THREE.Vector3[] = [];
  // Front half, right to left.
  for (const [x, y] of FRONT_NECK) pts.push(toWorld(x, y, 1));
  // Back half, left to right (skip duplicated shoulder points).
  const back = [...BACK_NECK].reverse();
  for (let i = 1; i < back.length - 1; i++) pts.push(toWorld(back[i][0], back[i][1], -1));

  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  return new THREE.TubeGeometry(curve, 160, 0.021, 10, true);
}
