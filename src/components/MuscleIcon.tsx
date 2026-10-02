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
  | "shoulders"
  | "full-body";

type MuscleStatus = "PRIMARY" | "SECONDARY" | "INACTIVE";

interface MuscleIconProps {
  targetMuscles?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  muscleGroup?: MuscleGroup | string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  showBadge?: boolean;
}

export const MuscleIcon: React.FC<MuscleIconProps> = ({
  targetMuscles = [],
  primaryMuscles,
  secondaryMuscles,
  muscleGroup = "",
  size = 24,
  width,
  height,
  className = "",
  showBadge = true,
}) => {
  const primaryList =
    primaryMuscles && primaryMuscles.length > 0 ? primaryMuscles : targetMuscles;
  const secondaryList = secondaryMuscles || [];
  const hasExplicitLists =
    (primaryMuscles && primaryMuscles.length > 0) ||
    (secondaryMuscles && secondaryMuscles.length > 0);

  const checkStatus = (pattern: RegExp): MuscleStatus => {
    // 1. Primary list always takes highest priority
    if (primaryList.some((m) => pattern.test(m))) {
      return "PRIMARY";
    }
    // 2. Secondary list takes priority over fallback muscleGroup
    if (secondaryList.some((m) => pattern.test(m))) {
      return "SECONDARY";
    }
    // 3. Fallback to muscleGroup ONLY if neither primary nor secondary lists are defined
    if (!hasExplicitLists && pattern.test(muscleGroup)) {
      return "PRIMARY";
    }
    return "INACTIVE";
  };

  // --- Anterior (Front) Muscles ---
  const quadsStatus = checkStatus(/quad/i);
  const chestStatus = checkStatus(/chest|pec/i);
  const coreStatus = checkStatus(/core|abs|abdominal|stomach/i);
  const bicepsStatus =
    checkStatus(/bicep/i) !== "INACTIVE"
      ? checkStatus(/bicep/i)
      : checkStatus(/arm/i);
  const frontDeltsStatus = checkStatus(/shoulder|delt/i);
  const frontCalvesStatus =
    checkStatus(/calf|calves/i) !== "INACTIVE"
      ? checkStatus(/calf|calves/i)
      : !hasExplicitLists && muscleGroup === "legs"
      ? "PRIMARY"
      : "INACTIVE";

  // --- Posterior (Back) Muscles with Strict Separation ---
  const trapsStatus = checkStatus(/trap/i);
  const isGeneralBack =
    !hasExplicitLists && (primaryList.some((m) => /^back$/i.test(m)) || muscleGroup === "back");

  // Lats (outer wings)
  const latsStatus: MuscleStatus = (() => {
    if (primaryList.some((m) => /lat/i.test(m))) return "PRIMARY";
    if (secondaryList.some((m) => /lat/i.test(m))) return "SECONDARY";
    if (isGeneralBack && !primaryList.some((m) => /upper back|scapula|rhomboid|trap/i.test(m))) {
      return "PRIMARY";
    }
    return "INACTIVE";
  })();

  // Upper Back / Scapula (central diamond & shoulder blades)
  const upperBackStatus: MuscleStatus = (() => {
    if (primaryList.some((m) => /upper back|scapula|rhomboid|trap/i.test(m))) return "PRIMARY";
    if (secondaryList.some((m) => /upper back|scapula|rhomboid|trap/i.test(m))) return "SECONDARY";
    if (isGeneralBack && !primaryList.some((m) => /lat/i.test(m))) {
      return "PRIMARY";
    }
    return "INACTIVE";
  })();

  const rearDeltsStatus = checkStatus(/shoulder|delt/i);
  const tricepsStatus = checkStatus(/tricep/i);
  const glutesStatus = checkStatus(/glute/i);
  const hamstringsStatus = checkStatus(/hamstring/i);
  const backCalvesStatus =
    checkStatus(/calf|calves/i) !== "INACTIVE"
      ? checkStatus(/calf|calves/i)
      : !hasExplicitLists && muscleGroup === "legs"
      ? "PRIMARY"
      : "INACTIVE";

  // Check if either side has Primary or Secondary active muscles
  const isFrontPrimary = [
    quadsStatus,
    chestStatus,
    coreStatus,
    bicepsStatus,
    frontDeltsStatus,
    frontCalvesStatus,
  ].some((s) => s === "PRIMARY");

  const isFrontSecondary = [
    quadsStatus,
    chestStatus,
    coreStatus,
    bicepsStatus,
    frontDeltsStatus,
    frontCalvesStatus,
  ].some((s) => s === "SECONDARY");

  const isBackPrimary = [
    upperBackStatus,
    latsStatus,
    trapsStatus,
    rearDeltsStatus,
    tricepsStatus,
    glutesStatus,
    hamstringsStatus,
    backCalvesStatus,
  ].some((s) => s === "PRIMARY");

  const isBackSecondary = [
    upperBackStatus,
    latsStatus,
    trapsStatus,
    rearDeltsStatus,
    tricepsStatus,
    glutesStatus,
    hamstringsStatus,
    backCalvesStatus,
  ].some((s) => s === "SECONDARY");

  const primaryColor = "#34d399"; // emerald-400 (vibrant solid neon)
  const secondaryColor = "rgba(52, 211, 153, 0.22)"; // soft translucent emerald
  const secondaryStroke = "#34d399"; // delicate emerald border
  const inactiveColor = "#3f3f46"; // zinc-700
  const inactiveLine = "#27272a"; // zinc-800
  const inactiveHead = "#52525b"; // zinc-600

  const primaryGlow = "drop-shadow(0 0 3px rgba(52, 211, 153, 0.75))";

  const getFill = (status: MuscleStatus) => {
    if (status === "PRIMARY") return primaryColor;
    if (status === "SECONDARY") return secondaryColor;
    return inactiveColor;
  };

  const getStroke = (status: MuscleStatus) => {
    if (status === "SECONDARY") return secondaryStroke;
    return "none";
  };

  const getStrokeWidth = (status: MuscleStatus) => {
    if (status === "SECONDARY") return 0.5;
    return undefined;
  };

  const getFilter = (status: MuscleStatus) => {
    if (status === "PRIMARY") return primaryGlow;
    return undefined;
  };

  // Dual figure SVG dimensions
  const svgWidth = width || (size ? Math.round(size * 2.25) : 54);
  const svgHeight = height || (size ? Math.round(size * 1.45) : 35);

  return (
    <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 76 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dual anatomical front and back view"
      >
        {/* ======================================================== */}
        {/* ============== LEFT FIGURE: ANTERIOR (FRONT) ============ */}
        {/* ======================================================== */}

        {/* Head & Neck */}
        <circle cx="20" cy="5" r="3.4" fill={inactiveHead} />
        <rect x="18.5" y="8.4" width="3" height="2.2" rx="0.5" fill={inactiveHead} />

        {/* Shoulders (Front Deltoids) */}
        <path
          d="M15 11 C13 11, 11 12.5, 10 15 L12 18 L14.5 13 Z"
          fill={getFill(frontDeltsStatus)}
          stroke={getStroke(frontDeltsStatus)}
          strokeWidth={getStrokeWidth(frontDeltsStatus)}
          style={{ filter: getFilter(frontDeltsStatus) }}
        />
        <path
          d="M25 11 C27 11, 29 12.5, 30 15 L28 18 L25.5 13 Z"
          fill={getFill(frontDeltsStatus)}
          stroke={getStroke(frontDeltsStatus)}
          strokeWidth={getStrokeWidth(frontDeltsStatus)}
          style={{ filter: getFilter(frontDeltsStatus) }}
        />

        {/* Arms (Biceps) */}
        <path
          d="M10 15.5 L8.5 24 C8.2 25.5, 9.5 26.5, 10.5 25.5 L12 20 L11.5 16 Z"
          fill={getFill(bicepsStatus)}
          stroke={getStroke(bicepsStatus)}
          strokeWidth={getStrokeWidth(bicepsStatus)}
          style={{ filter: getFilter(bicepsStatus) }}
        />
        <path
          d="M30 15.5 L31.5 24 C31.8 25.5, 30.5 26.5, 29.5 25.5 L28 20 L28.5 16 Z"
          fill={getFill(bicepsStatus)}
          stroke={getStroke(bicepsStatus)}
          strokeWidth={getStrokeWidth(bicepsStatus)}
          style={{ filter: getFilter(bicepsStatus) }}
        />

        {/* Chest (Left & Right Pectorals with sternum divide) */}
        <path
          d="M15.2 11.5 H19.5 V17.5 H16 C15.2 16.5, 14.8 13.5, 15.2 11.5 Z"
          fill={getFill(chestStatus)}
          stroke={getStroke(chestStatus)}
          strokeWidth={getStrokeWidth(chestStatus)}
          style={{ filter: getFilter(chestStatus) }}
        />
        <path
          d="M24.8 11.5 H20.5 V17.5 H24 C24.8 16.5, 25.2 13.5, 24.8 11.5 Z"
          fill={getFill(chestStatus)}
          stroke={getStroke(chestStatus)}
          strokeWidth={getStrokeWidth(chestStatus)}
          style={{ filter: getFilter(chestStatus) }}
        />

        {/* Core / Abdominals */}
        <path
          d="M16.5 18 H23.5 L22.8 24 H17.2 L16.5 18 Z"
          fill={getFill(coreStatus)}
          stroke={getStroke(coreStatus)}
          strokeWidth={getStrokeWidth(coreStatus)}
          style={{ filter: getFilter(coreStatus) }}
        />
        {/* Abdominal dividing lines */}
        <line x1="20" y1="18" x2="20" y2="23.5" stroke={inactiveLine} strokeWidth="0.6" />
        <line x1="17.5" y1="20" x2="22.5" y2="20" stroke={inactiveLine} strokeWidth="0.6" />
        <line x1="17.8" y1="22" x2="22.2" y2="22" stroke={inactiveLine} strokeWidth="0.6" />

        {/* Pelvis / Hips */}
        <path d="M16.5 24.2 H23.5 L23 27.2 H17 L16.5 24.2 Z" fill={inactiveColor} />

        {/* Quadriceps (Front Thighs) */}
        <path
          d="M16 27.8 C15.5 28.5, 14.5 32, 14.8 35.5 C15 36.5, 17.8 36.5, 18.4 35.5 L18.8 28 Z"
          fill={getFill(quadsStatus)}
          stroke={getStroke(quadsStatus)}
          strokeWidth={getStrokeWidth(quadsStatus)}
          style={{ filter: getFilter(quadsStatus) }}
        />
        <path
          d="M24 27.8 C24.5 28.5, 25.5 32, 25.2 35.5 C25 36.5, 22.2 36.5, 21.6 35.5 L21.2 28 Z"
          fill={getFill(quadsStatus)}
          stroke={getStroke(quadsStatus)}
          strokeWidth={getStrokeWidth(quadsStatus)}
          style={{ filter: getFilter(quadsStatus) }}
        />

        {/* Patella / Kneecaps (Key Anterior Anchor) */}
        <circle cx="16.6" cy="36.8" r="1.1" fill={inactiveHead} />
        <circle cx="23.4" cy="36.8" r="1.1" fill={inactiveHead} />

        {/* Shins & Calves */}
        <path
          d="M15.4 38.2 C15.2 41, 15.8 44, 16.2 45.5 C16.5 46.2, 17.5 46.2, 17.8 45.5 L18.1 38.2 Z"
          fill={getFill(frontCalvesStatus)}
          stroke={getStroke(frontCalvesStatus)}
          strokeWidth={getStrokeWidth(frontCalvesStatus)}
          style={{ filter: getFilter(frontCalvesStatus) }}
        />
        <path
          d="M24.6 38.2 C24.8 41, 24.2 44, 23.8 45.5 C23.5 46.2, 22.5 46.2, 22.2 45.5 L21.9 38.2 Z"
          fill={getFill(frontCalvesStatus)}
          stroke={getStroke(frontCalvesStatus)}
          strokeWidth={getStrokeWidth(frontCalvesStatus)}
          style={{ filter: getFilter(frontCalvesStatus) }}
        />

        {/* Subtle center divider between FRONT and BACK figures */}
        <line x1="38" y1="8" x2="38" y2="44" stroke="#27272a" strokeWidth="0.6" strokeDasharray="1.5 2" />

        {/* ======================================================== */}
        {/* ============= RIGHT FIGURE: POSTERIOR (BACK) ============ */}
        {/* ======================================================== */}

        {/* Back of Head */}
        <circle cx="56" cy="5" r="3.4" fill={inactiveHead} />

        {/* Trapezius Neck Taper */}
        <path
          d="M53 8.5 L59 8.5 L60.5 11.5 L51.5 11.5 Z"
          fill={getFill(trapsStatus)}
          stroke={getStroke(trapsStatus)}
          strokeWidth={getStrokeWidth(trapsStatus)}
        />

        {/* Rear Deltoids (Shoulders back) */}
        <path
          d="M51 11.5 C49 11.5, 47.2 13, 46.2 15.5 L48.2 18.5 L51 13.5 Z"
          fill={getFill(rearDeltsStatus)}
          stroke={getStroke(rearDeltsStatus)}
          strokeWidth={getStrokeWidth(rearDeltsStatus)}
          style={{ filter: getFilter(rearDeltsStatus) }}
        />
        <path
          d="M61 11.5 C63 11.5, 64.8 13, 65.8 15.5 L63.8 18.5 L61 13.5 Z"
          fill={getFill(rearDeltsStatus)}
          stroke={getStroke(rearDeltsStatus)}
          strokeWidth={getStrokeWidth(rearDeltsStatus)}
          style={{ filter: getFilter(rearDeltsStatus) }}
        />

        {/* Triceps (Back of arms) */}
        <path
          d="M46.2 16 L44.8 24.5 C44.5 25.8, 45.8 26.5, 46.8 25.5 L48 20.5 L47.6 16.5 Z"
          fill={getFill(tricepsStatus)}
          stroke={getStroke(tricepsStatus)}
          strokeWidth={getStrokeWidth(tricepsStatus)}
          style={{ filter: getFilter(tricepsStatus) }}
        />
        <path
          d="M65.8 16 L67.2 24.5 C67.5 25.8, 66.2 26.5, 65.2 25.5 L64 20.5 L64.4 16.5 Z"
          fill={getFill(tricepsStatus)}
          stroke={getStroke(tricepsStatus)}
          strokeWidth={getStrokeWidth(tricepsStatus)}
          style={{ filter: getFilter(tricepsStatus) }}
        />

        {/* Upper Back / Scapula & Rhomboids (Medial Upper Diamond within torso) */}
        {/* Left Scapular Plate */}
        <path
          d="M53.5 12 L51.5 13.5 L52.2 17 L55.5 16.5 Z"
          fill={getFill(upperBackStatus)}
          stroke={getStroke(upperBackStatus)}
          strokeWidth={getStrokeWidth(upperBackStatus)}
          style={{ filter: getFilter(upperBackStatus) }}
        />
        {/* Right Scapular Plate */}
        <path
          d="M58.5 12 L60.5 13.5 L59.8 17 L56.5 16.5 Z"
          fill={getFill(upperBackStatus)}
          stroke={getStroke(upperBackStatus)}
          strokeWidth={getStrokeWidth(upperBackStatus)}
          style={{ filter: getFilter(upperBackStatus) }}
        />
        {/* Central Upper Trapezius Diamond */}
        <path
          d="M53.5 11.5 L56 9.5 L58.5 11.5 L56 16 Z"
          fill={getFill(upperBackStatus !== "INACTIVE" ? upperBackStatus : trapsStatus)}
          stroke={getStroke(upperBackStatus !== "INACTIVE" ? upperBackStatus : trapsStatus)}
          strokeWidth={getStrokeWidth(upperBackStatus !== "INACTIVE" ? upperBackStatus : trapsStatus)}
          style={{ filter: getFilter(upperBackStatus !== "INACTIVE" ? upperBackStatus : trapsStatus) }}
        />

        {/* Latissimus Dorsi (STRICTLY WITHIN TORSO BOUNDARY - Flush with body flank) */}
        {/* Left Lat: Fits flush along the left flank from underarm down to waist */}
        <path
          d="M51.2 14.5 C51.4 17.5, 52 20.5, 52.8 23.5 H55.5 V17 L52.8 15 Z"
          fill={getFill(latsStatus)}
          stroke={getStroke(latsStatus)}
          strokeWidth={getStrokeWidth(latsStatus)}
          style={{ filter: getFilter(latsStatus) }}
        />
        {/* Right Lat: Fits flush along the right flank from underarm down to waist */}
        <path
          d="M60.8 14.5 C60.6 17.5, 60 20.5, 59.2 23.5 H56.5 V17 L59.2 15 Z"
          fill={getFill(latsStatus)}
          stroke={getStroke(latsStatus)}
          strokeWidth={getStrokeWidth(latsStatus)}
          style={{ filter: getFilter(latsStatus) }}
        />

        {/* Lower Back / Thoracolumbar base */}
        <path d="M52.8 23.5 H59.2 L58.8 24.4 H53.2 Z" fill={inactiveColor} />

        {/* Spine Channel (Clear Posterior Midline Anchor) */}
        <line x1="56" y1="11.5" x2="56" y2="24" stroke={inactiveLine} strokeWidth="0.8" />

        {/* Glutes (Double curved buttocks - Unmistakable Posterior Anchor) */}
        <path
          d="M52.5 24.5 C51 25.5, 51 28.5, 52.2 29.5 C53.5 30.5, 55.5 29.8, 55.8 27.5 L55.8 24.5 Z"
          fill={getFill(glutesStatus)}
          stroke={getStroke(glutesStatus)}
          strokeWidth={getStrokeWidth(glutesStatus)}
          style={{ filter: getFilter(glutesStatus) }}
        />
        <path
          d="M59.5 24.5 C61 25.5, 61 28.5, 59.8 29.5 C58.5 30.5, 56.5 29.8, 56.2 27.5 L56.2 24.5 Z"
          fill={getFill(glutesStatus)}
          stroke={getStroke(glutesStatus)}
          strokeWidth={getStrokeWidth(glutesStatus)}
          style={{ filter: getFilter(glutesStatus) }}
        />
        {/* Gluteal Crease Line */}
        <line x1="56" y1="24.5" x2="56" y2="29.2" stroke={inactiveLine} strokeWidth="0.8" />

        {/* Hamstrings (Back of Thighs) */}
        <path
          d="M51.8 30 C51.2 31.5, 50.6 34.5, 51 36 C51.5 36.8, 54 36.8, 54.5 36 L54.8 30 Z"
          fill={getFill(hamstringsStatus)}
          stroke={getStroke(hamstringsStatus)}
          strokeWidth={getStrokeWidth(hamstringsStatus)}
          style={{ filter: getFilter(hamstringsStatus) }}
        />
        <path
          d="M60.2 30 C60.8 31.5, 61.4 34.5, 61 36 C60.5 36.8, 58 36.8, 57.5 36 L57.2 30 Z"
          fill={getFill(hamstringsStatus)}
          stroke={getStroke(hamstringsStatus)}
          strokeWidth={getStrokeWidth(hamstringsStatus)}
          style={{ filter: getFilter(hamstringsStatus) }}
        />

        {/* Calves (Diamond gastrocnemius split on back of lower legs) */}
        <path
          d="M51.2 37.5 C50.8 40.5, 51.5 43.5, 52 45.5 C52.3 46.2, 53.5 46.2, 53.8 45.5 L54.2 37.5 Z"
          fill={getFill(backCalvesStatus)}
          stroke={getStroke(backCalvesStatus)}
          strokeWidth={getStrokeWidth(backCalvesStatus)}
          style={{ filter: getFilter(backCalvesStatus) }}
        />
        <path
          d="M60.8 37.5 C61.2 40.5, 60.5 43.5, 60 45.5 C59.7 46.2, 58.5 46.2, 58.2 45.5 L57.8 37.5 Z"
          fill={getFill(backCalvesStatus)}
          stroke={getStroke(backCalvesStatus)}
          strokeWidth={getStrokeWidth(backCalvesStatus)}
          style={{ filter: getFilter(backCalvesStatus) }}
        />
      </svg>

      {/* Dual Labels with Smart Activity Cues (Primary vs Secondary) */}
      {showBadge && (
        <div className="grid grid-cols-2 w-full text-center mt-0.5 text-[7px] font-mono tracking-wider font-semibold select-none">
          <span
            className={
              isFrontPrimary
                ? "text-emerald-400 font-bold"
                : isFrontSecondary
                ? "text-zinc-500 font-medium"
                : "text-zinc-700"
            }
          >
            FRONT
          </span>
          <span
            className={
              isBackPrimary
                ? "text-emerald-400 font-bold"
                : isBackSecondary
                ? "text-zinc-500 font-medium"
                : "text-zinc-700"
            }
          >
            BACK
          </span>
        </div>
      )}
    </div>
  );
};
