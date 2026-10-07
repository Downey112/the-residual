"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Options = {
  /** Slow idle rotation when the user is not interacting */
  autoSpin?: boolean;
  /** Seconds of inactivity before auto spin resumes */
  idleDelay?: number;
  /** Limit yaw to +-maxYaw radians and spring back (for the book). Omit for free rotation. */
  maxYaw?: number;
  maxPitch?: number;
  /** Ask the model to turn to a facing. Change `nonce` to trigger. */
  snap?: { angle: number; nonce: number } | null;
  onInteract?: () => void;
  reducedMotion?: boolean;
};

/**
 * Pointer drag rotation with inertia, written directly against the canvas element
 * so it never fights with click handling (clicks on meshes still arrive via R3F).
 */
export function useDragRotation(group: RefObject<THREE.Group | null>, opts: Options) {
  const { gl } = useThree();
  const o = useRef(opts);
  o.current = opts;

  const s = useRef({
    yaw: 0,
    pitch: 0,
    vel: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    lastInteract: -1e9,
    snapTarget: null as number | null,
    snapNonce: -1,
  });

  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;

    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = performance.now();
      st.vel = 0;
      st.snapTarget = null;
      st.lastInteract = performance.now();
      el.setPointerCapture?.(e.pointerId);
      o.current.onInteract?.();
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const now = performance.now();
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      const dt = Math.max(0.004, (now - st.lastT) / 1000);
      const yawDelta = dx * 0.0085;
      st.yaw += yawDelta;
      st.vel = THREE.MathUtils.clamp(yawDelta / dt, -9, 9);
      const mp = o.current.maxPitch ?? 0.35;
      st.pitch = THREE.MathUtils.clamp(st.pitch + dy * 0.003, -mp, mp);
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = now;
      st.lastInteract = now;
    };
    const up = (e: PointerEvent) => {
      st.dragging = false;
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const st = s.current;
    const op = o.current;
    const dt = Math.min(delta, 0.05);

    // New snap request?
    if (op.snap && op.snap.nonce !== st.snapNonce) {
      st.snapNonce = op.snap.nonce;
      st.snapTarget = op.snap.angle;
      st.vel = 0;
    }

    if (!st.dragging) {
      if (op.maxYaw !== undefined) {
        // Limited mode: ease back to centre.
        st.yaw += st.vel * dt;
        st.vel *= Math.exp(-6 * dt);
        st.yaw = THREE.MathUtils.clamp(st.yaw, -op.maxYaw, op.maxYaw);
        st.yaw = THREE.MathUtils.damp(st.yaw, 0, 1.6, dt);
      } else if (st.snapTarget !== null) {
        const k = Math.round((st.yaw - st.snapTarget) / (Math.PI * 2));
        const desired = st.snapTarget + k * Math.PI * 2;
        st.yaw = THREE.MathUtils.damp(st.yaw, desired, op.reducedMotion ? 30 : 5, dt);
        if (Math.abs(st.yaw - desired) < 0.002) {
          st.yaw = desired;
          st.snapTarget = null;
        }
      } else if (Math.abs(st.vel) > 0.01) {
        st.yaw += st.vel * dt;
        st.vel *= Math.exp(-3.4 * dt);
      } else if (
        op.autoSpin &&
        !op.reducedMotion &&
        performance.now() - st.lastInteract > (op.idleDelay ?? 2200)
      ) {
        st.yaw += 0.32 * dt;
      }
      st.pitch = THREE.MathUtils.damp(st.pitch, 0, 2.2, dt);
    } else if (op.maxYaw !== undefined) {
      st.yaw = THREE.MathUtils.clamp(st.yaw, -op.maxYaw * 1.3, op.maxYaw * 1.3);
    }

    g.rotation.set(st.pitch, st.yaw, 0);
  });
}
