"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { FIG1, FIG2 } from "@/content/book";

type Row = { label: string; value: number; base?: boolean };

function Bars({ rows, unit, max }: { rows: Row[]; unit: string; max: number }) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState<number | null>(null);
  return (
    <ul className="space-y-4" aria-label="Bar chart">
      {rows.map((r, i) => {
        const w = (r.value / max) * 100;
        const active = hot === i;
        return (
          <li
            key={r.label}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(i)}
            onBlur={() => setHot(null)}
            tabIndex={0}
            className="outline-offset-4"
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
              <span className={active ? "text-white" : "text-zinc-300"}>{r.label}</span>
              <span className="font-mono tabular-nums text-accent">
                {r.value}
                {unit}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-sm bg-white/[0.06]">
              <motion.div
                className={`h-full rounded-sm ${r.base ? "bg-zinc-500" : "bg-accent"}`}
                initial={{ width: reduced ? `${w}%` : 0 }}
                animate={{ width: `${w}%`, opacity: hot === null || active ? 1 : 0.45 }}
                transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Fig1() {
  return <Bars rows={FIG1.rows} unit="%" max={45} />;
}

export function Fig2() {
  return <Bars rows={FIG2.rows} unit="%" max={100} />;
}

/* ---- Fig 3: the residual, interactive ----------------------------------- */

const PTS: [number, number][] = [
  [1, 2.3], [2, 3.4], [3, 3.9], [4, 5.4], [5, 5.8], [6, 7.3], [7, 7.6], [8, 9.2], [9, 9.4],
];
const OUT: [number, number] = [6.2, 2.4];

function ols(pts: [number, number][]) {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0,
    sxx = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
  }
  const b = sxy / sxx;
  return { a: my - b * mx, b };
}

export function Fig3() {
  const W = 560,
    H = 340,
    pad = 36;
  const [withOutlier, setWithOutlier] = useState(false);
  const [hot, setHot] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const all = useMemo(() => [...PTS, OUT] as [number, number][], []);
  const fit = useMemo(() => ols(withOutlier ? all : PTS), [withOutlier, all]);
  // The line shown on the shirt is fit to the regular points; the toggle shows the outlier's pull.
  const sx = (x: number) => pad + ((x - 0.5) / 9) * (W - pad * 2);
  const sy = (y: number) => H - pad - (y / 11) * (H - pad * 2);
  const yhat = (x: number) => fit.a + fit.b * x;
  const e = (p: [number, number]) => p[1] - yhat(p[0]);
  const ox = OUT[0];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Scatter plot with a fitted line and one point far from it, marked e">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="rgb(255 255 255 / .25)" />
        <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="rgb(255 255 255 / .25)" />
        <motion.line
          initial={false}
          animate={{ x1: sx(0.5), y1: sy(yhat(0.5)), x2: sx(9.5), y2: sy(yhat(9.5)) }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          stroke="#fafafa"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {PTS.map((p, i) => (
          <g key={i} onPointerEnter={() => setHot(i)} onPointerLeave={() => setHot(null)}>
            <motion.line
              initial={false}
              animate={{ x1: sx(p[0]), x2: sx(p[0]), y1: sy(p[1]), y2: sy(yhat(p[0])) }}
              stroke="rgb(255 255 255 / .28)"
              strokeDasharray="3 3"
              transition={{ duration: reduced ? 0 : 0.7 }}
            />
            <circle cx={sx(p[0])} cy={sy(p[1])} r={hot === i ? 7 : 5} fill="#fafafa" />
            <circle cx={sx(p[0])} cy={sy(p[1])} r={16} fill="transparent" />
          </g>
        ))}
        {/* the residual */}
        <g onPointerEnter={() => setHot(99)} onPointerLeave={() => setHot(null)}>
          <motion.line
            initial={false}
            animate={{ y2: sy(yhat(ox)) }}
            x1={sx(ox)}
            x2={sx(ox)}
            y1={sy(OUT[1])}
            stroke="#f59e0b"
            strokeWidth={2}
            transition={{ duration: reduced ? 0 : 0.7 }}
          />
          <circle cx={sx(ox)} cy={sy(OUT[1])} r={hot === 99 ? 9 : 7} fill="#f59e0b" />
          <circle cx={sx(ox)} cy={sy(OUT[1])} r={18} fill="transparent" />
          <text x={sx(ox) + 14} y={(sy(OUT[1]) + sy(yhat(ox))) / 2} fill="#f59e0b" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="24">
            e
          </text>
        </g>
      </svg>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-zinc-400" aria-live="polite">
          {hot === null
            ? "Hover a point to read its residual."
            : hot === 99
              ? `e = ${e(OUT).toFixed(2)}  (observed ${OUT[1]}, fitted ${yhat(ox).toFixed(2)})`
              : `e = ${e(PTS[hot]).toFixed(2)}`}
        </p>
        <button
          type="button"
          onClick={() => setWithOutlier((v) => !v)}
          className="label rounded-full border border-white/15 px-4 py-2 text-zinc-200 transition hover:border-accent hover:text-accent"
          aria-pressed={withOutlier}
        >
          {withOutlier ? "Remove e from the fit" : "Refit including e"}
        </button>
      </div>
    </div>
  );
}
