"use client";

import React from "react";
import { 
  Barbell, 
  Footprints, 
  Flame, 
  TrendUp, 
  Clock 
} from "@phosphor-icons/react";

interface WeeklyStatsProps {
  stats: {
    sessionsThisWeek: number;
    targetSessions: number;
    adherencePercent: number;
    totalMinutes: number;
    hiitWorkMinutes: number;
    totalDistanceKm: number;
    totalStrengthSets: number;
    totalVolumeKg: number;
  };
  isTrainerView: boolean;
}

export const WeeklyStatsCard: React.FC<WeeklyStatsProps> = ({
  stats,
  isTrainerView,
}) => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Weekly Adherence & Load
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mt-0.5">
            Microcycle Performance Summary
          </h2>
        </div>

        {/* Adherence Badge & Target */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-400">Target: {stats.targetSessions} sessions/wk</div>
            <div className="font-mono text-sm font-semibold text-zinc-200">
              {stats.sessionsThisWeek} of {stats.targetSessions} Completed ({stats.adherencePercent}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono font-bold text-lime-400 text-sm">
            {stats.adherencePercent}%
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-5">
        {/* Metric 1: Threshold Interval Time */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-medium">Threshold Push</span>
            <Flame size={16} className="text-lime-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.hiitWorkMinutes}
            </span>
            <span className="text-xs text-zinc-400 font-mono">min @ 12kph</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">High-speed interval work</p>
        </div>

        {/* Metric 2: Total Cardio Distance */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-medium">Cardio Distance</span>
            <Footprints size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.totalDistanceKm}
            </span>
            <span className="text-xs text-zinc-400 font-mono">km</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Intervals & steady base</p>
        </div>

        {/* Metric 3: Total Strength Volume */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-medium">Strength Volume</span>
            <Barbell size={16} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {(stats.totalVolumeKg / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-zinc-400 font-mono">kg</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">{stats.totalStrengthSets} working sets completed</p>
        </div>

        {/* Metric 4: Total Time */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-medium">Time Under Tension</span>
            <Clock size={16} className="text-zinc-300" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {stats.totalMinutes}
            </span>
            <span className="text-xs text-zinc-400 font-mono">min</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Across 3 active sessions</p>
        </div>
      </div>

      {/* Progress Bar for the week */}
      <div className="mt-4 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span>Weekly Target Progress</span>
          <span className="font-mono text-zinc-300">{stats.sessionsThisWeek} / {stats.targetSessions} Workouts</span>
        </div>
        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/60">
          <div 
            className="bg-lime-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.adherencePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
