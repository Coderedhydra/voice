'use client';

import React, { useRef, useEffect, useState } from 'react';

// Animation states mapping - more seductive movements
const animationStates = {
  idle_soft: { offsetY: 0, rotation: 0, scale: 1, hipSway: 0 },
  lean_forward: { offsetY: -25, rotation: -8, scale: 1, hipSway: 0 },
  sway_hips: { offsetY: 0, rotation: 0, scale: 1, hipSway: 1 },
  teasing_pose: { offsetY: 15, rotation: 8, scale: 1.05, hipSway: 0.5 },
  close_intimate_pose: { offsetY: -15, rotation: -12, scale: 1.08, hipSway: 0 },
  slow_breathing: { offsetY: 0, rotation: 0, scale: 1, hipSway: 0 },
  shy_cover: { offsetY: 15, rotation: -15, scale: 0.95, hipSway: 0 },
  seductive_dance: { offsetY: 0, rotation: 0, scale: 1.1, hipSway: 2 },
  bounce_chest: { offsetY: -10, rotation: -5, scale: 1.05, hipSway: 0.3 },
};

// Facial expression colors - more vibrant
const expressionColors = {
  smile_seductive: { face: '#ffb3d9', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066' },
  blush_light: { face: '#ffcccc', blush: '#ff9999', eyes: '#ff99cc', lips: '#ff3399' },
  blush_heavy: { face: '#ff6666', blush: '#ff3333', eyes: '#ff66b3', lips: '#ff0066' },
  half_lidded_eyes: { face: '#ffb3d9', blush: '#ff80cc', eyes: '#ff99cc', lips: '#ff3399' },
  soft_moan: { face: '#ff99cc', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066' },
  look_away: { face: '#ffb3d9', blush: '#ff99cc', eyes: '#ffb3d9', lips: '#ff3399' },
  wink_seductive: { face: '#ffb3d9', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066' },
};

// 2D Character Renderer Component - Enhanced with seductive animations
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
      
      // Hip sway animation
      const hipRotation = animState.hipSway * Math.sin(timeRef.current * 1.5) * 8;
      ctx.rotate(((animState.rotation + hipRotation) * Math.PI) / 180);
      
      const scale = animState.scale * (0.95 + currentState.intensity * 0.15);
      ctx.scale(scale, scale);

      // Breathing animation - more pronounced
      const breathAmount = currentState.animation === 'slow_breathing' ? 0.2 : 0.12;
      const breathSpeed = currentState.animation === 'slow_breathing' ? 0.6 : 1.2;
      const breathScale = 1 + Math.sin(timeRef.current * breathSpeed) * breathAmount;

      // Chest bounce for seductive animations
      const chestBounce = (currentState.animation === 'bounce_chest' || currentState.intensity > 0.7) 
        ? Math.sin(timeRef.current * 2) * 8 : 0;

      // Body (dress/torso) - more curvy
      const gradient = ctx.createLinearGradient(-80, -40, 80, 160);
      gradient.addColorStop(0, exprColors.face);
      gradient.addColorStop(0.5, exprColors.blush);
      gradient.addColorStop(1, exprColors.face);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 40 + chestBounce, 85, 130 * breathScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blush effect - more pronounced
      const blushIntensity = currentState.expression.includes('blush') 
        ? (currentState.expression === 'blush_heavy' ? 0.9 : 0.6) 
        : currentState.intensity * 0.4;
      
      if (blushIntensity > 0.2) {
        ctx.fillStyle = `rgba(255, 102, 179, ${blushIntensity})`;
        ctx.beginPath();
        ctx.ellipse(-35, 25 + chestBounce, 30, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(35, 25 + chestBounce, 30, 25, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      ctx.fillStyle = '#ffe6f2';
      ctx.beginPath();
      ctx.arc(0, -80, 65, 0, Math.PI * 2);
      ctx.fill();

      // Hair - more flowing
      ctx.fillStyle = '#ff66b3';
      ctx.beginPath();
      ctx.arc(0, -105, 70, 0, Math.PI * 2);
      ctx.fill();
      // Hair bangs - more seductive
      ctx.beginPath();
      ctx.arc(-25, -88, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(25, -88, 18, 0, Math.PI * 2);
      ctx.fill();
      // Hair side strands
      ctx.beginPath();
      ctx.ellipse(-50, -75, 12, 30, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(50, -75, 12, 30, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes - more expressive
      const eyeY = currentState.expression === 'half_lidded_eyes' ? -72 : -78;
      const eyeSize = currentState.expression === 'half_lidded_eyes' ? 6 : 14;
      const eyeOffset = currentState.expression === 'wink_seductive' ? Math.sin(timeRef.current * 3) : 0;
      
      ctx.fillStyle = '#333';
      // Left eye
      if (eyeOffset < 0.5) {
        ctx.beginPath();
        ctx.arc(-22, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Winking
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-22, eyeY, eyeSize, 0, Math.PI);
        ctx.stroke();
      }
      // Right eye
      ctx.beginPath();
      ctx.arc(22, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Eye sparkle - more prominent
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-20, eyeY - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(24, eyeY - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eyelashes - seductive
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-22 + i * 3, eyeY - eyeSize);
        ctx.lineTo(-22 + i * 3, eyeY - eyeSize - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22 + i * 3, eyeY - eyeSize);
        ctx.lineTo(22 + i * 3, eyeY - eyeSize - 5);
        ctx.stroke();
      }

      // Mouth - more seductive
      ctx.fillStyle = exprColors.lips;
      if (currentState.expression === 'soft_moan') {
        // Open mouth
        ctx.beginPath();
        ctx.ellipse(0, -62, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Seductive smile
        ctx.strokeStyle = exprColors.lips;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -65, 18, 0.2, Math.PI - 0.2);
        ctx.stroke();
        // Lip gloss effect
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.beginPath();
        ctx.ellipse(0, -68, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arms - more graceful
      ctx.fillStyle = '#ffe6f2';
      const armSway = Math.sin(timeRef.current * 1.2) * (animState.hipSway > 0 ? 10 : 0);
      // Left arm
      ctx.beginPath();
      ctx.ellipse(-75 + armSway, 35, 18, 55, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.ellipse(75 - armSway, 35, 18, 55, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Legs - more shapely
      ctx.fillStyle = exprColors.face;
      const legSpread = currentState.intensity > 0.6 ? Math.sin(timeRef.current * 0.8) * 5 : 0;
      // Left leg
      ctx.beginPath();
      ctx.ellipse(-28 - legSpread, 150, 20, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right leg
      ctx.beginPath();
      ctx.ellipse(28 + legSpread, 150, 20, 65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect based on intensity
      if (currentState.intensity > 0.5) {
        ctx.shadowBlur = 40 * currentState.intensity;
        ctx.shadowColor = exprColors.blush;
      }

      ctx.restore();

      // Particle effects for high intensity
      if (currentState.intensity > 0.7) {
        ctx.fillStyle = `rgba(255, 102, 179, ${(currentState.intensity - 0.7) * 0.5})`;
        for (let i = 0; i < 5; i++) {
          const x = centerX + Math.sin(timeRef.current + i) * 100;
          const y = centerY + Math.cos(timeRef.current + i) * 100;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
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
      width={500}
      height={700}
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
      {/* Animated background - more vibrant */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
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
