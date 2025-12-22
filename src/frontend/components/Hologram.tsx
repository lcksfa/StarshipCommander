import React from "react";

const Hologram: React.FC = () => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 hidden lg:block z-0">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-[spin_60s_linear_infinite]"
      >
        <defs>
          <radialGradient
            id="holoGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbital Rings */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.5"
          strokeDasharray="10 5"
          opacity="0.5"
        />
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.8"
          strokeDasharray="2 4"
          opacity="0.6"
        />

        {/* Central Planet Grid */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="url(#holoGradient)"
          opacity="0.3"
        />
        <path
          d="M60 100 Q100 140 140 100 T60 100"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.6"
        />
        <path
          d="M60 100 Q100 60 140 100 T60 100"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.6"
        />
        <line
          x1="100"
          y1="60"
          x2="100"
          y2="140"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Decorative Elements */}
        <rect
          x="20"
          y="90"
          width="10"
          height="20"
          stroke="#22d3ee"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
        <rect
          x="170"
          y="90"
          width="10"
          height="20"
          stroke="#22d3ee"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default Hologram;
