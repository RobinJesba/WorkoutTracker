"use client";

import React, { useState } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME, TRAINER_NAME } from "@/data/workouts";
import { 
  Barbell, 
  Footprints, 
  ShareNetwork, 
  Check, 
  ChatCircleText, 
  CircleDashed 
} from "@phosphor-icons/react";

export default function WorkoutListPage() {
  const [workouts] = useState(INITIAL_WORKOUTS);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                {ATHLETE_NAME}'s Workout Log
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400">
              Shared with Coach {TRAINER_NAME}
            </p>
          </div>

          <button
            onClick={handleCopyLink}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" weight="bold" />
                <span className="text-emerald-400 font-mono">Link Copied</span>
              </>
            ) : (
              <>
                <ShareNetwork size={14} />
                <span>Share Link</span>
              </>
            )}
          </button>
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
              <ul className="space-y-2.5">
                {workout.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5 p-1 rounded bg-zinc-800/80 text-zinc-300 shrink-0">
                      {item.type === "cardio" ? (
                        <Footprints size={15} className="text-emerald-400" />
                      ) : item.type === "strength" ? (
                        <Barbell size={15} className="text-amber-400" />
                      ) : (
                        <CircleDashed size={15} className="text-zinc-400" />
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

              {/* Notes */}
              {(workout.notes || workout.coachNote) && (
                <div className="mt-4 pt-3 border-t border-zinc-800/50 space-y-2 text-xs">
                  {workout.notes && (
                    <p className="text-zinc-400">
                      <strong className="text-zinc-300 font-medium">Note:</strong>{" "}
                      {workout.notes}
                    </p>
                  )}
                  {workout.coachNote && (
                    <p className="text-zinc-300 flex items-start gap-1.5 bg-zinc-950/60 border border-zinc-800/70 p-2.5 rounded-lg">
                      <ChatCircleText size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-emerald-400 font-medium font-mono text-[11px] block">
                          Coach {TRAINER_NAME}:
                        </strong>
                        {workout.coachNote}
                      </span>
                    </p>
                  )}
                </div>
              )}
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
