import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  theme = 'dark',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Emblem based on the official Gen Solves brand asset */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Neon Green Sparkle / Star */}
        <path
          d="M38 6 C38 17 46 22 57 22 C46 22 38 27 38 38 C38 27 30 22 19 22 C30 22 38 17 38 6 Z"
          fill="#38EF7D"
        />

        {/* Upper Electric Blue Chevron */}
        <path
          d="M66 43 L28 54 L64 64"
          stroke="#1D63FF"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upper tip circular connector */}
        <circle cx="64" cy="64" r="4.5" fill="#1D63FF" />

        {/* Lower Navy Circuit Arm with Node */}
        <line
          x1="16"
          y1="80"
          x2="56"
          y2="66"
          stroke={theme === 'dark' ? '#94A3B8' : '#0B132B'}
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <circle
          cx="16"
          cy="80"
          r="6.5"
          fill={theme === 'dark' ? '#0F172A' : '#FFFFFF'}
          stroke={theme === 'dark' ? '#94A3B8' : '#0B132B'}
          strokeWidth="4"
        />
      </svg>

      {showText && (
        <span
          className={`font-black tracking-tight ${textSizes[size]} leading-none`}
        >
          <span className={theme === 'dark' ? 'text-neutral-100' : 'text-slate-900'}>
            Gen
          </span>
          <span className="text-[#1D63FF] ml-1">Solves</span>
        </span>
      )}
    </div>
  );
};
