'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Anime character sprite mappings
// Using free anime girl images from various sources
const CHARACTER_SPRITES = {
  // Base poses
  idle_soft: {
    url: 'https://i.imgur.com/placeholder.png', // Replace with actual anime girl image
    alt: 'Idle pose',
  },
  lean_forward: {
    url: 'https://i.imgur.com/placeholder2.png',
    alt: 'Leaning forward',
  },
  sway_hips: {
    url: 'https://i.imgur.com/placeholder3.png',
    alt: 'Hip swaying',
  },
  teasing_pose: {
    url: 'https://i.imgur.com/placeholder4.png',
    alt: 'Teasing',
  },
  close_intimate_pose: {
    url: 'https://i.imgur.com/placeholder5.png',
    alt: 'Intimate pose',
  },
  slow_breathing: {
    url: 'https://i.imgur.com/placeholder6.png',
    alt: 'Breathing',
  },
  shy_cover: {
    url: 'https://i.imgur.com/placeholder7.png',
    alt: 'Shy',
  },
  seductive_dance: {
    url: 'https://i.imgur.com/placeholder8.png',
    alt: 'Dancing',
  },
  bounce_chest: {
    url: 'https://i.imgur.com/placeholder9.png',
    alt: 'Bouncing',
  },
};

// Fallback to a single anime character image for all poses
const FALLBACK_CHARACTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="0%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(255,179,217);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(255,105,180);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="600" fill="url(%23grad1)" opacity="0.1"/%3E%3Ctext x="200" y="300" font-family="Arial" font-size="48" fill="%23ff69b4" text-anchor="middle"%3EYuki%3C/text%3E%3Ctext x="200" y="350" font-family="Arial" font-size="24" fill="%23ff1493" text-anchor="middle"%3E♡ Anime Waifu ♡%3C/text%3E%3C/svg%3E';

export function AnimeCharacter({ animation, expression, intensity }) {
  const [currentPose, setCurrentPose] = useState('idle_soft');
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (animation?.body) {
      console.log('[AnimeCharacter] Updating pose to:', animation.body);
      setCurrentPose(animation.body);
    }
  }, [animation]);

  // Get current sprite
  const sprite = CHARACTER_SPRITES[currentPose] || CHARACTER_SPRITES.idle_soft;

  // Animation effects based on state
  const getAnimationClass = () => {
    const animations = [];
    
    if (currentPose === 'sway_hips' || currentPose === 'seductive_dance') {
      animations.push('animate-sway');
    }
    
    if (currentPose === 'bounce_chest') {
      animations.push('animate-bounce');
    }
    
    if (currentPose === 'lean_forward') {
      animations.push('animate-lean');
    }
    
    if (intensity > 0.7) {
      animations.push('animate-pulse');
    }
    
    return animations.join(' ');
  };

  // Get filter effects based on expression
  const getFilterStyle = () => {
    const filters = [];
    
    if (expression === 'blush_heavy') {
      filters.push('saturate(1.3)');
      filters.push('hue-rotate(-5deg)');
    } else if (expression === 'blush_light') {
      filters.push('saturate(1.1)');
    }
    
    if (intensity > 0.8) {
      filters.push('brightness(1.1)');
    }
    
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-lg">Loading character...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Intensity glow */}
        {intensity > 0.5 && (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at center, rgba(255, 105, 180, ${(intensity - 0.5) * 0.3}) 0%, transparent 60%)`,
              opacity: intensity,
            }}
          />
        )}
        
        {/* Sparkle effects */}
        {intensity > 0.7 && (
          <div className="sparkles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}
        
        {/* Hearts for high intensity */}
        {intensity > 0.85 && (
          <div className="hearts">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="heart"
                style={{
                  left: `${30 + (i * 20)}%`,
                  animationDelay: `${i * 1}s`,
                }}
              >
                💖
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Image */}
      <div
        className={`relative z-10 character-container ${getAnimationClass()}`}
        style={{
          filter: getFilterStyle(),
          transform: `scale(${0.9 + intensity * 0.2})`,
          transition: 'all 0.5s ease-out',
        }}
      >
        {/* Using fallback SVG for now - replace with actual anime images */}
        <div className="relative w-full max-w-md aspect-[2/3]">
          <img
            src={FALLBACK_CHARACTER}
            alt={sprite.alt}
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'crisp-edges',
            }}
          />
          
          {/* Expression overlay */}
          {expression && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
                {expression.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg) translateX(-5px); }
          50% { transform: rotate(2deg) translateX(5px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes lean {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
        }
        
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(0); }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-200px); }
        }
        
        .character-container {
          transition: transform 0.3s ease-out;
        }
        
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .animate-lean {
          animation: lean 2s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .sparkle {
          position: absolute;
          animation: sparkle 2s ease-in-out infinite;
          font-size: 1.5rem;
          pointer-events: none;
        }
        
        .heart {
          position: absolute;
          animation: float-up 4s ease-in-out infinite;
          font-size: 2rem;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
