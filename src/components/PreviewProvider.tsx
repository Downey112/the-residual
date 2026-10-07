"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import PreviewModal from "./ui/PreviewModal";

type Ctx = { open: (id: string) => void; close: () => void; current: string | null };
const PreviewCtx = createContext<Ctx | null>(null);

export function usePreview() {
  const c = useContext(PreviewCtx);
  if (!c) throw new Error("usePreview must be used inside PreviewProvider");
  return c;
}

export default function PreviewProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null);
  const open = useCallback((id: string) => setCurrent(id), []);
  const close = useCallback(() => setCurrent(null), []);
  const value = useMemo(() => ({ open, close, current }), [open, close, current]);
  return (
    <PreviewCtx.Provider value={value}>
      {children}
      <PreviewModal current={current} onChange={setCurrent} />
    </PreviewCtx.Provider>
  );
}
