"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import ViewerStage from "./ViewerStage";
import TeeScene from "./TeeScene";

type Props = {
  spin: boolean;
  snap: { angle: number; nonce: number } | null;
  onInteract: () => void;
};

export default function TeeStage({ spin, snap, onInteract }: Props) {
  const reduced = useReducedMotion() ?? false;
  return (
    <ViewerStage
      className="h-full w-full cursor-grab active:cursor-grabbing"
      fit={{ width: 3.3, height: 3.0 }}
      shadowY={-1.5}
      label="Interactive 3D model of The Residual tee. Drag to rotate."
      fallback={
        <Image
          src="/products/tee-back.webp"
          alt="The Residual tee, back view"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-6"
        />
      }
    >
      <TeeScene spin={spin} snap={snap} onInteract={onInteract} reduced={reduced} />
    </ViewerStage>
  );
}
