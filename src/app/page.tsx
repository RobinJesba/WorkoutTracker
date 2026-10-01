"use client";

import React, { useState } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME } from "@/data/workouts";
import { MuscleIcon } from "@/components/MuscleIcon";

export default function WorkoutListPage() {
  const [workouts] = useState(INITIAL_WORKOUTS);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
              {ATHLETE_NAME}'s Workout Log
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {workouts.length} {workouts.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </header>

      {/* Main Content: Clean List */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="space-y-6">
          {workouts.map((workout) => (
            <article
              key={workout.id}
              className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors"
            >
              {/* Date & Title */}
              <div className="flex items-baseline justify-between border-b border-zinc-800/60 pb-3 mb-4">
                <h2 className="text-base font-semibold text-zinc-100">
                  {workout.title}
                </h2>
                <time className="text-xs font-mono text-zinc-400">
                  {workout.date}
                </time>
              </div>

              {/* Items List */}
              <ul className="space-y-3.5">
                {workout.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3.5 text-sm p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors"
                  >
                    {/* Anatomical Target Muscle Silhouette Icon */}
                    <div 
                      className="p-1 rounded-md bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0"
                      title={`Targeted muscles: ${item.targetMuscles.join(", ")}`}
                    >
                      <MuscleIcon muscleGroup={item.muscleGroup} size={28} />
                    </div>

                    {/* Exercise Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-zinc-200">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.targetMuscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-zinc-800/80 text-emerald-400 border border-emerald-400/20"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 font-mono text-xs sm:text-sm">
                        {item.details}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Minimal Footer Cue */}
        <div className="mt-12 text-center border-t border-zinc-900 pt-6">
          <p className="text-xs font-mono text-zinc-400">
            Tell Antigravity in chat to add any workout to your list.
          </p>
        </div>
      </main>
    </div>
  );
}
