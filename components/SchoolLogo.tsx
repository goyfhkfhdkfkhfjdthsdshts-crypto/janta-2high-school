'use client';

import React from 'react';

interface SchoolLogoProps {
  size?: number | string;
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function SchoolLogo({
  size = 56,
  showText = false,
  showTagline = false,
  className = '',
  orientation = 'horizontal',
}: SchoolLogoProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  const svgEmblem = (
    <svg
      viewBox="0 0 240 240"
      className="shrink-0 drop-shadow-sm select-none"
      style={{ width: pixelSize, height: pixelSize }}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Janta +2 High School Khalari Logo"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="navyRadial" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="torchFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        {/* Text Paths */}
        <path
          id="upperArc"
          d="M 32 120 A 88 88 0 0 1 208 120"
          fill="none"
        />
        <path
          id="lowerArc"
          d="M 40 120 A 80 80 0 0 0 200 120"
          fill="none"
        />
      </defs>

      {/* Outer Golden Fluted Ring */}
      <circle cx="120" cy="120" r="114" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />
      <circle cx="120" cy="120" r="110" fill="none" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3,3" />

      {/* Deep Navy Ring Container */}
      <circle cx="120" cy="120" r="106" fill="url(#navyRadial)" />

      {/* Upper Text: JANTA +2 HIGH SCHOOL */}
      <text
        fill="#fef08a"
        fontSize="12.5"
        fontWeight="800"
        letterSpacing="2.5"
        fontFamily="sans-serif"
      >
        <textPath href="#upperArc" startOffset="50%" textAnchor="middle">
          ★ JANTA +2 HIGH SCHOOL ★
        </textPath>
      </text>

      {/* Lower Text: KHALARI, RANCHI */}
      <text
        fill="#ffffff"
        fontSize="11"
        fontWeight="700"
        letterSpacing="3"
        fontFamily="sans-serif"
      >
        <textPath href="#lowerArc" startOffset="50%" textAnchor="middle">
          KHALARI • JHARKHAND
        </textPath>
      </text>

      {/* Inner Golden Crest Ring */}
      <circle cx="120" cy="120" r="70" fill="#ffffff" stroke="url(#goldGradient)" strokeWidth="3" />

      {/* Laurel Wreath in Center */}
      <g stroke="#ca8a04" strokeWidth="1.5" fill="#fef9c3" opacity="0.9">
        <path d="M 68 125 C 68 145, 85 160, 105 165 C 95 155, 92 140, 92 125 Z" />
        <path d="M 172 125 C 172 145, 155 160, 135 165 C 145 155, 148 140, 148 125 Z" />
      </g>

      {/* Rising Sun Rays behind Torch */}
      <g stroke="#fde047" strokeWidth="1.5" opacity="0.75">
        <line x1="120" y1="85" x2="120" y2="70" />
        <line x1="105" y1="90" x2="95" y2="80" />
        <line x1="135" y1="90" x2="145" y2="80" />
        <line x1="95" y1="102" x2="82" y2="98" />
        <line x1="145" y1="102" x2="158" y2="98" />
      </g>

      {/* Blazing Torch of Wisdom */}
      {/* Torch Handle */}
      <path d="M 116 112 L 124 112 L 122 135 L 118 135 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
      <polygon points="113,112 127,112 125,106 115,106" fill="url(#goldGradient)" />
      {/* Flame */}
      <path
        d="M 120 74 C 114 84, 110 94, 115 106 C 118 106, 122 103, 120 97 C 124 99, 126 103, 125 106 C 130 94, 126 84, 120 74 Z"
        fill="url(#torchFlame)"
      />

      {/* Open Book of Knowledge */}
      <g transform="translate(0, 15)">
        {/* Book Base / Pages */}
        <path
          d="M 88 126 Q 120 128 120 140 Q 120 128 152 126 Q 152 144 120 146 Q 88 144 88 126 Z"
          fill="#0284c7"
          stroke="#0369a1"
          strokeWidth="1"
        />
        <path
          d="M 90 123 Q 120 125 120 137 Q 120 125 150 123 L 150 140 Q 120 142 120 137 Q 120 142 90 140 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {/* Book Center Spine */}
        <line x1="120" y1="124" x2="120" y2="142" stroke="#0284c7" strokeWidth="1.5" />
      </g>

      {/* Motto Ribbon Banner across Bottom */}
      <g transform="translate(0, 10)">
        {/* Banner Tails */}
        <polygon points="34,186 52,176 52,198 34,198" fill="#991b1b" />
        <polygon points="206,186 188,176 188,198 206,198" fill="#991b1b" />
        {/* Banner Body */}
        <path
          d="M 44 182 Q 120 174 196 182 L 192 200 Q 120 192 48 200 Z"
          fill="#b91c1c"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        {/* Banner Tagline */}
        <text
          x="120"
          y="194"
          fill="#ffffff"
          fontSize="9"
          fontWeight="bold"
          letterSpacing="1"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          शिक्षा • अनुशासन • सफलता
        </text>
      </g>

      {/* ESTD 1984 */}
      <text
        x="120"
        y="166"
        fill="#1e3a8a"
        fontSize="8"
        fontWeight="800"
        letterSpacing="1"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        ESTD 1984
      </text>
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{svgEmblem}</div>;
  }

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {svgEmblem}
        <div className="mt-2">
          <h1 className="font-extrabold tracking-tight text-slate-900 text-lg leading-tight uppercase">
            Janta +2 High School
          </h1>
          <p className="text-xs font-bold text-blue-700 tracking-wider uppercase">
            Khalari, Ranchi
          </p>
          {showTagline && (
            <p className="mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block border border-amber-200">
              शिक्षा • अनुशासन • सफलता
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {svgEmblem}
      <div className="flex flex-col min-w-0">
        <h1 className="font-extrabold tracking-tight text-slate-900 text-base leading-snug uppercase truncate">
          Janta +2 High School
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-800 tracking-wide uppercase">
            Khalari
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-semibold text-emerald-700">
            JAC Affiliated
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-medium text-amber-800 tracking-wide mt-0.5">
            शिक्षा • अनुशासन • सफलता
          </p>
        )}
      </div>
    </div>
  );
}
