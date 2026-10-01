"use client";

import React, { useState, useEffect, useMemo } from "react";
import { INITIAL_WORKOUTS, ATHLETE_NAME } from "@/data/workouts";
import { MuscleIcon, MuscleGroup } from "@/components/MuscleIcon";
import { WorkoutEntry } from "@/types/workout";

const CACHE_KEY = "robin_workouts_v1";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(INITIAL_WORKOUTS);
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [isOffline, setIsOffline] = useState(false);

  // 1. Client-Side Cache (Instant render & Offline Gym Mode)
  useEffect(() => {
    // A. Check localStorage immediately
    if (typeof window !== "undefined") {
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

      // Track online/offline status
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // B. Fetch fresh data from Edge API in background
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

  // 2. Extract unique muscle groups across all logged workouts
  const availableMuscles = useMemo(() => {
    const set = new Set<string>();
    workouts.forEach((w) => {
      w.items.forEach((item) => {
        if (item.muscleGroup) set.add(item.muscleGroup);
      });
    });
    return Array.from(set);
  }, [workouts]);

  // 3. Filter workouts based on selected muscle pill
  const filteredWorkouts = useMemo(() => {
    if (selectedMuscle === "all") return workouts;
    return workouts
      .map((w) => {
        const matchingItems = w.items.filter(
          (item) => item.muscleGroup === selectedMuscle
        );
        return matchingItems.length > 0 ? { ...w, items: matchingItems } : null;
      })
      .filter(Boolean) as WorkoutEntry[];
  }, [workouts, selectedMuscle]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {filteredWorkouts.length} {filteredWorkouts.length === 1 ? "entry" : "entries"}
            {isOffline && " • Offline"}
          </span>
        </div>
      </header>

      {/* Main Content: Clean List */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Muscle Group Filter Pills */}
        {availableMuscles.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-5 border-b border-zinc-900 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedMuscle("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 cursor-pointer ${
                selectedMuscle === "all"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50"
              }`}
            >
              All
            </button>
            {availableMuscles.map((muscle) => (
              <button
                key={muscle}
                type="button"
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-colors shrink-0 cursor-pointer ${
                  selectedMuscle === muscle
                    ? "bg-zinc-800 text-emerald-400 border border-emerald-400/30 font-semibold"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50"
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        )}

        {/* Workout Cards */}
        <div className="space-y-6">
          {filteredWorkouts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs font-mono">
              No workouts found for this muscle filter.
            </div>
          ) : (
            filteredWorkouts.map((workout) => (
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
                        title={`Targeted muscles: ${item.targetMuscles?.join(", ") || item.muscleGroup}`}
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
                            {item.targetMuscles?.map((muscle) => (
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
