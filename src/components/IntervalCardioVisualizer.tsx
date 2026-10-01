"use client";

import React, { useState } from "react";
import { CardioIntervalBlock } from "@/types/workout";
import { 
  Timer, 
  Lightning, 
  Footprints, 
  ArrowsClockwise, 
  Gauge,
  ChartBar
} from "@phosphor-icons/react";

interface IntervalCardioVisualizerProps {
  cardioBlock: CardioIntervalBlock;
}

export const IntervalCardioVisualizer: React.FC<IntervalCardioVisualizerProps> = ({
  cardioBlock,
}) => {
  const [selectedSet, setSelectedSet] = useState<number | null>(null);

  const { workInterval, restInterval, metrics, totalSets } = cardioBlock;
  const isInterval = totalSets > 1;

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? "0" : ""}${remainingSec}`;
  };

  // Convert speed km/h to pace min/km
  const getPace = (speedKmh: number) => {
    if (speedKmh <= 0) return "--";
    const minutesPerKm = 60 / speedKmh;
    const mins = Math.floor(minutesPerKm);
    const secs = Math.round((minutesPerKm - mins) * 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs} /km`;
  };

  return (
    <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-4 sm:p-5 mt-4">
      {/* Header of the Interval Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/70 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20">
            <Timer size={18} weight="bold" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              {cardioBlock.name}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                {totalSets} Sets Interval
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              1:1 Work-to-Rest Ratio • High Intensity Interval Cardio
            </p>
          </div>
        </div>

        {/* Total Time & Distance Chips */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
            <span className="text-zinc-400">Total:</span>{" "}
            <span className="text-white font-medium">
              {Math.round(metrics.totalDurationSec / 60)} min
            </span>
          </div>
          <div className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
            <span className="text-zinc-400">Dist:</span>{" "}
            <span className="text-lime-400 font-medium">
              {metrics.estimatedDistanceKm} km
            </span>
          </div>
        </div>
      </div>

      {/* Visual Interval Profile (Speed Waves) */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Set-by-Set Speed Profile ({totalSets} intervals)
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Peak: <strong className="text-lime-400 font-semibold">{workInterval.speedKmh} km/h</strong> | Recovery: <strong className="text-zinc-300 font-medium">{restInterval.speedKmh} km/h</strong>
          </span>
        </div>

        {/* Interval Blocks Timeline */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: totalSets }).map((_, index) => {
            const setNum = index + 1;
            const isHovered = selectedSet === setNum;

            return (
              <button
                key={setNum}
                type="button"
                onClick={() => setSelectedSet(selectedSet === setNum ? null : setNum)}
                className={`flex flex-col rounded-lg p-2 transition-all duration-150 border text-left cursor-pointer ${
                  isHovered
                    ? "bg-zinc-800/90 border-lime-400 shadow-[0_0_12px_rgba(212,255,0,0.15)] ring-1 ring-lime-400"
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                  <span className="font-bold text-zinc-300">SET {setNum}</span>
                  <span className="text-[10px] text-zinc-400">4m</span>
                </div>

                {/* Work bar (Run) */}
                <div className="mb-1">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="text-lime-400 font-semibold">RUN</span>
                    <span className="text-zinc-300">{workInterval.speedKmh}kph</span>
                  </div>
                  <div className="w-full h-3 rounded bg-lime-400/20 border border-lime-400/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-lime-400/80 rounded" />
                  </div>
                  <div className="text-[9px] font-mono text-zinc-400 text-right mt-0.5">
                    {formatTime(workInterval.durationSec)}
                  </div>
                </div>

                {/* Rest bar (Walk) */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="text-zinc-400">WALK</span>
                    <span className="text-zinc-400">{restInterval.speedKmh}kph</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-zinc-800 border border-zinc-700 relative overflow-hidden">
                    <div className="w-1/4 h-full bg-zinc-600 rounded" />
                  </div>
                  <div className="text-[9px] font-mono text-zinc-400 text-right mt-0.5">
                    {formatTime(restInterval.durationSec)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Set Details or Aggregate Summary */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/80">
        {selectedSet ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-lime-400 text-zinc-950 text-xs">
                SET {selectedSet} DETAIL
              </span>
              <span className="text-zinc-300">
                2m Run @ {workInterval.speedKmh} km/h ({getPace(workInterval.speedKmh)}) + 2m Walk @ {restInterval.speedKmh} km/h
              </span>
            </div>
            <div className="font-mono text-zinc-400 text-[11px]">
              Set Distance: ~500m (400m run + 100m walk) • RPE: 8.5/10
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Work Phase</span>
              <span className="text-sm font-mono font-semibold text-lime-400">
                {Math.round(metrics.totalWorkTimeSec / 60)}m @ {workInterval.speedKmh} km/h
              </span>
              <span className="text-[10px] text-zinc-400 block">{getPace(workInterval.speedKmh)}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Recovery</span>
              <span className="text-sm font-mono font-semibold text-zinc-300">
                {Math.round(metrics.totalRestTimeSec / 60)}m @ {restInterval.speedKmh} km/h
              </span>
              <span className="text-[10px] text-zinc-400 block">Active clearing</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Run Volume</span>
              <span className="text-sm font-mono font-semibold text-zinc-100">
                2.00 km fast
              </span>
              <span className="text-[10px] text-zinc-400 block">+ 0.50 km walk</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Work : Rest</span>
              <span className="text-sm font-mono font-semibold text-zinc-100">
                1 : 1 Ratio
              </span>
              <span className="text-[10px] text-zinc-400 block">Lactate buffering</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
