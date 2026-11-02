import React from 'react';

interface DiginoronLogoProps {
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  layout?: 'stacked' | 'horizontal' | 'icon';
  showSubtitle?: boolean;
  onClick?: () => void;
}

export const DiginoronLogo: React.FC<DiginoronLogoProps> = ({
  theme = 'light',
  className = '',
  size = 'md',
  layout = 'stacked',
  showSubtitle = true,
  onClick,
}) => {
  const isDark = theme === 'dark';

  // Dimension scaling
  const iconSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 72,
    '2xl': 100,
  };

  const currentIconSize = iconSizes[size] || 40;

  // Text sizing
  const titleSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-4xl',
  };

  const subtitleSizeClasses = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base',
  };

  // Modern Minimalist Neural Trade Vector Emblem
  const LogoEmblem = () => (
    <svg
      width={currentIconSize}
      height={currentIconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 ease-out group-hover:scale-105 select-none"
    >
      <defs>
        {/* Dynamic Royal Blue to Vivid Cyan (AI Neural Synapse) */}
        <linearGradient id="dn-grad-blue" x1="10" y1="15" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Global Trade & Capital Momentum Gradient (Emerald to Teal & Sky) */}
        <linearGradient id="dn-grad-trade" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="75%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        {/* Floating Ring & Glow Gradients */}
        <linearGradient id="dn-grad-glow" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
        </linearGradient>

        {/* Outer Hex-Shield Subtle Border */}
        <linearGradient id="dn-shield-stroke" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#3b82f6'} stopOpacity="0.8" />
          <stop offset="50%" stopColor={isDark ? '#0284c7' : '#0ea5e9'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} stopOpacity="0.15" />
        </linearGradient>

        {/* Soft Drop Shadow for High Dimensionality */}
        <filter id="dn-shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor={isDark ? '#0284c7' : '#0369a1'} floodOpacity="0.35" />
        </filter>

        {/* Neural Point Core Pulse */}
        <filter id="dn-node-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded Hexagonal Base Shield */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        fill={isDark ? '#090e1a' : '#ffffff'}
        stroke="url(#dn-shield-stroke)"
        strokeWidth="1.5"
        className="transition-colors duration-300"
      />

      {/* Subtle Inner Ambient Glow */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="url(#dn-grad-glow)"
        opacity={isDark ? '0.18' : '0.12'}
      />

      {/* Neural AI Synaptic Interconnects (Geometrically balanced curves) */}
      <g stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1.5" strokeDasharray="3 3">
        <circle cx="50" cy="50" r="26" fill="none" />
      </g>

      {/* Continuous Dynamic Trade & Neural Ribbon (Mobius / Stylized N-D Interlock) */}
      <g filter="url(#dn-shadow)">
        {/* Left Trade Arc (Rising trade momentum) */}
        <path
          d="M 26,68 C 21,50 32,30 48,24 C 62,19 74,27 75,40 C 76,52 64,62 50,65 C 38,67 27,62 26,68 Z"
          fill="url(#dn-grad-blue)"
          opacity="0.95"
        />

        {/* Right Fluid Loop (Neural cross-flow & market liquidity) */}
        <path
          d="M 74,32 C 79,50 68,70 52,76 C 38,81 26,73 25,60 C 24,48 36,38 50,35 C 62,33 73,38 74,32 Z"
          fill="url(#dn-grad-trade)"
          opacity="0.88"
        />

        {/* Center Intersecting Precision Diamond Core (Neural Processor Hub) */}
        <path
          d="M 50,38 L 61,50 L 50,62 L 39,50 Z"
          fill={isDark ? '#0f172a' : '#ffffff'}
          stroke="url(#dn-grad-blue)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="3.5" fill="#38bdf8" />
      </g>

      {/* Active Intelligence Nodes (Grounded Synaptic Touchpoints) */}
      <g filter="url(#dn-node-glow)">
        {/* Top-Right Forward Node */}
        <circle cx="70" cy="28" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        {/* Bottom-Left Origin Node */}
        <circle cx="30" cy="72" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
        {/* Top-Left Ascent Node */}
        <circle cx="34" cy="30" r="3" fill="#60a5fa" />
        {/* Bottom-Right Settlement Node */}
        <circle cx="66" cy="70" r="3" fill="#34d399" />
      </g>

      {/* Upward Growth Micro-Vector Indicator */}
      <path
        d="M 68,23 L 75,22 L 74,29"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // High-End Typography Component
  const BrandText = ({ align = 'center' }: { align?: 'center' | 'left' | 'right' }) => (
    <div 
      dir="ltr"
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left'} leading-none select-none`}
    >
      <div 
        dir="ltr"
        className={`font-black tracking-tight font-sans ${titleSizeClasses[size] || 'text-base'} flex flex-row items-center gap-1.5`}
      >
        {/* DigiNoron Brand Name - Strictly LTR */}
        <span className="inline-flex flex-row items-center" dir="ltr">
          <span className={`${isDark ? 'text-white' : 'text-slate-900'} transition-colors duration-200`}>
            Digi
          </span>
          <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 bg-clip-text text-transparent font-extrabold">
            Noron
          </span>
        </span>
        {/* Trading Capsule Tag */}
        <span className={`text-[10px] tracking-widest font-mono uppercase px-1.5 py-0.5 rounded-md font-bold transition-all ${
          isDark
            ? 'bg-blue-500/15 text-sky-400 border border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border border-blue-200/80'
        }`}>
          Trade
        </span>
      </div>

      {showSubtitle && (
        <div 
          dir="ltr"
          className={`flex flex-row items-center gap-1.5 mt-1 font-sans ${subtitleSizeClasses[size] || 'text-[10px]'} font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="tracking-[0.16em] uppercase">Smart Trade Intelligence</span>
        </div>
      )}
    </div>
  );

  // Stacked Layout (Emblem on top, Brand Text below)
  if (layout === 'stacked') {
    return (
      <div 
        onClick={onClick}
        dir="ltr"
        className={`inline-flex flex-col items-center justify-center gap-2 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <LogoEmblem />
        <BrandText align="center" />
      </div>
    );
  }

  // Horizontal Layout (Emblem side-by-side with text - ideal for Navbar/Header)
  if (layout === 'horizontal') {
    return (
      <div 
        onClick={onClick}
        dir="ltr"
        className={`inline-flex flex-row items-center gap-3 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <LogoEmblem />
        <BrandText align="left" />
      </div>
    );
  }

  // Icon only layout
  return (
    <div 
      onClick={onClick}
      dir="ltr"
      className={`inline-flex items-center justify-center group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title="DigiNoron Trading"
    >
      <LogoEmblem />
    </div>
  );
};
