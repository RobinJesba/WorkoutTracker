"use client";

import React, { useState } from "react";
import { AthleteProfile } from "@/types/workout";
import { 
  User, 
  ShareNetwork, 
  Check, 
  Eye, 
  Lightning,
  Sparkle
} from "@phosphor-icons/react";

interface HeaderProps {
  profile: AthleteProfile;
  isTrainerView: boolean;
  onToggleTrainerView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isTrainerView,
  onToggleTrainerView,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Athlete / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-lime-400 font-mono font-bold text-lg shadow-inner">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-100">
                {profile.name}
              </h1>
              <span className="text-xs font-mono text-zinc-400">
                {profile.handle}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-lime-400/10 text-lime-400 border border-lime-400/20">
                <Lightning size={12} weight="fill" /> Active Cycle
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[280px] sm:max-w-md">
              {profile.currentCycle} • Trainer: <span className="text-zinc-200">{profile.trainerName}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions & View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Trainer Mode Toggle */}
          <button
            onClick={onToggleTrainerView}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
              isTrainerView
                ? "bg-lime-400 text-zinc-950 border-lime-400 shadow-[0_0_15px_rgba(212,255,0,0.25)] font-semibold"
                : "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <Eye size={15} weight={isTrainerView ? "bold" : "regular"} />
            <span>{isTrainerView ? "Trainer Portal View" : "Athlete View"}</span>
          </button>

          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors"
            title="Copy shareable link for trainer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-lime-400" weight="bold" />
                <span className="text-lime-400">Copied!</span>
              </>
            ) : (
              <>
                <ShareNetwork size={14} />
                <span>Share with Coach</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
