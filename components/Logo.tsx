
import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffb38a" />
        <stop offset="100%" stopColor="#5dbcd2" />
      </linearGradient>
    </defs>
    {/* Stylized 'B' with Flip Arrows */}
    <path 
      d="M35 75C25 75 20 65 20 50C20 35 25 25 35 25L70 25M35 25C45 25 55 35 55 50C55 65 45 75 35 75L70 75" 
      stroke="url(#logoGradient)" 
      strokeWidth="6" 
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-20"
    />
    {/* Top Arrow (Points Left) */}
    <path 
      d="M70 30C75 30 85 40 85 50C85 60 75 70 70 70" 
      stroke="url(#logoGradient)" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <path 
      d="M25 25L35 18V32L25 25Z" 
      fill="#ffb38a"
    />
    {/* Bottom Arrow (Points Right) */}
    <path 
      d="M15 50C15 65 20 80 35 80L55 80" 
      stroke="url(#logoGradient)" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <path 
      d="M65 80L55 73V87L65 80Z" 
      fill="#5dbcd2"
    />
    {/* Inner 'B' core */}
    <path 
      d="M35 35H60C68 35 68 48 60 50H35V65H60C68 65 68 52 60 50" 
      stroke="url(#logoGradient)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const LogoText: React.FC = () => (
  <div className="flex items-center">
    <span className="text-2xl font-light text-[#5dbcd2] tracking-tight">Flip</span>
    <span className="text-2xl font-black text-[#5dbcd2] tracking-tighter">Bazzar</span>
  </div>
);
