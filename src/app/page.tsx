"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME } from "@/data/workouts";
import { MuscleIcon } from "@/components/MuscleIcon";
import { QuickLogModal } from "@/components/QuickLogModal";
import { WorkoutEntry } from "@/types/workout";

const CACHE_KEY = "robin_workouts_v3";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(INITIAL_WORKOUTS);
  const [isOffline, setIsOffline] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleWorkoutSaved = (newWorkout: WorkoutEntry) => {
    // Avoid duplicate IDs if already present
    const updated = [newWorkout, ...workouts.filter((w) => w.id !== newWorkout.id)];
    setWorkouts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }
    setToastMessage("Workout saved & synced to D1");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar (with safe area inset for notch/island) */}
      <header 
        className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:py-3.5"
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
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              {workouts.length} {workouts.length === 1 ? "entry" : "entries"}
              {isOffline && " • Offline"}
            </span>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Log new workout with AI"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Log Workout</span>
            </button>
          </div>
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
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/90 flex flex-col items-center justify-center shrink-0 w-[68px] min-w-[68px]"
                      title={`Targeted muscles: ${(item.primaryMuscles || item.targetMuscles)?.join(", ")}${item.secondaryMuscles?.length ? ` (Secondary: ${item.secondaryMuscles.join(", ")})` : ""}`}
                    >
                      <MuscleIcon 
                        targetMuscles={item.targetMuscles} 
                        primaryMuscles={item.primaryMuscles}
                        secondaryMuscles={item.secondaryMuscles}
                        muscleGroup={item.muscleGroup} 
                        size={24} 
                      />
                    </div>

                    {/* Exercise Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-semibold text-zinc-100 text-sm leading-snug">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {(item.primaryMuscles || item.targetMuscles)?.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-zinc-800/90 text-emerald-400 border border-emerald-400/20"
                              title="Primary target muscle"
                            >
                              {muscle}
                            </span>
                          ))}
                          {item.secondaryMuscles?.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wide bg-zinc-900/90 text-zinc-400 border border-zinc-700/60"
                              title="Secondary synergist muscle"
                            >
                              + {muscle}
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

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-5 z-40 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-3 rounded-full shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
        title="Log Workout"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">Log</span>
      </button>

      {/* Sync Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900/95 border border-emerald-500/40 text-emerald-400 text-xs font-mono px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Log AI Modal */}
      <QuickLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWorkoutSaved={handleWorkoutSaved}
      />
    </div>
  );
}
