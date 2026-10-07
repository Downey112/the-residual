"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import ViewerStage from "./ViewerStage";
import BookScene from "./BookScene";

type Props = {
  spread: number;
  onSpread: (next: number) => void;
};

export default function BookStage({ spread, onSpread }: Props) {
  const reduced = useReducedMotion() ?? false;
  return (
    <ViewerStage
      className="h-full w-full"
      fit={{ width: 2.5, height: 2.55 }}
      shadowY={-1.0}
      label="Interactive 3D model of The Residual book. Click to open and turn pages."
      fallback={
        <Image
          src="/products/book-cover.webp"
          alt="The Residual book cover"
          fill
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="object-contain p-10"
        />
      }
    >
      <BookScene spread={spread} onSpread={onSpread} reduced={reduced} />
    </ViewerStage>
  );
}
