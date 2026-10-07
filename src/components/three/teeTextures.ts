import * as THREE from "three";
import { PATTERN, smoothPanelPolygon, type Pt } from "./teeShape";
import { createNoise2D } from "@/lib/noise";

const TEX_W = 2560;
const TEX_H = Math.round((TEX_W * PATTERN.h) / PATTERN.w);

const FABRIC = "#1b1b21";

/** Print placement in pattern units */
const PRINT = {
  // Back: art is centred, top edge at this y, width in pattern units.
  backWidth: 29,
  backTopY: 82.5,
  // Front: small wordmark on the wearer's right chest (viewer's left).
  frontWidth: 7.6,
  frontCenter: [33.5, 79.5] as Pt,
};

export type TeeArt = { front: HTMLImageElement; back: HTMLImageElement };

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas: c, ctx };
}

/** Draw one panel's colour map: fabric, grain, seams and print, cut to the silhouette. */
export function makeTeeMap(side: "front" | "back", art: TeeArt, anisotropy = 8): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(TEX_W, TEX_H);

  // Back panel is sampled mirrored (viewed from behind).
  const px = (x: number) => (side === "front" ? x : 100 - x) * (TEX_W / PATTERN.w);
  const py = (y: number) => ((PATTERN.yMax - y) / PATTERN.h) * TEX_H;

  ctx.save();
  ctx.beginPath();
  smoothPanelPolygon(side).forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(px(x), py(y));
    else ctx.lineTo(px(x), py(y));
  });
  ctx.closePath();
  ctx.clip();

  // Base fabric
  ctx.fillStyle = FABRIC;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Fine grain
  const rnd = createNoise2D(side === "front" ? 5 : 6);
  const gw = 512;
  const gh = Math.round((gw * TEX_H) / TEX_W);
  const grain = makeCanvas(gw, gh);
  const img = grain.ctx.createImageData(gw, gh);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const n = rnd(x * 0.9, y * 0.9) * 2.5 + (Math.random() - 0.5) * 5;
      const i = (y * gw + x) * 4;
      const v = 28 + n;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v + 1.5;
      img.data[i + 3] = 255;
    }
  }
  grain.ctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 0.55;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(grain.canvas, 0, 0, TEX_W, TEX_H);
  ctx.globalAlpha = 1;

  // Stitching: hem and sleeve cuffs
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 2.2;
  ctx.setLineDash([9, 7]);
  const line = (a: Pt, b: Pt) => {
    ctx.beginPath();
    ctx.moveTo(px(a[0]), py(a[1]));
    ctx.lineTo(px(b[0]), py(b[1]));
    ctx.stroke();
  };
  line([24.8, 14.4], [75.2, 14.4]);
  // cuffs (offset inward along the sleeve)
  line([5.1, 73.4], [12.3, 59.4]);
  line([94.9, 73.4], [87.7, 59.4]);
  ctx.setLineDash([]);

  // Print
  if (side === "back") {
    const img = art.back;
    const w = (PRINT.backWidth / PATTERN.w) * TEX_W;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    ctx.drawImage(img, px(50) - w / 2, py(PRINT.backTopY), w, h);
  } else {
    const img = art.front;
    const w = (PRINT.frontWidth / PATTERN.w) * TEX_W;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    ctx.drawImage(img, px(PRINT.frontCenter[0]) - w / 2, py(PRINT.frontCenter[1]) - h / 2, w, h);
  }

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Tiling plain-weave bump map. */
export function makeWeaveBump(anisotropy = 4): THREE.CanvasTexture {
  const S = 128;
  const { canvas, ctx } = makeCanvas(S, S);
  const img = ctx.createImageData(S, S);
  const rnd = createNoise2D(21);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const warp = Math.sin((x / S) * Math.PI * 2 * 16);
      const weft = Math.sin((y / S) * Math.PI * 2 * 16);
      const over = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? warp : weft;
      const v = 128 + over * 46 + rnd(x * 0.5, y * 0.5) * 14;
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(34, 30);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}
