import React, { useState } from 'react';
import { motion } from 'motion/react';

// 1. Isometric 3D Revenue Icon (Coin Pile with glowing pulsed Trendline)
export const Revenue3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.25)]">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="goldTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Base shadow */}
        <ellipse cx="50" cy="80" rx="35" ry="10" fill="#e2e8f0" opacity="0.6" />

        {/* 3D Coin Column 1 (Left Back) */}
        <g>
          {/* Coin 1 Bottom/Side */}
          <path d="M 25,65 A 15,6 0 0,0 55,65 V 71 A 15,6 0 0,1 25,71 Z" fill="url(#goldGrad)" />
          <ellipse cx="40" cy="65" rx="15" ry="6" fill="url(#goldTopGrad)" />
          {/* Coin 2 Left Back (Higher) */}
          <motion.g animate={{ y: isHovered ? -5 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
            <path d="M 25,57 A 15,6 0 0,0 55,57 V 63 A 15,6 0 0,1 25,63 Z" fill="url(#goldGrad)" />
            <ellipse cx="40" cy="57" rx="15" ry="6" fill="url(#goldTopGrad)" />
          </motion.g>
        </g>

        {/* 3D Coin Column 2 (Right Front) */}
        <g>
          <path d="M 45,70 A 18,7 0 0,0 81,70 V 77 A 18,7 0 0,1 45,77 Z" fill="url(#goldGrad)" />
          <ellipse cx="63" cy="70" rx="18" ry="7" fill="url(#goldTopGrad)" />
          
          <motion.g animate={{ y: isHovered ? -10 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.05 }}>
            <path d="M 45,61 A 18,7 0 0,0 81,61 V 68 A 18,7 0 0,1 45,68 Z" fill="url(#goldGrad)" />
            <ellipse cx="63" cy="61" rx="18" ry="7" fill="url(#goldTopGrad)" />
          </motion.g>

          <motion.g animate={{ y: isHovered ? -20 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}>
            <path d="M 45,52 A 18,7 0 0,0 81,52 V 59 A 18,7 0 0,1 45,59 Z" fill="url(#goldGrad)" />
            <ellipse cx="63" cy="52" rx="18" ry="7" fill="url(#goldTopGrad)" />
          </motion.g>
        </g>

        {/* Glowing holographic up-trend graph line */}
        <g>
          {/* Gradient area under line */}
          <motion.path 
            d="M 15,60 L 35,42 L 58,45 L 85,15 L 85,80 L 15,80 Z" 
            fill="url(#glowGrad)" 
            opacity={isHovered ? 0.35 : 0.15}
            animate={{ opacity: isHovered ? 0.4 : 0.15 }}
            transition={{ duration: 0.3 }}
          />

          {/* Glowing Line */}
          <path 
            d="M 15,60 L 35,42 L 58,45 L 85,15" 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Animated pointer pulse node */}
          <motion.circle 
            cx="85" 
            cy="15" 
            r="5" 
            fill="#10b981" 
            stroke="#ffffff" 
            strokeWidth="2"
            animate={{ r: isHovered ? [5, 8, 5] : 5 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        </g>
      </svg>
    </div>
  );
};

// 2. Isometric 3D Orders Icon (Holographic Box that lifts open and glows)
export const Order3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)]">
        <defs>
          <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8a5c2" />
            <stop offset="100%" stopColor="#f7d794" />
          </linearGradient>
          <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="boxLid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Base Pedestal shadow */}
        <ellipse cx="50" cy="80" rx="32" ry="8" fill="#e2e8f0" />

        {/* Glowing concentric circle rings under box */}
        <motion.ellipse 
          cx="50" 
          cy="78" 
          rx="26" 
          ry="6" 
          fill="none" 
          stroke="#60a5fa" 
          strokeWidth="1.5" 
          opacity={isHovered ? 0.8 : 0.3}
          animate={{ rx: isHovered ? [24, 28, 24] : 24, ry: isHovered ? [5.5, 7, 5.5] : 5.5 }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Isometric Box Base Block */}
        <g>
          {/* Left Panel */}
          <path d="M 50,75 L 20,60 L 20,38 L 50,53 Z" fill="#3b82f6" opacity="0.85" />
          {/* Right Panel */}
          <path d="M 50,75 L 80,60 L 80,38 L 50,53 Z" fill="#1d4ed8" opacity="0.9" />
          {/* Inside bottom card item glowing through */}
          <motion.path 
            d="M 50,53 L 26,41 L 50,29 L 74,41 Z" 
            fill="#60a5fa" 
            opacity={isHovered ? 0.8 : 0.4}
          />
        </g>

        {/* Floating Box Lid / Cover which moves UP on hover */}
        <motion.g 
          animate={{ y: isHovered ? -16 : 0, scale: isHovered ? 1.05 : 1 }} 
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
        >
          {/* Left flap of lid */}
          <path d="M 50,33 L 20,18 L 35,10 L 65,25 Z" fill="#60a5fa" opacity="0.9" />
          {/* Right flap of lid */}
          <path d="M 50,33 L 80,18 L 65,10 L 35,25 Z" fill="#2563eb" opacity="0.95" />
          {/* Ribbon detail on Lid */}
          <path d="M 50,33 L 40,28 L 55,20 L 65,25 Z" fill="#ef4444" />
        </motion.g>

        {/* Floating star particles inside on hover */}
        {isHovered && (
          <>
            <motion.circle cx="28" cy="30" r="2.5" fill="#34d399" animate={{ y: [-5, -15], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }} />
            <motion.circle cx="72" cy="28" r="2.0" fill="#facc15" animate={{ y: [-2, -18], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.3, delay: 0.4 }} />
            <motion.circle cx="50" cy="22" r="3.0" fill="#ef4444" animate={{ y: [0, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.7, delay: 0.2 }} />
          </>
        )}
      </svg>
    </div>
  );
};

// 3. Isometric 3D Users/Customers Icon (Float Pedestal with Holographic spheres)
export const User3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.25)]">
        <defs>
          <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="sideUserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Base Stage */}
        <ellipse cx="50" cy="80" rx="35" ry="9" fill="#e2e8f0" />
        <ellipse cx="50" cy="78" rx="30" ry="7" fill="#f1f5f9" />

        {/* Circular Ring Platform */}
        <motion.ellipse 
          cx="50" 
          cy="77" 
          rx="25" 
          ry="6" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="3" 
          animate={{ stroke: isHovered ? '#10b981' : '#34d399', rx: isHovered ? 27 : 25 }}
          transition={{ duration: 0.3 }}
        />

        {/* Center Main User Hologram */}
        <g>
          {/* Torso */}
          <motion.path 
            d="M 36,65 C 36,55 64,55 64,65 Z" 
            fill="url(#userGrad)" 
            animate={{ y: isHovered ? -12 : 0 }} 
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          />
          {/* Head Sphere */}
          <motion.circle 
            cx="50" 
            cy="44" 
            r="10" 
            fill="url(#userGrad)" 
            animate={{ y: isHovered ? -15 : 0, scale: isHovered ? 1.1 : 1 }} 
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          />
        </g>

        {/* Back and side small spheres reflecting "team/users" */}
        <motion.circle 
          cx="24" 
          cy="50" 
          r="5" 
          fill="url(#sideUserGrad)" 
          opacity="0.8"
          animate={{ y: isHovered ? -6 : 0, x: isHovered ? -4 : 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.path 
          d="M 16,65 C 16,58 32,58 32,65 Z" 
          fill="url(#sideUserGrad)" 
          opacity="0.8"
          animate={{ y: isHovered ? -4 : 0, x: isHovered ? -4 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <motion.circle 
          cx="76" 
          cy="52" 
          r="5" 
          fill="url(#sideUserGrad)" 
          opacity="0.8"
          animate={{ y: isHovered ? -8 : 0, x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        />
        <motion.path 
          d="M 68,66 C 68,59 84,59 84,66 Z" 
          fill="url(#sideUserGrad)" 
          opacity="0.8"
          animate={{ y: isHovered ? -5 : 0, x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        />

        {/* Sparkles / Connectivity network lines on Hover */}
        {isHovered && (
          <g opacity="0.6">
            <line x1="24" y1="44" x2="50" y2="29" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="76" y1="44" x2="50" y2="29" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="24" y1="44" x2="50" y2="50" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="76" y1="44" x2="50" y2="50" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
          </g>
        )}
      </svg>
    </div>
  );
};

// 4. Isometric 3D Product/Appstore Icon (3D Shelves / Floating Hexagonal items)
export const Product3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(239,68,68,0.25)]">
        <defs>
          <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="shelfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="50" cy="80" rx="35" ry="9" fill="#e2e8f0" />

        {/* 3D Shelf Tier 1 (Base platform) */}
        <polygon points="15,65 50,50 85,65 50,80" fill="url(#shelfGrad)" stroke="#64748b" strokeWidth="1" />
        
        {/* Floating Items inside Display Stand */}
        {/* Floating Cube Item 1 (Left Back) */}
        <motion.g 
          animate={{ y: isHovered ? -8 : 0 }} 
          transition={{ type: 'spring', stiffness: 180, damping: 11 }}
        >
          {/* Isometric Cube representation */}
          <path d="M 35,53 L 23,47 L 35,41 L 47,47 Z" fill="#fecaca" />
          <path d="M 23,47 L 23,59 L 35,65 L 35,53 Z" fill="#ef4444" />
          <path d="M 35,53 L 35,65 L 47,59 L 47,47 Z" fill="#dc2626" />
        </motion.g>

        {/* Floating Sphere Item 2 (Right Front) */}
        <motion.g 
          animate={{ y: isHovered ? -14 : 0 }} 
          transition={{ type: 'spring', stiffness: 180, damping: 11, delay: 0.08 }}
        >
          <circle cx="62" cy="58" r="9" fill="url(#cubeGrad)" />
          <circle cx="59" cy="55" r="3" fill="#ffffff" opacity="0.6" />
        </motion.g>

        {/* Floating Pyramidal Item 3 (Center Top) */}
        <motion.g 
          animate={{ y: isHovered ? -20 : 0, rotateY: isHovered ? 180 : 0 }} 
          transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
        >
          {/* Pyramid Top */}
          <polygon points="50,15 40,38 50,45" fill="#fca5a5" />
          <polygon points="50,15 50,45 60,38" fill="#ef4444" />
        </motion.g>

        {/* Orbiting Halo light ring */}
        <motion.ellipse 
          cx="50" 
          cy="42" 
          rx="32" 
          ry="11" 
          fill="none" 
          stroke="#f87171" 
          strokeWidth="1.5" 
          opacity={isHovered ? 0.9 : 0.3}
          strokeDasharray="4,4"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        />
      </svg>
    </div>
  );
};

// Shared Animated SVG Wave Ripple Effect behind 3D icons
export const IconRippleEffect: React.FC<{ isHovered: boolean; color?: string }> = ({ isHovered, color = '#3b82f6' }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {isHovered && (
        <>
          <motion.div
            className="absolute rounded-full border border-dashed"
            style={{ borderColor: color }}
            initial={{ width: 20, height: 20, opacity: 0.8 }}
            animate={{ width: 70, height: 70, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full border opacity-50"
            style={{ borderColor: color, backgroundColor: `${color}10` }}
            initial={{ width: 10, height: 10, opacity: 0.6 }}
            animate={{ width: 50, height: 50, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
          />
        </>
      )}
    </div>
  );
};

// 5. OrdersList3D - Document folder or document slips stack for Số lượng đơn (Orange/Gold theme)
export const OrdersList3D: React.FC<{ externalHover?: boolean }> = ({ externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover ?? internalHover;

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <IconRippleEffect isHovered={isHovered} color="#f97316" />
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(249,115,22,0.25)] relative z-10">
        <defs>
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fff7ed" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="80" rx="30" ry="7" fill="#cbd5e1" opacity="0.5" />
        {/* Animated Ripple Circles on Base */}
        <motion.ellipse
          cx="50"
          cy="80"
          rx={isHovered ? 34 : 30}
          ry={isHovered ? 9 : 7}
          fill="none"
          stroke="#f97316"
          strokeWidth="1.5"
          opacity={isHovered ? 0.6 : 0}
          animate={{ scale: isHovered ? [1, 1.25, 1] : 1, opacity: isHovered ? [0.6, 0, 0.6] : 0 }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <motion.g animate={{ y: isHovered ? -8 : 0, rotate: isHovered ? -3 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
          {/* Back Paper */}
          <path d="M 32,25 L 68,25 L 68,65 L 32,65 Z" fill="url(#paperGrad)" stroke="#f97316" strokeWidth="1.5" transform="rotate(-5 50 45)" />
          {/* Front Paper */}
          <path d="M 35,28 L 65,28 L 65,68 L 35,68 Z" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
          {/* Lines on front paper */}
          <line x1="42" y1="36" x2="58" y2="36" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="44" x2="54" y2="44" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="52" x2="58" y2="52" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
          {/* Floating glowing stamp */}
          <motion.circle 
            cx="53" 
            cy="60" 
            r="4" 
            fill="#f97316" 
            animate={{ scale: isHovered ? [1, 1.4, 1] : 1 }} 
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        </motion.g>
      </svg>
    </div>
  );
};

// 6. BillingMachine3D - For total money/cash (Blue/Teal theme)
export const BillingMachine3D: React.FC<{ externalHover?: boolean }> = ({ externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover ?? internalHover;

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <IconRippleEffect isHovered={isHovered} color="#0ea5e9" />
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(14,165,233,0.25)] relative z-10">
        <defs>
          <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="80" rx="32" ry="7" fill="#cbd5e1" opacity="0.5" />
        <motion.g animate={{ y: isHovered ? -8 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 11 }}>
          {/* Safe Box Base */}
          <polygon points="25,45 50,30 75,45 75,70 50,85 25,70" fill="url(#safeGrad)" />
          {/* Front Face panel */}
          <polygon points="50,47 70,39 70,62 50,70" fill="#0369a1" />
          {/* Safe Dial/Wheel */}
          <motion.circle cx="38" cy="58" r="8" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2.5" animate={{ rotate: isHovered ? 360 : 0 }} transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: "linear" }} />
          <line x1="38" y1="50" x2="38" y2="54" stroke="#0ea5e9" strokeWidth="2" />
          <line x1="38" y1="62" x2="38" y2="66" stroke="#0ea5e9" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  );
};

// 7. ShoppingBasket3D - For product quantity (Emerald/Green theme)
export const ShoppingBasket3D: React.FC<{ externalHover?: boolean }> = ({ externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover ?? internalHover;

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <IconRippleEffect isHovered={isHovered} color="#10b981" />
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.25)] relative z-10">
        <ellipse cx="50" cy="80" rx="30" ry="6" fill="#cbd5e1" opacity="0.5" />
        <motion.g animate={{ y: isHovered ? -10 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 10 }}>
          {/* Basket Body */}
          <path d="M 25,45 L 75,45 L 68,75 L 32,75 Z" fill="#10b981" />
          {/* Rim */}
          <rect x="22" y="40" width="56" height="6" rx="3" fill="#059669" />
          {/* Basket handle */}
          <path d="M 30,40 Q 50,15 70,40" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
          {/* Small items inside basket popping out */}
          <motion.circle cx="42" cy="38" r="6" fill="#34d399" animate={{ y: isHovered ? -6 : 0 }} transition={{ duration: 0.3 }} />
          <motion.circle cx="58" cy="36" r="7" fill="#6ee7b7" animate={{ y: isHovered ? -9 : 0 }} transition={{ duration: 0.3, delay: 0.05 }} />
        </motion.g>
      </svg>
    </div>
  );
};

// 8. SyncServer3D - For SAP Sync Status (Indigo/Purple theme)
export const SyncServer3D: React.FC<{ externalHover?: boolean }> = ({ externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover ?? internalHover;

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <IconRippleEffect isHovered={isHovered} color="#f59e0b" />
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)] relative z-10">
        <ellipse cx="50" cy="80" rx="30" ry="7" fill="#cbd5e1" opacity="0.5" />
        <motion.g animate={{ y: isHovered ? -8 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 11 }}>
          {/* Server Unit 1 */}
          <rect x="25" y="52" width="50" height="18" rx="3" fill="#f59e0b" />
          <circle cx="35" cy="61" r="2.5" fill="#fef3c7" />
          <circle cx="43" cy="61" r="2" fill="#10b981" />
          <rect x="52" y="59" width="18" height="4" rx="2" fill="#d97706" />

          {/* Server Unit 2 */}
          <motion.g animate={{ y: isHovered ? -6 : 0 }}>
            <rect x="25" y="30" width="50" height="18" rx="3" fill="#fbbf24" />
            <circle cx="35" cy="39" r="2.5" fill="#fffbeb" />
            <motion.circle cx="43" cy="39" r="2" fill="#ef4444" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
            <rect x="52" y="37" width="18" height="4" rx="2" fill="#d97706" />
          </motion.g>

          {/* Connection line or sync arrows */}
          <motion.circle cx="50" cy="50" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
        </motion.g>
      </svg>
    </div>
  );
};

// 9. DiscountTag3D - For Promotions/Discounts (Rose/Pink/Red theme)
export const DiscountTag3D: React.FC<{ externalHover?: boolean }> = ({ externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover ?? internalHover;

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer flex items-center justify-center select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <IconRippleEffect isHovered={isHovered} color="#f43f5e" />
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(244,63,94,0.25)] relative z-10">
        <ellipse cx="50" cy="80" rx="28" ry="6" fill="#cbd5e1" opacity="0.5" />
        <motion.g animate={{ y: isHovered ? -8 : 0, rotateZ: isHovered ? 14 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
          {/* Coupon Tag */}
          <path d="M 25,35 L 55,20 L 78,43 L 48,58 Z" fill="#f43f5e" />
          {/* Top punch hole */}
          <circle cx="33" cy="33" r="3.5" fill="#f1f5f9" />
          {/* Dotted border line */}
          <path d="M 32,38 L 52,28 L 72,48 L 52,58 Z" fill="none" stroke="#fecdd3" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Percentage text label or symbol inside */}
          <text x="42" y="48" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif" transform="rotate(15 50 48)">%</text>
        </motion.g>
      </svg>
    </div>
  );
};

