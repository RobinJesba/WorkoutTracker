"use client";

import React, { useState } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME } from "@/data/workouts";
import { 
  PersonSimpleRun, 
  PersonSimple, 
  CircleDashed 
} from "@phosphor-icons/react";

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
              <div className="flex items-baseline justify-between border-b border-zinc-800/60 pb-3 mb-3.5">
                <h2 className="text-base font-semibold text-zinc-100">
                  {workout.title}
                </h2>
                <time className="text-xs font-mono text-zinc-400">
                  {workout.date}
                </time>
              </div>

              {/* Items List */}
              <ul className="space-y-3">
                {workout.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5 p-1.5 rounded bg-zinc-800/80 text-zinc-300 shrink-0">
                      {item.type === "cardio" ? (
                        <PersonSimpleRun size={16} className="text-emerald-400" weight="bold" />
                      ) : item.type === "strength" ? (
                        <PersonSimple size={16} className="text-amber-400" weight="bold" />
                      ) : (
                        <CircleDashed size={16} className="text-zinc-400" />
                      )}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium text-zinc-200 mr-2">
                        {item.name}:
                      </span>
                      <span className="text-zinc-300 font-mono text-xs sm:text-sm">
                        {item.details}
                      </span>
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
