'use client';

import React, { useRef, useEffect, useState } from 'react';

// Animation states mapping - MILF seductive movements
const animationStates = {
  idle_soft: { offsetY: 0, rotation: 0, scale: 1, hipSway: 0, chestBounce: 0 },
  lean_forward: { offsetY: -30, rotation: -10, scale: 1, hipSway: 0, chestBounce: 0.5 },
  sway_hips: { offsetY: 0, rotation: 0, scale: 1, hipSway: 1.5, chestBounce: 0.3 },
  teasing_pose: { offsetY: 20, rotation: 12, scale: 1.08, hipSway: 0.8, chestBounce: 0.6 },
  close_intimate_pose: { offsetY: -20, rotation: -15, scale: 1.12, hipSway: 0, chestBounce: 0.8 },
  slow_breathing: { offsetY: 0, rotation: 0, scale: 1, hipSway: 0, chestBounce: 0.4 },
  shy_cover: { offsetY: 25, rotation: -18, scale: 0.98, hipSway: 0, chestBounce: 0.2 },
  seductive_dance: { offsetY: 0, rotation: 0, scale: 1.15, hipSway: 2.5, chestBounce: 1.0 },
  bounce_chest: { offsetY: -15, rotation: -8, scale: 1.1, hipSway: 0.5, chestBounce: 1.2 },
};

// Facial expression colors - MILF style
const expressionColors = {
  smile_seductive: { face: '#ffb3d9', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066', skin: '#ffe6f2' },
  blush_light: { face: '#ffcccc', blush: '#ff9999', eyes: '#ff99cc', lips: '#ff3399', skin: '#ffe6f2' },
  blush_heavy: { face: '#ff6666', blush: '#ff3333', eyes: '#ff66b3', lips: '#ff0066', skin: '#ffe6f2' },
  half_lidded_eyes: { face: '#ffb3d9', blush: '#ff80cc', eyes: '#ff99cc', lips: '#ff3399', skin: '#ffe6f2' },
  soft_moan: { face: '#ff99cc', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066', skin: '#ffe6f2' },
  look_away: { face: '#ffb3d9', blush: '#ff99cc', eyes: '#ffb3d9', lips: '#ff3399', skin: '#ffe6f2' },
  wink_seductive: { face: '#ffb3d9', blush: '#ff66b3', eyes: '#ff80cc', lips: '#ff0066', skin: '#ffe6f2' },
};

// MILF Character Renderer - Mature, Curvy, Seductive
function Character2D({ animation, expression, intensity }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  const currentStateRef = useRef({
    animation: 'idle_soft',
    expression: 'smile_seductive',
    intensity: 0.5,
  });

  useEffect(() => {
    if (animation) {
      currentStateRef.current = {
        animation: animation.body || 'idle_soft',
        expression: animation.face || expression || 'smile_seductive',
        intensity: animation.intensity || intensity || 0.5,
      };
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

      const currentState = currentStateRef.current;
      const animState = animationStates[currentState.animation] || animationStates.idle_soft;
      const exprColors = expressionColors[currentState.expression] || expressionColors.smile_seductive;
      
      // Apply transformations
      ctx.save();
      ctx.translate(centerX, centerY + animState.offsetY);
      
      // Hip sway animation - more pronounced for MILF
      const hipRotation = animState.hipSway * Math.sin(timeRef.current * 1.8) * 12;
      ctx.rotate(((animState.rotation + hipRotation) * Math.PI) / 180);
      
      const scale = animState.scale * (0.98 + currentState.intensity * 0.12);
      ctx.scale(scale, scale);

      // Breathing animation - more pronounced for mature body
      const breathAmount = currentState.animation === 'slow_breathing' ? 0.25 : 0.15;
      const breathSpeed = currentState.animation === 'slow_breathing' ? 0.5 : 1.0;
      const breathScale = 1 + Math.sin(timeRef.current * breathSpeed) * breathAmount;

      // Chest bounce - MILF feature
      const chestBounceAmount = animState.chestBounce * Math.sin(timeRef.current * 2.5) * 12;
      const chestBounce = chestBounceAmount + (currentState.intensity > 0.6 ? Math.sin(timeRef.current * 3) * 8 : 0);

      // Body (torso) - MILF: curvier, more voluptuous
      const bodyGradient = ctx.createLinearGradient(-100, -60, 100, 200);
      bodyGradient.addColorStop(0, exprColors.face);
      bodyGradient.addColorStop(0.3, exprColors.blush);
      bodyGradient.addColorStop(0.7, exprColors.blush);
      bodyGradient.addColorStop(1, exprColors.face);
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      // Curvier waist-to-hip ratio (MILF body)
      ctx.ellipse(0, 50 + chestBounce, 95, 150 * breathScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Waist definition
      ctx.fillStyle = exprColors.face;
      ctx.beginPath();
      ctx.ellipse(0, 30 + chestBounce, 70, 100 * breathScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blush effect - more pronounced
      const blushIntensity = currentState.expression.includes('blush') 
        ? (currentState.expression === 'blush_heavy' ? 1.0 : 0.7) 
        : currentState.intensity * 0.5;
      
      if (blushIntensity > 0.2) {
        ctx.fillStyle = `rgba(255, 102, 179, ${blushIntensity})`;
        ctx.beginPath();
        ctx.ellipse(-40, 35 + chestBounce, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(40, 35 + chestBounce, 35, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head - mature features
      ctx.fillStyle = exprColors.skin;
      ctx.beginPath();
      ctx.arc(0, -90, 70, 0, Math.PI * 2);
      ctx.fill();

      // Hair - mature MILF style (longer, flowing)
      ctx.fillStyle = '#ff66b3';
      // Main hair
      ctx.beginPath();
      ctx.arc(0, -110, 75, 0, Math.PI * 2);
      ctx.fill();
      // Bangs
      ctx.beginPath();
      ctx.arc(-28, -95, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(28, -95, 20, 0, Math.PI * 2);
      ctx.fill();
      // Side strands - longer for MILF
      ctx.beginPath();
      ctx.ellipse(-60, -70, 15, 45, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(60, -70, 15, 45, 0.6, 0, Math.PI * 2);
      ctx.fill();
      // Back hair - long and flowing
      ctx.beginPath();
      ctx.ellipse(0, -50, 50, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes - mature, seductive
      const eyeY = currentState.expression === 'half_lidded_eyes' ? -70 : -78;
      const eyeSize = currentState.expression === 'half_lidded_eyes' ? 8 : 16;
      const eyeOffset = currentState.expression === 'wink_seductive' ? Math.sin(timeRef.current * 4) : 0;
      
      ctx.fillStyle = '#333';
      // Left eye
      if (eyeOffset < 0.5) {
        ctx.beginPath();
        ctx.arc(-25, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Winking
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-25, eyeY, eyeSize, 0, Math.PI);
        ctx.stroke();
      }
      // Right eye
      ctx.beginPath();
      ctx.arc(25, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Eye sparkle - seductive
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-23, eyeY - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(27, eyeY - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eyelashes - longer, more seductive
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-25 + i * 4, eyeY - eyeSize);
        ctx.lineTo(-25 + i * 4, eyeY - eyeSize - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(25 + i * 4, eyeY - eyeSize);
        ctx.lineTo(25 + i * 4, eyeY - eyeSize - 8);
        ctx.stroke();
      }

      // Mouth - mature, seductive lips
      ctx.fillStyle = exprColors.lips;
      if (currentState.expression === 'soft_moan') {
        // Open mouth - more seductive
        ctx.beginPath();
        ctx.ellipse(0, -60, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tongue hint
        ctx.fillStyle = '#ff6699';
        ctx.beginPath();
        ctx.ellipse(0, -58, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Seductive smile - fuller lips
        ctx.strokeStyle = exprColors.lips;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, -65, 22, 0.15, Math.PI - 0.15);
        ctx.stroke();
        // Upper lip
        ctx.beginPath();
        ctx.arc(0, -72, 18, 0.2, Math.PI - 0.2);
        ctx.stroke();
        // Lip gloss effect - more pronounced
        ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.beginPath();
        ctx.ellipse(0, -70, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arms - mature, graceful
      ctx.fillStyle = exprColors.skin;
      const armSway = Math.sin(timeRef.current * 1.5) * (animState.hipSway > 0 ? 15 : 0);
      // Left arm - more graceful
      ctx.beginPath();
      ctx.ellipse(-85 + armSway, 45, 22, 65, -0.5, 0, Math.PI * 2);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.ellipse(85 - armSway, 45, 22, 65, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Legs - MILF: thicker, more shapely
      ctx.fillStyle = exprColors.face;
      const legSpread = currentState.intensity > 0.6 ? Math.sin(timeRef.current * 0.7) * 8 : 0;
      // Left leg - curvier
      ctx.beginPath();
      ctx.ellipse(-32 - legSpread, 170, 24, 75, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right leg
      ctx.beginPath();
      ctx.ellipse(32 + legSpread, 170, 24, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thighs - MILF feature
      ctx.fillStyle = exprColors.face;
      ctx.beginPath();
      ctx.ellipse(-30, 140, 28, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(30, 140, 28, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect based on intensity
      if (currentState.intensity > 0.5) {
        ctx.shadowBlur = 50 * currentState.intensity;
        ctx.shadowColor = exprColors.blush;
      }

      ctx.restore();

      // Particle effects for high intensity - more seductive
      if (currentState.intensity > 0.7) {
        ctx.fillStyle = `rgba(255, 102, 179, ${(currentState.intensity - 0.7) * 0.6})`;
        for (let i = 0; i < 8; i++) {
          const x = centerX + Math.sin(timeRef.current * 2 + i) * 120;
          const y = centerY + Math.cos(timeRef.current * 2 + i) * 120;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
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
  }, []); // Empty dependency array - animation loop runs continuously

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={800}
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
      {/* Animated background - seductive atmosphere */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* MILF Character */}
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
