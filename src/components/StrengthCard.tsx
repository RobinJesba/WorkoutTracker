"use client";

import React from "react";
import { StrengthExercise } from "@/types/workout";
import { 
  Barbell, 
  CheckCircle, 
  TrendUp, 
  Target 
} from "@phosphor-icons/react";

interface StrengthCardProps {
  exercises: StrengthExercise[];
}

export const StrengthCard: React.FC<StrengthCardProps> = ({ exercises }) => {
  return (
    <div className="space-y-4 mt-4">
      {exercises.map((exercise) => {
        const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);

        return (
          <div
            key={exercise.id}
            className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-4 sm:p-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/70 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Barbell size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    {exercise.name}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                      {exercise.sets.length} Sets
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Target size={12} className="text-zinc-400" />
                    <span>Focus: {exercise.targetMuscleGroup}</span>
                  </p>
                </div>
              </div>

              {/* Volume summary badge */}
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <div className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
                  <span className="text-zinc-400">Total Reps:</span>{" "}
                  <span className="text-white font-medium">{totalReps}</span>
                </div>
                {exercise.totalVolumeKg && (
                  <div className="bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
                    <span className="text-zinc-400">Volume:</span>{" "}
                    <span className="text-amber-400 font-medium">
                      {exercise.totalVolumeKg} kg
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Set by Set Log Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="py-2 px-3">Set</th>
                    <th className="py-2 px-3">Weight / Load</th>
                    <th className="py-2 px-3">Reps</th>
                    <th className="py-2 px-3 text-right">RPE / Intensity</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 font-mono">
                  {exercise.sets.map((set) => (
                    <tr
                      key={set.setNumber}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">
                        SET {set.setNumber}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">
                        {set.weightKg ? (
                          <span>
                            <strong className="text-zinc-100 font-bold">
                              {set.weightKg}
                            </strong>{" "}
                            <span className="text-zinc-400 text-[11px]">kg</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">Bodyweight</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-100 font-bold">
                          {set.reps} reps
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {set.rpe ? (
                          <span className="text-zinc-300">
                            {set.rpe} / 10
                          </span>
                        ) : (
                          <span className="text-zinc-400">--</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle size={14} weight="fill" /> Done
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Exercise Notes / Coach Cues */}
            {exercise.notes && (
              <div className="mt-3 pt-2.5 border-t border-zinc-800/40 text-xs text-zinc-400 flex items-center justify-between">
                <span>
                  <strong className="text-zinc-300">Cue:</strong> {exercise.notes}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Tempo: Controlled</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
