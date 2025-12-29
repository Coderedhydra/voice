'use client';

import React, { useRef, useEffect, useState } from 'react';

// Animation states mapping
const animationStates = {
  idle_soft: { offsetY: 0, rotation: 0, scale: 1 },
  lean_forward: { offsetY: -20, rotation: -5, scale: 1 },
  sway_hips: { offsetY: 0, rotation: 0, scale: 1 },
  teasing_pose: { offsetY: 10, rotation: 5, scale: 1 },
  close_intimate_pose: { offsetY: -10, rotation: -8, scale: 1.05 },
  slow_breathing: { offsetY: 0, rotation: 0, scale: 1 },
  shy_cover: { offsetY: 10, rotation: -10, scale: 0.95 },
};

// Facial expression colors
const expressionColors = {
  smile_seductive: { face: '#ffb3d9', blush: '#ff66b3', eyes: '#ff80cc' },
  blush_light: { face: '#ffcccc', blush: '#ff9999', eyes: '#ff99cc' },
  blush_heavy: { face: '#ff6666', blush: '#ff3333', eyes: '#ff66b3' },
  half_lidded_eyes: { face: '#ffb3d9', blush: '#ff80cc', eyes: '#ff99cc' },
  soft_moan: { face: '#ff99cc', blush: '#ff66b3', eyes: '#ff80cc' },
  look_away: { face: '#ffb3d9', blush: '#ff99cc', eyes: '#ffb3d9' },
};

// 2D Character Renderer Component
function Character2D({ animation, expression, intensity }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  const [currentState, setCurrentState] = useState({
    animation: 'idle_soft',
    expression: 'smile_seductive',
    intensity: 0.5,
  });

  useEffect(() => {
    if (animation) {
      setCurrentState({
        animation: animation.body || 'idle_soft',
        expression: animation.face || expression || 'smile_seductive',
        intensity: animation.intensity || intensity || 0.5,
      });
    }
  }, [animation, expression, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const drawCharacter = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const animState = animationStates[currentState.animation] || animationStates.idle_soft;
      const exprColors = expressionColors[currentState.expression] || expressionColors.smile_seductive;
      
      // Apply transformations
      ctx.save();
      ctx.translate(centerX, centerY + animState.offsetY);
      ctx.rotate((animState.rotation * Math.PI) / 180);
      ctx.scale(animState.scale * (0.9 + currentState.intensity * 0.2), animState.scale * (0.9 + currentState.intensity * 0.2));

      // Breathing animation
      const breathAmount = currentState.animation === 'slow_breathing' ? 0.15 : 0.08;
      const breathSpeed = currentState.animation === 'slow_breathing' ? 0.8 : 1.5;
      const breathScale = 1 + Math.sin(timeRef.current * breathSpeed) * breathAmount;

      // Body (dress/torso)
      ctx.fillStyle = exprColors.face;
      ctx.beginPath();
      ctx.ellipse(0, 40, 80, 120 * breathScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blush effect
      if (currentState.expression.includes('blush')) {
        const blushIntensity = currentState.expression === 'blush_heavy' ? 0.8 : 0.5;
        ctx.fillStyle = `rgba(255, 102, 179, ${blushIntensity * currentState.intensity})`;
        ctx.beginPath();
        ctx.ellipse(-30, 20, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(30, 20, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      ctx.fillStyle = '#ffe6f2';
      ctx.beginPath();
      ctx.arc(0, -80, 60, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#ff66b3';
      ctx.beginPath();
      ctx.arc(0, -100, 65, 0, Math.PI * 2);
      ctx.fill();
      // Hair bangs
      ctx.beginPath();
      ctx.arc(-20, -85, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(20, -85, 15, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeY = currentState.expression === 'half_lidded_eyes' ? -75 : -78;
      const eyeSize = currentState.expression === 'half_lidded_eyes' ? 8 : 12;
      
      ctx.fillStyle = '#333';
      // Left eye
      ctx.beginPath();
      ctx.arc(-20, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.arc(20, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Eye sparkle
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-18, eyeY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(22, eyeY - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mouth (smile)
      ctx.strokeStyle = exprColors.face;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (currentState.expression === 'soft_moan') {
        ctx.arc(0, -65, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(0, -65, 15, 0, Math.PI);
        ctx.stroke();
      }

      // Arms
      ctx.fillStyle = '#ffe6f2';
      // Left arm
      ctx.beginPath();
      ctx.ellipse(-70, 30, 15, 50, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.ellipse(70, 30, 15, 50, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = exprColors.face;
      // Left leg
      ctx.beginPath();
      ctx.ellipse(-25, 140, 18, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right leg
      ctx.beginPath();
      ctx.ellipse(25, 140, 18, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sway animation
      if (currentState.animation === 'sway_hips') {
        ctx.translate(Math.sin(timeRef.current * 1.2) * 10, 0);
        ctx.rotate(Math.sin(timeRef.current * 1.2) * 0.1);
      }

      ctx.restore();

      // Glow effect based on intensity
      if (currentState.intensity > 0.5) {
        ctx.shadowBlur = 30 * currentState.intensity;
        ctx.shadowColor = exprColors.blush;
      }
    };

    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      drawCharacter();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial draw
    drawCharacter();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentState]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={600}
      className="w-full h-full"
      style={{ imageRendering: 'high-quality' }}
    />
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
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* 2D Character */}
      <div className="relative z-10">
        <Character2D
          animation={animation}
          expression={expression}
          intensity={intensity}
        />
      </div>
    </div>
  );
}
