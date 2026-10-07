"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildCollarGeometry, buildPanelGeometry } from "./teeShape";
import { makeTeeMap, makeWeaveBump } from "./teeTextures";
import { useDragRotation } from "./useDragRotation";

type Props = {
  spin: boolean;
  snap: { angle: number; nonce: number } | null;
  onInteract: () => void;
  reduced: boolean;
};

export default function TeeScene({ spin, snap, onInteract, reduced }: Props) {
  const [frontArt, backArt] = useTexture(["/textures/tee-front-art.png", "/textures/tee-back-art.png"]);
  const gl = useThree((s) => s.gl);
  const rig = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);

  const assets = useMemo(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const art = {
      front: frontArt.image as HTMLImageElement,
      back: backArt.image as HTMLImageElement,
    };
    return {
      frontGeo: buildPanelGeometry(1),
      backGeo: buildPanelGeometry(-1),
      collarGeo: buildCollarGeometry(),
      frontMap: makeTeeMap("front", art, aniso),
      backMap: makeTeeMap("back", art, aniso),
      bump: makeWeaveBump(aniso),
    };
  }, [frontArt, backArt, gl]);

  useEffect(
    () => () => {
      assets.frontGeo.dispose();
      assets.backGeo.dispose();
      assets.collarGeo.dispose();
      assets.frontMap.dispose();
      assets.backMap.dispose();
      assets.bump.dispose();
    },
    [assets],
  );

  useDragRotation(rig, { autoSpin: spin, snap, onInteract, reducedMotion: reduced });

  useFrame(({ clock }) => {
    if (!bob.current || reduced) return;
    bob.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.025;
  });

  const fabric = {
    bumpMap: assets.bump,
    bumpScale: 0.9,
    roughness: 0.93,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#5a5a66"),
    alphaTest: 0.5,
    alphaToCoverage: true,
    side: THREE.DoubleSide,
  } as const;

  return (
    <group ref={rig}>
      <group ref={bob}>
        <mesh geometry={assets.frontGeo}>
          <meshPhysicalMaterial map={assets.frontMap} {...fabric} />
        </mesh>
        <mesh geometry={assets.backGeo}>
          <meshPhysicalMaterial map={assets.backMap} {...fabric} />
        </mesh>
        <mesh geometry={assets.collarGeo}>
          <meshStandardMaterial color="#121216" roughness={0.9} bumpMap={assets.bump} bumpScale={1.2} />
        </mesh>
      </group>
    </group>
  );
}
