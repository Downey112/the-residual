"use client";
import { useEffect, useRef } from "react";

/** 2D canvas: a point cloud around a fitted line and one amber residual. Pauses off-screen. */
export default function ScatterField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pts = Array.from({ length: 70 }, () => {
      const t = rnd();
      return { t, n: (rnd() - 0.5) * 0.16, r: 1.2 + rnd() * 1.6, ph: rnd() * 6.28 };
    });
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      ctx.clearRect(0, 0, w, h);
      const x0 = w * (w > 900 ? 0.48 : 0.06), x1 = w * 0.94, y0 = h * 0.8, y1 = h * 0.2;
      const px = (t: number) => x0 + (x1 - x0) * t + mouse.x * 14 * t;
      const py = (t: number, n = 0) => y0 + (y1 - y0) * t + n * h + mouse.y * 10;
      ctx.strokeStyle = "rgba(250,250,250,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(1), py(1)); ctx.stroke();
      for (const p of pts) {
        const wob = reduced ? 0 : Math.sin(time / 1400 + p.ph) * 0.004;
        const x = px(p.t), y = py(p.t, p.n + wob);
        ctx.fillStyle = "rgba(250,250,250,.55)";
        ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill();
      }
      // the residual
      const t = 0.64, ex = px(t), eyLine = py(t), ey = eyLine + h * 0.3;
      const pulse = reduced ? 0 : (Math.sin(time / 700) + 1) * 0.5;
      ctx.strokeStyle = "rgba(245,158,11,.7)"; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(ex, eyLine); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(245,158,11,.18)";
      ctx.beginPath(); ctx.arc(ex, ey, 10 + pulse * 12, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 6.283); ctx.fill();
      ctx.font = "italic 24px Georgia, serif"; ctx.fillText("e", ex + 16, (eyLine + ey) / 2);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting)); io.observe(cv);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", onMove); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
