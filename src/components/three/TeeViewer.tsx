"use client";
import dynamic from "next/dynamic";

const TeeStage = dynamic(() => import("./TeeStage"), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

export function ViewerSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <span className="label animate-pulse text-zinc-600">Loading model</span>
    </div>
  );
}

export default TeeStage;
