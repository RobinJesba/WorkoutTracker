"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { WeeklyStatsCard } from "@/components/WeeklyStatsCard";
import { WorkoutSessionCard } from "@/components/WorkoutSessionCard";
import { ChatLoggerBanner } from "@/components/ChatLoggerBanner";
import { 
  ATHLETE_PROFILE, 
  INITIAL_WORKOUTS, 
  getWeeklyStats 
} from "@/data/workouts";
import { 
  Funnel, 
  Sparkle, 
  ShieldCheck, 
  Flame 
} from "@phosphor-icons/react";

export default function WorkoutDashboardPage() {
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);
  const [isTrainerView, setIsTrainerView] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const weeklyStats = getWeeklyStats(workouts);

  const filteredWorkouts = workouts.filter((w) => {
    if (filterCategory === "all") return true;
    return w.category === filterCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-lime-400 selection:text-zinc-950">
      {/* Top Header */}
      <Header
        profile={ATHLETE_PROFILE}
        isTrainerView={isTrainerView}
        onToggleTrainerView={() => setIsTrainerView(!isTrainerView)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner if Trainer View is Active */}
        {isTrainerView && (
          <div className="mb-6 p-4 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-lime-400 font-medium">
              <ShieldCheck size={18} weight="bold" />
              <span>
                <strong>Coach View Enabled:</strong> Reviewing athlete Robin's weekly interval splits, volume adherence, and form metrics.
              </span>
            </div>
            <button
              onClick={() => setIsTrainerView(false)}
              className="text-zinc-400 hover:text-zinc-200 underline font-mono shrink-0"
            >
              Exit Coach View
            </button>
          </div>
        )}

        {/* Weekly Adherence & Stats Card */}
        <WeeklyStatsCard stats={weeklyStats} isTrainerView={isTrainerView} />

        {/* Session Feed Controls & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
              Training Logbook
            </h2>
            <span className="font-mono text-xs text-zinc-400">
              ({filteredWorkouts.length} sessions logged)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterCategory === "all"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("hybrid")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterCategory === "hybrid"
                  ? "bg-zinc-800 text-lime-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Interval & Hybrid
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("strength")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterCategory === "strength"
                  ? "bg-zinc-800 text-amber-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Strength
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("cardio")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterCategory === "cardio"
                  ? "bg-zinc-800 text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Cardio
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {filteredWorkouts.map((session, index) => (
            <WorkoutSessionCard
              key={session.id}
              session={session}
              isTrainerView={isTrainerView}
              defaultExpanded={index === 0}
            />
          ))}
        </div>

        {/* Conversational Assistant Logging Banner */}
        <ChatLoggerBanner />
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs font-mono text-zinc-400">
        <p>
          Workout Tracker • Updated via AI Chat • Athlete: Robin • Coach: Marcus Vance
        </p>
      </footer>
    </div>
  );
}
