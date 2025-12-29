'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// Animation states mapping
const animationStates = {
  idle_soft: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  lean_forward: { position: [0, -0.2, 0.3], rotation: [-0.1, 0, 0], scale: 1 },
  sway_hips: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  teasing_pose: { position: [0, 0.1, 0], rotation: [0, 0.2, 0], scale: 1 },
  close_intimate_pose: { position: [0, -0.1, 0.5], rotation: [-0.15, 0, 0], scale: 1.05 },
  slow_breathing: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  shy_cover: { position: [0, 0.1, -0.2], rotation: [0, -0.3, 0], scale: 0.95 },
};

// Facial expression colors/materials
const expressionMaterials = {
  smile_seductive: { color: '#ffb3d9', emissive: '#ff66b3' },
  blush_light: { color: '#ffcccc', emissive: '#ff9999' },
  blush_heavy: { color: '#ff6666', emissive: '#ff3333' },
  half_lidded_eyes: { color: '#ffb3d9', emissive: '#ff80cc' },
  soft_moan: { color: '#ff99cc', emissive: '#ff66b3' },
  look_away: { color: '#ffb3d9', emissive: '#ff99cc' },
};

// Character component - must be inside Canvas
function Character({ animation, expression, intensity }) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const faceRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle_soft');
  const [currentExpression, setCurrentExpression] = useState('smile_seductive');
  const [targetState, setTargetState] = useState(null);
  const timeRef = useRef(0);

  // Import useFrame hook - must be done inside component that's inside Canvas
  const { useFrame } = require('@react-three/fiber');

  // Update animation when props change
  useEffect(() => {
    if (animation && expression) {
      setTargetState({
        animation,
        expression,
        intensity: intensity || 0.5,
        timestamp: Date.now(),
      });
    }
  }, [animation, expression, intensity]);

  // Animate towards target state - useFrame must be called unconditionally
  useFrame((state, delta) => {
    timeRef.current += delta;

    if (targetState) {
      const animState = animationStates[targetState.animation] || animationStates.idle_soft;
      const exprMat = expressionMaterials[targetState.expression] || expressionMaterials.smile_seductive;
      
      // Smooth interpolation
      if (groupRef.current) {
        const targetPos = animState.position;
        const targetRot = animState.rotation;
        const targetScale = animState.scale * (0.9 + targetState.intensity * 0.2);

        groupRef.current.position.lerp(
          new THREE.Vector3(...targetPos),
          0.1
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          targetRot[0],
          0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRot[1],
          0.1
        );
        groupRef.current.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.1
        );
      }

      // Update expression material
      if (faceRef.current) {
        const mat = faceRef.current.material;
        mat.color.lerp(new THREE.Color(exprMat.color), 0.1);
        mat.emissive.lerp(new THREE.Color(exprMat.emissive), 0.1);
        mat.emissiveIntensity = 0.3 + targetState.intensity * 0.7;
      }

      setCurrentAnimation(targetState.animation);
      setCurrentExpression(targetState.expression);
    }

    // Breathing animation for idle_soft and slow_breathing
    if (currentAnimation === 'idle_soft' || currentAnimation === 'slow_breathing') {
      const breathSpeed = currentAnimation === 'slow_breathing' ? 0.8 : 1.5;
      const breathAmount = currentAnimation === 'slow_breathing' ? 0.15 : 0.08;
      if (bodyRef.current) {
        bodyRef.current.scale.y = 1 + Math.sin(timeRef.current * breathSpeed) * breathAmount;
      }
    }

    // Sway animation
    if (currentAnimation === 'sway_hips') {
      if (groupRef.current) {
        groupRef.current.rotation.z = Math.sin(timeRef.current * 1.2) * 0.1;
        groupRef.current.position.x = Math.sin(timeRef.current * 1.2) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial
          color="#ffb3d9"
          roughness={0.3}
          metalness={0.1}
          emissive="#ff99cc"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color="#ffe6f2"
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* Face (expression) */}
      <mesh ref={faceRef} position={[0, 0.85, 0.22]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial
          color={expressionMaterials[currentExpression].color}
          emissive={expressionMaterials[currentExpression].emissive}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.0, -0.1]}>
        <capsuleGeometry args={[0.28, 0.4, 8, 16]} />
        <meshStandardMaterial
          color="#ff66b3"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial
          color="#ffe6f2"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial
          color="#ffe6f2"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial
          color="#ffb3d9"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.15, -0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial
          color="#ffb3d9"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Scene component with drei components
function Scene({ animation, expression, intensity }) {
  const [dreiLoaded, setDreiLoaded] = useState(false);
  const [dreiComponents, setDreiComponents] = useState(null);

  useEffect(() => {
    // Load drei components only on client side
    if (typeof window !== 'undefined') {
      import('@react-three/drei').then((drei) => {
        setDreiComponents({
          OrbitControls: drei.OrbitControls,
          PerspectiveCamera: drei.PerspectiveCamera,
          Environment: drei.Environment,
        });
        setDreiLoaded(true);
      }).catch((err) => {
        console.error('Failed to load drei components:', err);
      });
    }
  }, []);

  if (!dreiLoaded || !dreiComponents) {
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ffb3d9" />
        <pointLight position={[5, 3, -5]} intensity={0.5} color="#ff99cc" />
        <Character
          animation={animation?.body || 'idle_soft'}
          expression={expression || animation?.face || 'smile_seductive'}
          intensity={intensity || animation?.intensity || 0.5}
        />
      </>
    );
  }

  const { OrbitControls, PerspectiveCamera, Environment } = dreiComponents;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 3]} fov={50} />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ffb3d9" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#ff99cc" />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Character */}
      <Character
        animation={animation?.body || 'idle_soft'}
        expression={expression || animation?.face || 'smile_seductive'}
        intensity={intensity || animation?.intensity || 0.5}
      />
    </>
  );
}

// Canvas wrapper component - completely client-side
function CanvasWrapper({ animation, expression, intensity }) {
  const [CanvasComponent, setCanvasComponent] = useState(null);

  useEffect(() => {
    // Load Canvas only on client side
    if (typeof window !== 'undefined') {
      import('@react-three/fiber').then((mod) => {
        setCanvasComponent(() => mod.Canvas);
      }).catch((err) => {
        console.error('Failed to load Canvas:', err);
      });
    }
  }, []);

  if (!CanvasComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div>Loading 3D renderer...</div>
      </div>
    );
  }

  return (
    <CanvasComponent shadows>
      <Suspense fallback={null}>
        <Scene 
          animation={animation}
          expression={expression}
          intensity={intensity}
        />
      </Suspense>
    </CanvasComponent>
  );
}

// Main renderer component
export function CharacterRenderer({ animation, expression, intensity }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading 3D renderer...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900">
      <CanvasWrapper 
        animation={animation}
        expression={expression}
        intensity={intensity}
      />
    </div>
  );
}
