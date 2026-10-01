"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME } from "@/data/workouts";
import { MuscleIcon } from "@/components/MuscleIcon";
import { WorkoutEntry } from "@/types/workout";

const CACHE_KEY = "robin_workouts_v1";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(INITIAL_WORKOUTS);
  const [isOffline, setIsOffline] = useState(false);

  // Client-Side Cache (Instant render & Offline Gym Mode)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Load from localStorage immediately (0ms delay)
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkouts(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load local workout cache", e);
      }

      // 2. Track online/offline status
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 3. Fetch fresh data from Edge API in background
      fetch("/api/workouts")
        .then((res) => res.json())
        .then((data) => {
          if (data?.workouts && Array.isArray(data.workouts) && data.workouts.length > 0) {
            setWorkouts(data.workouts);
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.workouts));
          }
        })
        .catch(() => {
          // Keep cached data seamlessly
        });

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar (with safe area inset for notch/island) */}
      <header 
        className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 sm:py-4"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
              {ATHLETE_NAME}'s Workout Log
            </h1>
            <span 
              className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-amber-400" : "bg-emerald-400"}`} 
              title={isOffline ? "Offline (Serving from cache)" : "Live Synced"}
            />
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {workouts.length} {workouts.length === 1 ? "entry" : "entries"}
            {isOffline && " • Offline"}
          </span>
        </div>
      </header>

      {/* Main Content: Clean List */}
      <main 
        className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="space-y-5 sm:space-y-6">
          {workouts.map((workout) => (
            <article
              key={workout.id}
              className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 sm:p-5 hover:border-zinc-700/80 transition-colors shadow-sm"
            >
              {/* Date & Title */}
              <div className="flex items-baseline justify-between border-b border-zinc-800/60 pb-3 mb-3.5">
                <h2 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                  {workout.title}
                </h2>
                <time className="text-xs font-mono text-zinc-400 shrink-0 ml-2">
                  {workout.date}
                </time>
              </div>

              {/* Items List */}
              <ul className="space-y-3">
                {workout.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors"
                  >
                    {/* Anatomical Target Muscle Silhouette Icon */}
                    <div 
                      className="p-1 sm:p-1.5 rounded-md bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0"
                      title={`Targeted muscles: ${item.targetMuscles?.join(", ") || item.muscleGroup}`}
                    >
                      <MuscleIcon 
                        targetMuscles={item.targetMuscles} 
                        muscleGroup={item.muscleGroup} 
                        size={26} 
                      />
                    </div>

                    {/* Exercise Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-semibold text-zinc-100 text-sm leading-snug">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {item.targetMuscles?.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-zinc-800/90 text-emerald-400 border border-emerald-400/20"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed break-words">
                        {item.details}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
