"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/** True once the element is within `margin` of the viewport. */
function useInView<T extends HTMLElement>(margin = "160px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

/** Detects WebGL once on the client. null while unknown. */
function useWebGL(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Keeps the subject fully in frame at any container aspect ratio. */
function FitCamera({ width, height, fov }: { width: number; height: number; fov: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const distForHeight = height / 2 / tan;
    const distForWidth = width / 2 / (tan * aspect);
    camera.position.z = Math.max(distForHeight, distForWidth);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, width, height, fov]);
  return null;
}

type StageProps = {
  children: ReactNode;
  /** Size of the subject in world units, used to frame the camera */
  fit: { width: number; height: number };
  /** Y position of the soft floor shadow, in world units */
  shadowY?: number;
  fov?: number;
  className?: string;
  /** Shown when WebGL is unavailable */
  fallback: ReactNode;
  label: string;
};

export default function ViewerStage({
  children,
  fit,
  shadowY = -1.5,
  fov = 30,
  className = "",
  fallback,
  label,
}: StageProps) {
  const [wrapRef, inView] = useInView<HTMLDivElement>();
  const webgl = useWebGL();
  const [dpr, setDpr] = useState(1.5);

  return (
    <div ref={wrapRef} className={`relative ${className}`} role="img" aria-label={label}>
      {webgl === false && <div className="absolute inset-0">{fallback}</div>}
      {webgl && (
        <Canvas
          // Rendering stops while the viewer is off-screen.
          frameloop={inView ? "always" : "never"}
          dpr={dpr}
          camera={{ fov, position: [0, 0, 7], near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
          }}
          style={{ touchAction: "pan-y" }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(Math.min(2, typeof window === "undefined" ? 1.5 : window.devicePixelRatio))}
          />
          <FitCamera width={fit.width} height={fit.height} fov={fov} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 5, 6]} intensity={1.5} />
          <pointLight position={[-4, 1.5, -3]} color="#f59e0b" intensity={14} distance={12} />
          <Suspense fallback={null}>
            <Environment resolution={256} frames={1}>
              <Lightformer form="rect" intensity={2.4} position={[0, 4, 5]} scale={[9, 3, 1]} color="#ffffff" />
              <Lightformer form="rect" intensity={1.3} position={[-5, 1, 3]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#ffe3bd" />
              <Lightformer form="rect" intensity={0.9} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[5, 4, 1]} color="#cfd8ff" />
            </Environment>
            {children}
            <ContactShadows position={[0, shadowY, 0]} opacity={0.55} scale={9} blur={2.8} far={3.2} resolution={256} frames={Infinity} color="#000000" />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
