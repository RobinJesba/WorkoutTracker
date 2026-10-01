"use client";

import React from "react";

export type MuscleGroup = 
  | "quads" 
  | "glutes" 
  | "legs" 
  | "calves" 
  | "chest" 
  | "back" 
  | "arms" 
  | "core" 
  | "full-body";

interface MuscleIconProps {
  muscleGroup: MuscleGroup;
  size?: number;
  className?: string;
}

export const MuscleIcon: React.FC<MuscleIconProps> = ({
  muscleGroup,
  size = 28,
  className = "",
}) => {
  // Determine highlighted parts based on muscleGroup
  const isQuadsActive = muscleGroup === "quads" || muscleGroup === "legs" || muscleGroup === "full-body";
  const isCalvesActive = muscleGroup === "calves" || muscleGroup === "legs" || muscleGroup === "full-body";
  const isGlutesActive = muscleGroup === "glutes" || muscleGroup === "legs" || muscleGroup === "full-body";
  const isChestActive = muscleGroup === "chest" || muscleGroup === "full-body";
  const isBackActive = muscleGroup === "back" || muscleGroup === "full-body";
  const isCoreActive = muscleGroup === "core" || muscleGroup === "full-body";
  const isArmsActive = muscleGroup === "arms" || muscleGroup === "full-body";

  const activeColor = "#34d399"; // emerald-400
  const activeGlow = "drop-shadow(0 0 3px rgba(52, 211, 153, 0.6))";
  const inactiveColor = "#3f3f46"; // zinc-700
  const inactiveHead = "#52525b"; // zinc-600

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label={`Target muscle: ${muscleGroup}`}
    >
      {/* Head */}
      <circle cx="18" cy="5" r="3.5" fill={inactiveHead} />

      {/* Neck */}
      <rect x="16.5" y="8.5" width="3" height="2" rx="0.5" fill={inactiveHead} />

      {/* Shoulders & Torso base */}
      {/* Left Shoulder & Arm */}
      <path
        d="M13 11 C11 11, 9 13, 8 16 L6.5 24 C6.2 25.5, 7.5 26.5, 8.5 25.5 L10 20 L11.5 13 Z"
        fill={isArmsActive ? activeColor : inactiveColor}
        style={{ filter: isArmsActive ? activeGlow : undefined }}
      />

      {/* Right Shoulder & Arm */}
      <path
        d="M23 11 C25 11, 27 13, 28 16 L29.5 24 C29.8 25.5, 28.5 26.5, 27.5 25.5 L26 20 L24.5 13 Z"
        fill={isArmsActive ? activeColor : inactiveColor}
        style={{ filter: isArmsActive ? activeGlow : undefined }}
      />

      {/* Chest (Upper Torso) */}
      <path
        d="M12.5 11.5 H23.5 C24 13, 23.5 16.5, 22.5 18 H13.5 C12.5 16.5, 12 13, 12.5 11.5 Z"
        fill={isChestActive ? activeColor : inactiveColor}
        style={{ filter: isChestActive ? activeGlow : undefined }}
      />

      {/* Core / Abs (Mid Torso) */}
      <path
        d="M13.5 18.5 H22.5 L21.5 24 H14.5 L13.5 18.5 Z"
        fill={isCoreActive ? activeColor : inactiveColor}
        style={{ filter: isCoreActive ? activeGlow : undefined }}
      />

      {/* Pelvis / Hips */}
      <path
        d="M14 24.5 H22 L21.5 27.5 H14.5 L14 24.5 Z"
        fill={isGlutesActive ? activeColor : inactiveColor}
        style={{ filter: isGlutesActive ? activeGlow : undefined }}
      />

      {/* Left Upper Leg (Thigh / Quad) */}
      <path
        d="M13.5 28 C13.5 28, 12.5 32, 12.8 36 C13 37.5, 16 37.5, 16.5 36.5 L16.8 28.5 Z"
        fill={isQuadsActive ? activeColor : inactiveColor}
        style={{ filter: isQuadsActive ? activeGlow : undefined }}
      />

      {/* Right Upper Leg (Thigh / Quad) */}
      <path
        d="M22.5 28 C22.5 28, 23.5 32, 23.2 36 C23 37.5, 20 37.5, 19.5 36.5 L19.2 28.5 Z"
        fill={isQuadsActive ? activeColor : inactiveColor}
        style={{ filter: isQuadsActive ? activeGlow : undefined }}
      />

      {/* Left Lower Leg (Calf / Shin) */}
      <path
        d="M13.2 38 C13 41, 13.5 44, 14 45.5 C14.3 46.2, 15.7 46.2, 16 45.5 L16.3 38 Z"
        fill={isCalvesActive ? activeColor : inactiveColor}
        style={{ filter: isCalvesActive ? activeGlow : undefined }}
      />

      {/* Right Lower Leg (Calf / Shin) */}
      <path
        d="M22.8 38 C23 41, 22.5 44, 22 45.5 C21.7 46.2, 20.3 46.2, 20 45.5 L19.7 38 Z"
        fill={isCalvesActive ? activeColor : inactiveColor}
        style={{ filter: isCalvesActive ? activeGlow : undefined }}
      />
    </svg>
  );
};
