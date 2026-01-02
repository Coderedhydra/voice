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

// Anime Character Renderer - High Quality 2D
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
      console.log('Character2D: Updating animation', animation);
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
      // Clear canvas with gradient background
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.height);
      bgGradient.addColorStop(0, 'rgba(255, 230, 242, 0.05)');
      bgGradient.addColorStop(1, 'rgba(138, 43, 226, 0.02)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentState = currentStateRef.current;
      const animState = animationStates[currentState.animation] || animationStates.idle_soft;
      const exprColors = expressionColors[currentState.expression] || expressionColors.smile_seductive;
      
      // Apply transformations
      ctx.save();
      ctx.translate(centerX, centerY + animState.offsetY);
      
      // Hip sway animation - smooth and anime-like
      const hipRotation = animState.hipSway * Math.sin(timeRef.current * 1.5) * 8;
      ctx.rotate(((animState.rotation + hipRotation) * Math.PI) / 180);
      
      const scale = animState.scale * (0.95 + currentState.intensity * 0.15);
      ctx.scale(scale, scale);

      // Breathing animation - subtle and smooth
      const breathAmount = currentState.animation === 'slow_breathing' ? 0.08 : 0.04;
      const breathSpeed = currentState.animation === 'slow_breathing' ? 0.8 : 1.2;
      const breathScale = 1 + Math.sin(timeRef.current * breathSpeed) * breathAmount;

      // Chest bounce - subtle anime bounce
      const chestBounceAmount = animState.chestBounce * Math.sin(timeRef.current * 2) * 8;
      const chestBounce = chestBounceAmount + (currentState.intensity > 0.6 ? Math.sin(timeRef.current * 2.5) * 5 : 0);

      // === ANIME BODY - Smooth and Stylized ===
      
      // Neck - slim and elegant
      const neckGradient = ctx.createLinearGradient(-15, -40, 15, 0);
      neckGradient.addColorStop(0, exprColors.skin);
      neckGradient.addColorStop(1, exprColors.face);
      ctx.fillStyle = neckGradient;
      ctx.beginPath();
      ctx.moveTo(-12, -40);
      ctx.bezierCurveTo(-12, -30, -10, -10, -15, 5);
      ctx.lineTo(15, 5);
      ctx.bezierCurveTo(10, -10, 12, -30, 12, -40);
      ctx.closePath();
      ctx.fill();

      // Shoulders - anime style broad but feminine
      ctx.fillStyle = exprColors.face;
      ctx.beginPath();
      ctx.ellipse(-45, 15 + chestBounce * 0.3, 25, 20, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(45, 15 + chestBounce * 0.3, 25, 20, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Torso - hourglass anime figure
      const torsoGradient = ctx.createRadialGradient(0, 40, 20, 0, 60, 80);
      torsoGradient.addColorStop(0, exprColors.face);
      torsoGradient.addColorStop(0.6, exprColors.blush);
      torsoGradient.addColorStop(1, exprColors.face);
      ctx.fillStyle = torsoGradient;
      ctx.beginPath();
      ctx.moveTo(-40, 10);
      ctx.bezierCurveTo(-50, 35 + chestBounce, -45, 70 * breathScale, -35, 100);
      ctx.bezierCurveTo(-30, 120, -25, 130, 0, 135);
      ctx.bezierCurveTo(25, 130, 30, 120, 35, 100);
      ctx.bezierCurveTo(45, 70 * breathScale, 50, 35 + chestBounce, 40, 10);
      ctx.closePath();
      ctx.fill();

      // Chest definition - anime style
      ctx.strokeStyle = 'rgba(255, 180, 200, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 35 + chestBounce, 35, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // === ANIME HEAD - Proper proportions ===
      
      // Back hair (drawn first, behind head)
      const hairGradient = ctx.createRadialGradient(0, -110, 10, 0, -110, 90);
      hairGradient.addColorStop(0, '#ff8fcc');
      hairGradient.addColorStop(0.7, '#ff66b3');
      hairGradient.addColorStop(1, '#e84393');
      ctx.fillStyle = hairGradient;
      ctx.beginPath();
      ctx.ellipse(0, -105, 80, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Long flowing back hair
      ctx.beginPath();
      ctx.moveTo(-70, -60);
      ctx.bezierCurveTo(-75, 0, -60, 60, -50, 100);
      ctx.bezierCurveTo(-45, 110, -40, 115, -35, 110);
      ctx.bezierCurveTo(-42, 70, -55, 10, -60, -55);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(70, -60);
      ctx.bezierCurveTo(75, 0, 60, 60, 50, 100);
      ctx.bezierCurveTo(45, 110, 40, 115, 35, 110);
      ctx.bezierCurveTo(42, 70, 55, 10, 60, -55);
      ctx.closePath();
      ctx.fill();

      // Head - anime oval shape
      const faceGradient = ctx.createRadialGradient(0, -95, 20, 0, -90, 65);
      faceGradient.addColorStop(0, '#fff5f7');
      faceGradient.addColorStop(0.6, exprColors.skin);
      faceGradient.addColorStop(1, exprColors.face);
      ctx.fillStyle = faceGradient;
      ctx.beginPath();
      ctx.moveTo(0, -155);
      ctx.bezierCurveTo(-45, -155, -62, -130, -62, -95);
      ctx.bezierCurveTo(-62, -60, -50, -35, -25, -30);
      ctx.bezierCurveTo(-10, -28, 10, -28, 25, -30);
      ctx.bezierCurveTo(50, -35, 62, -60, 62, -95);
      ctx.bezierCurveTo(62, -130, 45, -155, 0, -155);
      ctx.closePath();
      ctx.fill();

      // Face outline (anime style)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Front hair - anime bangs
      ctx.fillStyle = hairGradient;
      // Center bang
      ctx.beginPath();
      ctx.moveTo(0, -145);
      ctx.bezierCurveTo(-8, -130, -5, -110, 0, -100);
      ctx.bezierCurveTo(5, -110, 8, -130, 0, -145);
      ctx.closePath();
      ctx.fill();
      
      // Side bangs (layered anime style)
      for (let i = 0; i < 5; i++) {
        const xOffset = (i - 2) * 18;
        const yStart = -140 + Math.abs(i - 2) * 5;
        ctx.beginPath();
        ctx.moveTo(xOffset - 8, yStart);
        ctx.bezierCurveTo(xOffset - 6, yStart + 20, xOffset - 4, yStart + 35, xOffset, yStart + 45);
        ctx.bezierCurveTo(xOffset + 4, yStart + 35, xOffset + 6, yStart + 20, xOffset + 8, yStart);
        ctx.closePath();
        ctx.fill();
      }

      // Side hair strands - anime style
      ctx.beginPath();
      ctx.moveTo(-58, -85);
      ctx.bezierCurveTo(-65, -60, -62, -20, -55, 20);
      ctx.bezierCurveTo(-52, 25, -48, 25, -47, 20);
      ctx.bezierCurveTo(-52, -15, -53, -55, -50, -83);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(58, -85);
      ctx.bezierCurveTo(65, -60, 62, -20, 55, 20);
      ctx.bezierCurveTo(52, 25, 48, 25, 47, 20);
      ctx.bezierCurveTo(52, -15, 53, -55, 50, -83);
      ctx.closePath();
      ctx.fill();

      // Blush effect - anime style
      const blushIntensity = currentState.expression.includes('blush') 
        ? (currentState.expression === 'blush_heavy' ? 0.7 : 0.5) 
        : currentState.intensity * 0.4;
      
      if (blushIntensity > 0.15) {
        const blushGrad = ctx.createRadialGradient(-35, -85, 5, -35, -85, 22);
        blushGrad.addColorStop(0, `rgba(255, 150, 200, ${blushIntensity})`);
        blushGrad.addColorStop(1, `rgba(255, 180, 210, 0)`);
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.ellipse(-35, -85, 22, 18, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.ellipse(35, -85, 22, 18, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // === ANIME EYES - Large and Expressive ===
      const isHalfLidded = currentState.expression === 'half_lidded_eyes';
      const eyeY = -100;
      const eyeOpenness = isHalfLidded ? 0.4 : 1.0;
      const isWinking = currentState.expression === 'wink_seductive';
      const winkPhase = Math.sin(timeRef.current * 3);
      
      // Helper function to draw anime eye
      const drawAnimeEye = (x, isWink) => {
        const winkAmount = (isWink && winkPhase > 0) ? winkPhase : 0;
        const currentOpenness = eyeOpenness * (1 - winkAmount * 0.8);
        
        ctx.save();
        ctx.translate(x, eyeY);
        
        if (currentOpenness < 0.2) {
          // Closed/winking eye - draw as curved line
          ctx.strokeStyle = '#2c3e50';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-18, 0);
          ctx.bezierCurveTo(-12, 8, -6, 8, 0, 6);
          ctx.bezierCurveTo(6, 8, 12, 8, 18, 0);
          ctx.stroke();
        } else {
          // Open eye - full anime style
          
          // Eye white
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 22 * currentOpenness, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Eye outline
          ctx.strokeStyle = '#2c3e50';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 22 * currentOpenness, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Iris gradient - anime style
          const irisGrad = ctx.createRadialGradient(2, -5, 0, 2, -5, 14);
          irisGrad.addColorStop(0, '#ff99cc');
          irisGrad.addColorStop(0.3, '#ff66b3');
          irisGrad.addColorStop(0.7, '#e84393');
          irisGrad.addColorStop(1, '#6c5ce7');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(2, 2 * currentOpenness, 13, 0, Math.PI * 2);
          ctx.fill();
          
          // Pupil
          const pupilGrad = ctx.createRadialGradient(2, 0, 0, 2, 0, 8);
          pupilGrad.addColorStop(0, '#2c3e50');
          pupilGrad.addColorStop(0.8, '#2c3e50');
          pupilGrad.addColorStop(1, 'rgba(44, 62, 80, 0.5)');
          ctx.fillStyle = pupilGrad;
          ctx.beginPath();
          ctx.arc(2, 3 * currentOpenness, 7, 0, Math.PI * 2);
          ctx.fill();
          
          // Main highlight - large anime sparkle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.ellipse(-5, -8 * currentOpenness, 6, 8 * currentOpenness, 0.3, 0, Math.PI * 2);
          ctx.fill();
          
          // Secondary highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(8, 6 * currentOpenness, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Tiny sparkle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(-8, 4 * currentOpenness, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Upper eyelashes - anime style
        ctx.strokeStyle = '#2c3e50';
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.5;
        for (let i = -2; i <= 2; i++) {
          const lashX = i * 7;
          const lashLength = 12 - Math.abs(i) * 2;
          const angle = i * 0.25;
          ctx.beginPath();
          ctx.moveTo(lashX, -22 * currentOpenness);
          ctx.lineTo(
            lashX + Math.sin(angle) * lashLength,
            -22 * currentOpenness - Math.cos(angle) * lashLength
          );
          ctx.stroke();
        }
        
        ctx.restore();
      };
      
      // Draw both eyes
      drawAnimeEye(-30, isWinking);
      drawAnimeEye(30, false);

      // Eyebrows - anime style
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      // Left eyebrow
      ctx.beginPath();
      ctx.moveTo(-50, -125);
      ctx.bezierCurveTo(-35, -128, -20, -128, -10, -125);
      ctx.stroke();
      
      // Right eyebrow  
      ctx.beginPath();
      ctx.moveTo(50, -125);
      ctx.bezierCurveTo(35, -128, 20, -128, 10, -125);
      ctx.stroke();

      // === ANIME MOUTH - Cute and expressive ===
      const mouthY = -65;
      
      // Nose - small anime dot
      ctx.fillStyle = 'rgba(255, 150, 180, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -80, 2, 0, Math.PI * 2);
      ctx.fill();
      
      if (currentState.expression === 'soft_moan') {
        // Open mouth - anime style "ahh"
        ctx.fillStyle = '#ff1a75';
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner mouth
        ctx.fillStyle = '#cc0052';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + 2, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tongue
        ctx.fillStyle = '#ff6699';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + 5, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-3, mouthY - 4, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Smile - anime style
        ctx.strokeStyle = '#ff1a75';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, mouthY + 5, 15, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Lip highlights
        ctx.strokeStyle = 'rgba(255, 100, 150, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, mouthY + 3, 14, 0.25, Math.PI - 0.25);
        ctx.stroke();
        
        // Lip gloss
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-5, mouthY, 4, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5, mouthY, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // === ANIME ARMS - Slim and graceful ===
      const armSway = Math.sin(timeRef.current * 1.5) * (animState.hipSway > 0 ? 10 : 5);
      
      // Left arm
      const leftArmGrad = ctx.createLinearGradient(-75, 15, -75, 90);
      leftArmGrad.addColorStop(0, exprColors.skin);
      leftArmGrad.addColorStop(1, exprColors.face);
      ctx.fillStyle = leftArmGrad;
      ctx.beginPath();
      ctx.moveTo(-45, 20);
      ctx.bezierCurveTo(-55 + armSway, 30, -58 + armSway, 50, -60 + armSway, 70);
      ctx.bezierCurveTo(-62 + armSway, 85, -60 + armSway, 95, -55 + armSway, 105);
      ctx.bezierCurveTo(-50 + armSway, 95, -48 + armSway, 85, -46 + armSway, 70);
      ctx.bezierCurveTo(-45 + armSway, 50, -42 + armSway, 30, -40, 20);
      ctx.closePath();
      ctx.fill();
      
      // Right arm
      const rightArmGrad = ctx.createLinearGradient(75, 15, 75, 90);
      rightArmGrad.addColorStop(0, exprColors.skin);
      rightArmGrad.addColorStop(1, exprColors.face);
      ctx.fillStyle = rightArmGrad;
      ctx.beginPath();
      ctx.moveTo(45, 20);
      ctx.bezierCurveTo(55 - armSway, 30, 58 - armSway, 50, 60 - armSway, 70);
      ctx.bezierCurveTo(62 - armSway, 85, 60 - armSway, 95, 55 - armSway, 105);
      ctx.bezierCurveTo(50 - armSway, 95, 48 - armSway, 85, 46 - armSway, 70);
      ctx.bezierCurveTo(45 - armSway, 50, 42 - armSway, 30, 40, 20);
      ctx.closePath();
      ctx.fill();
      
      // Hands - simple anime style
      ctx.fillStyle = exprColors.skin;
      ctx.beginPath();
      ctx.ellipse(-55 + armSway, 105, 12, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(55 - armSway, 105, 12, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // === ANIME LEGS - Slender and elegant ===
      const legSpread = currentState.intensity > 0.6 ? Math.sin(timeRef.current * 0.9) * 5 : 0;
      
      // Hips/Skirt area
      ctx.fillStyle = exprColors.blush;
      ctx.beginPath();
      ctx.moveTo(-35, 135);
      ctx.bezierCurveTo(-40, 140, -38, 150, -32, 155);
      ctx.lineTo(32, 155);
      ctx.bezierCurveTo(38, 150, 40, 140, 35, 135);
      ctx.closePath();
      ctx.fill();
      
      // Left leg
      const leftLegGrad = ctx.createLinearGradient(-28, 155, -28, 240);
      leftLegGrad.addColorStop(0, exprColors.skin);
      leftLegGrad.addColorStop(0.5, exprColors.face);
      leftLegGrad.addColorStop(1, 'rgba(255, 230, 240, 0.9)');
      ctx.fillStyle = leftLegGrad;
      ctx.beginPath();
      ctx.moveTo(-32 - legSpread, 155);
      ctx.bezierCurveTo(-34 - legSpread, 180, -35 - legSpread, 210, -33 - legSpread, 235);
      ctx.bezierCurveTo(-28 - legSpread, 240, -24 - legSpread, 240, -20 - legSpread, 235);
      ctx.bezierCurveTo(-22 - legSpread, 210, -23 - legSpread, 180, -25 - legSpread, 155);
      ctx.closePath();
      ctx.fill();
      
      // Right leg
      const rightLegGrad = ctx.createLinearGradient(28, 155, 28, 240);
      rightLegGrad.addColorStop(0, exprColors.skin);
      rightLegGrad.addColorStop(0.5, exprColors.face);
      rightLegGrad.addColorStop(1, 'rgba(255, 230, 240, 0.9)');
      ctx.fillStyle = rightLegGrad;
      ctx.beginPath();
      ctx.moveTo(32 + legSpread, 155);
      ctx.bezierCurveTo(34 + legSpread, 180, 35 + legSpread, 210, 33 + legSpread, 235);
      ctx.bezierCurveTo(28 + legSpread, 240, 24 + legSpread, 240, 20 + legSpread, 235);
      ctx.bezierCurveTo(22 + legSpread, 210, 23 + legSpread, 180, 25 + legSpread, 155);
      ctx.closePath();
      ctx.fill();
      
      // Feet - simple anime style
      ctx.fillStyle = exprColors.skin;
      ctx.beginPath();
      ctx.ellipse(-27 - legSpread, 238, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(27 + legSpread, 238, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // === ANIME EFFECTS ===
      
      // Glow aura based on intensity
      if (currentState.intensity > 0.5) {
        const auraIntensity = (currentState.intensity - 0.5) * 2;
        const auraGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 200);
        auraGrad.addColorStop(0, `rgba(255, 150, 200, ${auraIntensity * 0.2})`);
        auraGrad.addColorStop(0.5, `rgba(255, 100, 180, ${auraIntensity * 0.1})`);
        auraGrad.addColorStop(1, 'rgba(255, 50, 150, 0)');
        ctx.fillStyle = auraGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Sparkle particles for high intensity - anime style
      if (currentState.intensity > 0.65) {
        const sparkleCount = Math.floor(currentState.intensity * 12);
        for (let i = 0; i < sparkleCount; i++) {
          const angle = (timeRef.current * 0.8 + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2);
          const distance = 100 + Math.sin(timeRef.current * 2 + i) * 40;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = 3 + Math.sin(timeRef.current * 3 + i) * 2;
          const opacity = 0.6 + Math.sin(timeRef.current * 4 + i) * 0.4;
          
          // Draw sparkle star
          ctx.fillStyle = `rgba(255, 200, 220, ${opacity})`;
          ctx.beginPath();
          for (let j = 0; j < 4; j++) {
            const starAngle = (j * Math.PI) / 2;
            const px = x + Math.cos(starAngle) * size;
            const py = y + Math.sin(starAngle) * size;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          
          // Center bright spot
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Heart particles for very high intensity
      if (currentState.intensity > 0.8) {
        const heartCount = 3;
        for (let i = 0; i < heartCount; i++) {
          const t = timeRef.current * 0.5 + i * 2;
          const x = centerX + Math.sin(t * 0.5) * 80;
          const y = centerY - 150 + (t % 4) * 50 - 100;
          const size = 8 + Math.sin(t * 2) * 3;
          const opacity = Math.max(0, 0.8 - ((t % 4) / 4));
          
          if (opacity > 0.1) {
            ctx.fillStyle = `rgba(255, 100, 150, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(x, y + size * 0.3);
            ctx.bezierCurveTo(x, y - size * 0.2, x - size, y - size * 0.2, x - size, y + size * 0.3);
            ctx.bezierCurveTo(x - size, y + size * 0.8, x, y + size * 1.2, x, y + size * 1.5);
            ctx.bezierCurveTo(x, y + size * 1.2, x + size, y + size * 0.8, x + size, y + size * 0.3);
            ctx.bezierCurveTo(x + size, y - size * 0.2, x, y - size * 0.2, x, y + size * 0.3);
            ctx.closePath();
            ctx.fill();
          }
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
      width={800}
      height={900}
      className="w-full h-full"
      style={{ 
        imageRendering: 'high-quality',
        objectFit: 'contain'
      }}
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
