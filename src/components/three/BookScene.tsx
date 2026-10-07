"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MAX_SPREAD } from "@/content/book";
import { makeBookTextures, type BookTextures } from "./bookTextures";
import { useDragRotation } from "./useDragRotation";

/* ---- Dimensions (world units) -------------------------------------------- */
const BW = 1.0; // cover width
const BH = 1.6; // cover height
const T = 0.3; // overall thickness
const BOARD = 0.035; // cover board thickness
const SPINE_W = 0.06;
const COVER_W = BW - 0.03;
const HINGE_X = -BW / 2 + 0.03; // where the boards begin, right of the spine
const LEAF_HINGE_X = HINGE_X + 0.012;
const PAGE_W = BW - 0.07;
const PAGE_H = BH - 0.07;
const LEAF_T = 0.004;
const LEAF_GAP = 0.005;
const LEAVES = 4;
const BLOCK_T = T - 2 * BOARD - LEAVES * LEAF_GAP - 0.012;
const Z_BACK_TOP = -T / 2 + BOARD; // top face of the back board
const Z_BLOCK_TOP = Z_BACK_TOP + BLOCK_T;
const Z_COVER_CLOSED = T / 2 - BOARD / 2;
const Z_COVER_OPEN = -T / 2 + BOARD / 2;

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

type Props = {
  spread: number;
  onSpread: (next: number) => void;
  reduced: boolean;
};

export default function BookScene({ spread, onSpread, reduced }: Props) {
  const cover = useTexture("/textures/book-cover.jpg");
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<BookTextures | null>(null);

  useEffect(() => {
    let live = true;
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    cover.colorSpace = THREE.SRGBColorSpace;
    cover.anisotropy = aniso;
    makeBookTextures(aniso).then((t) => {
      if (live) setTex(t);
      else t.all.forEach((x) => x.dispose());
    });
    return () => {
      live = false;
    };
  }, [gl, cover]);

  useEffect(() => () => tex?.all.forEach((t) => t.dispose()), [tex]);

  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);
  const coverPivot = useRef<THREE.Group>(null);
  const spineMesh = useRef<THREE.Mesh>(null);
  const leafPivots = useRef<(THREE.Group | null)[]>([]);
  const anim = useRef({ c: 0, leaves: [0, 0, 0, 0] });

  useDragRotation(rig, { maxYaw: 0.55, maxPitch: 0.22, reducedMotion: reduced });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const a = anim.current;
    const speed = reduced ? 40 : 3.6;
    a.c = damp(a.c, spread >= 1 ? 1 : 0, speed * 0.85, dt);
    for (let i = 0; i < LEAVES; i++) {
      a.leaves[i] = damp(a.leaves[i], spread >= i + 2 ? 1 : 0, speed, dt);
    }
    const e = smooth(a.c);

    if (coverPivot.current) {
      coverPivot.current.rotation.y = -Math.PI * e;
      coverPivot.current.position.z = lerp(Z_COVER_CLOSED, Z_COVER_OPEN, e);
    }
    if (spineMesh.current) {
      const sz = lerp(1, 0.2, e);
      spineMesh.current.scale.z = sz;
      spineMesh.current.position.z = lerp(0, -T / 2 + (T * sz) / 2, e);
    }
    for (let i = 0; i < LEAVES; i++) {
      const g = leafPivots.current[i];
      if (!g) continue;
      const le = smooth(a.leaves[i]);
      g.rotation.y = -Math.PI * le;
      const zr = Z_BLOCK_TOP + LEAF_T / 2 + 0.001 + (LEAVES - 1 - i) * LEAF_GAP;
      const zl = Z_BACK_TOP + LEAF_T / 2 + 0.001 + i * LEAF_GAP;
      g.position.z = lerp(zr, zl, le) + Math.sin(Math.PI * le) * 0.12;
    }
    if (centre.current) {
      centre.current.position.x = 0.5 * e;
      const s = lerp(1.12, 0.9, e);
      centre.current.scale.setScalar(s);
    }
    if (tilt.current) {
      const sway = reduced ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.04 * (1 - e);
      tilt.current.rotation.set(lerp(0.1, -0.2, e), lerp(-0.55, 0, e) + sway, 0);
      tilt.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.02;
    }
  });

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#101a63", roughness: 0.6 }), []);
  const paperEdge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e4e0d5", roughness: 0.9 }), []);
  useEffect(
    () => () => {
      edgeMat.dispose();
      paperEdge.dispose();
    },
    [edgeMat, paperEdge],
  );

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // it was a drag, not a click
    e.stopPropagation();
    if (spread === 0) return onSpread(1);
    const local = (rig.current ?? e.object).worldToLocal(e.point.clone());
    // account for the centring offset / scale of the open book
    const cx = centre.current;
    const x = cx ? (local.x - cx.position.x) / cx.scale.x : local.x;
    if (x < HINGE_X) onSpread(Math.max(0, spread - 1));
    else onSpread(Math.min(MAX_SPREAD, spread + 1));
  };

  if (!tex) return null;

  return (
    <group ref={rig}>
      <group ref={tilt}>
        <group
          ref={centre}
          onClick={onClick}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          {/* Spine */}
          <mesh ref={spineMesh} position={[-BW / 2, 0, 0]}>
            <boxGeometry args={[SPINE_W, BH, T]} />
            <meshStandardMaterial attach="material-0" color="#101a63" roughness={0.6} />
            <meshStandardMaterial attach="material-1" map={tex.spine} roughness={0.55} />
            <meshStandardMaterial attach="material-2" color="#101a63" roughness={0.6} />
            <meshStandardMaterial attach="material-3" color="#101a63" roughness={0.6} />
            <meshStandardMaterial attach="material-4" color="#101a63" roughness={0.6} />
            <meshStandardMaterial attach="material-5" color="#101a63" roughness={0.6} />
          </mesh>

          {/* Back board */}
          <mesh position={[HINGE_X + COVER_W / 2, 0, -T / 2 + BOARD / 2]}>
            <boxGeometry args={[COVER_W, BH, BOARD]} />
            <primitive object={edgeMat} attach="material-0" />
            <primitive object={edgeMat} attach="material-1" />
            <primitive object={edgeMat} attach="material-2" />
            <primitive object={edgeMat} attach="material-3" />
            <primitive object={edgeMat} attach="material-4" />
            <meshStandardMaterial attach="material-5" map={tex.backCover} roughness={0.55} />
          </mesh>

          {/* Page block */}
          <mesh position={[LEAF_HINGE_X + PAGE_W / 2, 0, Z_BACK_TOP + BLOCK_T / 2]}>
            <boxGeometry args={[PAGE_W, PAGE_H, BLOCK_T]} />
            <meshStandardMaterial attach="material-0" map={tex.edgeV} roughness={0.9} />
            <primitive object={paperEdge} attach="material-1" />
            <meshStandardMaterial attach="material-2" map={tex.edgeH} roughness={0.9} />
            <meshStandardMaterial attach="material-3" map={tex.edgeH} roughness={0.9} />
            <meshStandardMaterial attach="material-4" map={tex.about} roughness={0.9} />
            <primitive object={paperEdge} attach="material-5" />
          </mesh>

          {/* Turning leaves */}
          {tex.leaves.map((leaf, i) => (
            <group
              key={i}
              ref={(g) => {
                leafPivots.current[i] = g;
              }}
              position={[LEAF_HINGE_X, 0, Z_BLOCK_TOP + LEAF_T / 2 + 0.001 + (LEAVES - 1 - i) * LEAF_GAP]}
            >
              <mesh position={[PAGE_W / 2, 0, 0]}>
                <boxGeometry args={[PAGE_W, PAGE_H, LEAF_T]} />
                <primitive object={paperEdge} attach="material-0" />
                <primitive object={paperEdge} attach="material-1" />
                <primitive object={paperEdge} attach="material-2" />
                <primitive object={paperEdge} attach="material-3" />
                <meshStandardMaterial attach="material-4" map={leaf.recto} roughness={0.88} />
                <meshStandardMaterial attach="material-5" map={leaf.verso} roughness={0.88} />
              </mesh>
            </group>
          ))}

          {/* Front cover, hinged at the spine */}
          <group ref={coverPivot} position={[HINGE_X, 0, Z_COVER_CLOSED]}>
            <mesh position={[COVER_W / 2, 0, 0]}>
              <boxGeometry args={[COVER_W, BH, BOARD]} />
              <primitive object={edgeMat} attach="material-0" />
              <primitive object={edgeMat} attach="material-1" />
              <primitive object={edgeMat} attach="material-2" />
              <primitive object={edgeMat} attach="material-3" />
              <meshStandardMaterial attach="material-4" map={cover} roughness={0.5} />
              <meshStandardMaterial attach="material-5" map={tex.insideCover} roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
