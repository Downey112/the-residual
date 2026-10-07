import * as THREE from "three";
import { BOOK, CHAPTERS, EPILOGUE, type Chapter } from "@/content/book";

/**
 * Canvas-drawn textures for the 3D book. Everything here is drawn from the real
 * manuscript content in src/content/book.ts, so the pages always match the book.
 */

const NAVY = "#16227A";
const NAVY_DEEP = "#101a63";
const YELLOW = "#FFD23F";
const PAPER = "#ECE9E1";
const INK = "#15151A";
const SOFT = "#5b6068";

const PW = 780;
const PH = 1280;

export type BookTextures = {
  insideCover: THREE.CanvasTexture;
  backCover: THREE.CanvasTexture;
  spine: THREE.CanvasTexture;
  edgeV: THREE.CanvasTexture; // page-edge stripes on the fore edge
  edgeH: THREE.CanvasTexture; // page-edge stripes on top and bottom
  about: THREE.CanvasTexture;
  /** recto = right-hand face, verso = left-hand face once turned */
  leaves: { recto: THREE.CanvasTexture; verso: THREE.CanvasTexture }[];
  all: THREE.Texture[];
};

function make(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas, ctx };
}

function tex(canvas: HTMLCanvasElement, aniso: number, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

async function loadFonts() {
  await Promise.all([
    document.fonts.load('400 40px "Young Serif"', "The Residual"),
    document.fonts.load('400 28px "Literata"', "Aa"),
    document.fonts.load('italic 400 24px "Literata"', "Aa"),
    document.fonts.load('400 18px "Space Mono"', "Aa"),
  ]);
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  align: CanvasTextAlign = "left",
): number {
  ctx.textAlign = align;
  const words = text.split(/\s+/);
  let line = "";
  let cy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      line = w;
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineH;
  }
  return cy;
}

function paper(ctx: CanvasRenderingContext2D, gutter: "left" | "right") {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, PW, PH);
  // faint paper grain
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(60,50,30,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * PW, Math.random() * PH, 2, 2);
  }
  // shadow toward the gutter
  const g =
    gutter === "left" ? ctx.createLinearGradient(0, 0, 130, 0) : ctx.createLinearGradient(PW, 0, PW - 130, 0);
  g.addColorStop(0, "rgba(40,30,15,0.26)");
  g.addColorStop(1, "rgba(40,30,15,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PW, PH);
}

function navyGrid(ctx: CanvasRenderingContext2D, w: number, h: number, step = 40) {
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(238,241,255,0.09)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
}

/** The signature plot: fitted line, scatter, and one isolated residual. */
function plot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  ink: string,
  accent: string,
  hollow = true,
) {
  const sx = w / 340;
  const X = (u: number) => x + (u - 30) * sx;
  const Y = (v: number) => y + (v - 16) * sx;
  const pts: [number, number][] = [
    [50, 327], [70, 296], [88, 297], [105, 268], [122, 265], [140, 232], [158, 231], [175, 200], [192, 205],
    [210, 177], [228, 176], [245, 144], [262, 141], [280, 111], [298, 110], [315, 86], [333, 84], [350, 53],
  ];
  ctx.lineCap = "round";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(X(40), Y(330));
  ctx.lineTo(X(360), Y(50));
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(X(215), Y(40));
  ctx.lineTo(X(215), Y(177));
  ctx.stroke();
  ctx.setLineDash([]);
  for (const [px, py] of pts) {
    ctx.beginPath();
    ctx.arc(X(px), Y(py), 4.2 * sx, 0, Math.PI * 2);
    if (hollow) {
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else {
      ctx.fillStyle = ink;
      ctx.fill();
    }
  }
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(X(215), Y(30), 7 * sx, 0, Math.PI * 2);
  ctx.fill();
}

function chapterFace(ch: Chapter, gutter: "left" | "right", aniso: number) {
  const { canvas, ctx } = make(PW, PH);
  paper(ctx, gutter);
  const m = 78;
  const innerL = gutter === "left" ? m + 24 : m;
  const w = PW - m * 2 - 24;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY;
  ctx.font = '400 20px "Space Mono"';
  ctx.textAlign = "left";
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px";
  ctx.fillText(ch.label.toUpperCase(), innerL, 130);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  ctx.fillStyle = INK;
  ctx.font = '400 58px "Young Serif"';
  let y = wrap(ctx, ch.title, innerL, 215, w, 64);
  y += 14;
  ctx.fillStyle = YELLOW;
  ctx.fillRect(innerL, y - 22, 54, 5);
  y += 36;

  ctx.fillStyle = "#23232a";
  ctx.font = '400 29px "Literata"';
  y = wrap(ctx, ch.excerpt, innerL, y, w, 46);

  // gist, set apart at the foot of the page
  ctx.fillStyle = SOFT;
  ctx.font = 'italic 400 22px "Literata"';
  const lines = Math.ceil(ctx.measureText(ch.gist).width / w) + 1;
  wrap(ctx, ch.gist, innerL, PH - 90 - lines * 30, w, 32);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerL, PH - 120 - lines * 30);
  ctx.lineTo(innerL + w, PH - 120 - lines * 30);
  ctx.stroke();
  return tex(canvas, aniso);
}

function contentsFace(gutter: "left" | "right", aniso: number) {
  const { canvas, ctx } = make(PW, PH);
  paper(ctx, gutter);
  const m = 78;
  const innerL = gutter === "left" ? m + 24 : m;
  const w = PW - m * 2 - 24;
  ctx.fillStyle = NAVY;
  ctx.font = '400 20px "Space Mono"';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px";
  ctx.fillText("CONTENTS", innerL, 130);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.fillStyle = INK;
  ctx.font = '400 58px "Young Serif"';
  ctx.fillText("The Residual", innerL, 215);

  let y = 320;
  const rows = [...CHAPTERS, EPILOGUE];
  for (const ch of rows) {
    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(innerL, y - 40);
    ctx.lineTo(innerL + w, y - 40);
    ctx.stroke();
    ctx.fillStyle = NAVY;
    ctx.font = '400 20px "Space Mono"';
    ctx.fillText(ch.id === "epilogue" ? "EP" : ch.label.replace("Chapter ", ""), innerL, y);
    ctx.fillStyle = INK;
    ctx.font = '400 31px "Young Serif"';
    ctx.fillText(ch.title, innerL + 62, y + 2);
    y += 90;
  }
  ctx.fillStyle = SOFT;
  ctx.font = 'italic 400 22px "Literata"';
  wrap(ctx, "Click the right-hand page to turn.", innerL, PH - 100, w, 30);
  return tex(canvas, aniso);
}

function aboutFace(gutter: "left" | "right", aniso: number) {
  const { canvas, ctx } = make(PW, PH);
  paper(ctx, gutter);
  const m = 78;
  const innerL = gutter === "left" ? m + 24 : m;
  const w = PW - m * 2 - 24;
  ctx.fillStyle = NAVY;
  ctx.font = '400 20px "Space Mono"';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px";
  ctx.fillText("ABOUT THIS BOOK", innerL, 130);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.fillStyle = INK;
  ctx.font = '400 40px "Young Serif"';
  let y = wrap(ctx, "You were trained to fit the line.", innerL, 205, w, 48);
  ctx.fillStyle = "#23232a";
  ctx.font = '400 26px "Literata"';
  y = wrap(ctx, BOOK.blurb.replace("You were trained to fit the line. ", ""), innerL, y + 20, w, 42);
  plot(ctx, innerL + 30, y + 30, w - 60, "#23232a", NAVY);
  ctx.fillStyle = SOFT;
  ctx.font = '400 18px "Space Mono"';
  ctx.fillText(`${BOOK.author.toUpperCase()}  ·  ${BOOK.edition.toUpperCase()}`, innerL, PH - 96);
  ctx.fillText(`${BOOK.format}  ·  ${BOOK.readingTime.toUpperCase()}`, innerL, PH - 68);
  return tex(canvas, aniso);
}

function insideCover(aniso: number) {
  const { canvas, ctx } = make(PW, PH);
  navyGrid(ctx, PW, PH);
  plot(ctx, 90, 330, PW - 180, "#EEF1FF", YELLOW);
  ctx.fillStyle = "#EEF1FF";
  ctx.font = '400 54px "Young Serif"';
  ctx.textAlign = "left";
  ctx.fillText("The Residual", 90, 200);
  ctx.font = '400 20px "Space Mono"';
  ctx.globalAlpha = 0.8;
  wrap(ctx, "A FIELD GUIDE FOR STATISTICS GRADUATES IN MALAYSIA", 90, 245, PW - 180, 30);
  ctx.globalAlpha = 1;
  ctx.font = 'italic 400 24px "Literata"';
  ctx.globalAlpha = 0.85;
  ctx.fillText("Click the right-hand page to turn.", 90, PH - 90);
  ctx.globalAlpha = 1;
  return tex(canvas, aniso);
}

function backCover(aniso: number) {
  const { canvas, ctx } = make(PW, PH);
  navyGrid(ctx, PW, PH);
  ctx.fillStyle = "#EEF1FF";
  ctx.font = '400 50px "Young Serif"';
  const y = wrap(ctx, "You were trained to fit the line.", 90, 240, PW - 180, 60);
  ctx.font = '400 26px "Literata"';
  wrap(ctx, "This book is about the part the line leaves out.", 90, y + 20, PW - 180, 40);
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(110, PH - 130, 9, 0, Math.PI * 2);
  ctx.fill();
  return tex(canvas, aniso);
}

function spineTex(aniso: number) {
  // Face is T (thickness) wide by BH tall; text reads top to bottom.
  const w = 192;
  const h = 1024;
  const { canvas, ctx } = make(w, h);
  ctx.fillStyle = NAVY_DEEP;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = "#EEF1FF";
  ctx.font = '400 66px "Young Serif"';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("The Residual", 20, 0);
  ctx.font = '400 22px "Space Mono"';
  ctx.globalAlpha = 0.8;
  ctx.fillText("LUQMAN", -h / 2 + 110, 0);
  ctx.restore();
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(w / 2, 90, 12, 0, Math.PI * 2);
  ctx.fill();
  return tex(canvas, aniso);
}

function edgeTex(aniso: number, vertical: boolean) {
  const w = vertical ? 256 : 512;
  const h = vertical ? 512 : 256;
  const { canvas, ctx } = make(w, h);
  ctx.fillStyle = "#e4e0d5";
  ctx.fillRect(0, 0, w, h);
  const n = 64;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * (vertical ? w : h);
    ctx.fillStyle = `rgba(80,70,50,${0.1 + Math.random() * 0.18})`;
    if (vertical) ctx.fillRect(t, 0, 1.2, h);
    else ctx.fillRect(0, t, w, 1.2);
  }
  return tex(canvas, aniso);
}

export async function makeBookTextures(aniso = 8): Promise<BookTextures> {
  await loadFonts();
  const contents = (g: "left" | "right") => contentsFace(g, aniso);
  const ch = (id: string, g: "left" | "right") => {
    const c = id === "epilogue" ? EPILOGUE : CHAPTERS.find((x) => x.id === id)!;
    return chapterFace(c, g, aniso);
  };
  const leaves = [
    { recto: contents("left"), verso: ch("ch1", "right") },
    { recto: ch("ch2", "left"), verso: ch("ch3", "right") },
    { recto: ch("ch4", "left"), verso: ch("ch5", "right") },
    { recto: ch("ch6", "left"), verso: ch("epilogue", "right") },
  ];
  const t: BookTextures = {
    insideCover: insideCover(aniso),
    backCover: backCover(aniso),
    spine: spineTex(aniso),
    edgeV: edgeTex(aniso, true),
    edgeH: edgeTex(aniso, false),
    about: aboutFace("left", aniso),
    leaves,
    all: [],
  };
  t.all = [t.insideCover, t.backCover, t.spine, t.edgeV, t.edgeH, t.about, ...leaves.flatMap((l) => [l.recto, l.verso])];
  return t;
}
