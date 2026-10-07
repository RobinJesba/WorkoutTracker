"use client";

import React, { useState, useEffect } from "react";
import { ATHLETE_NAME } from "@/data/workouts";
import { MuscleIcon } from "@/components/MuscleIcon";
import { QuickLogModal } from "@/components/QuickLogModal";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { TrainerNotesModal } from "@/components/TrainerNotesModal";
import { WorkoutEntry } from "@/types/workout";
import { formatWorkoutDate, isSameWorkoutDay } from "@/lib/date";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role & Permissions state (admin, trainer, viewer)
  type UserRole = "admin" | "trainer" | "viewer";
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isTrainer, setIsTrainer] = useState<boolean>(false);
  const [isLocalDev, setIsLocalDev] = useState<boolean>(false);
  const isReadOnly = !isAdmin;

  // Trainer notes state
  const [isTrainerNotesOpen, setIsTrainerNotesOpen] = useState<boolean>(false);
  const [trainerNotes, setTrainerNotes] = useState<string>("");

  const applyRole = (role: UserRole) => {
    setCurrentRole(role);
    setIsAdmin(role === "admin");
    setIsTrainer(role === "trainer");
  };

  const loadWorkouts = async (roleOverride?: UserRole) => {
    try {
      const activeRole = roleOverride || currentRole;
      const res = await fetch("/api/workouts", {
        headers: isLocalDev ? { "x-mock-role": activeRole } : {},
      });
      if (res.ok) {
        const data = await res.json();
        
        // If not running in local dev mock, determine access from server response
        const isDev =
          process.env.NODE_ENV === "development" ||
          (typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
            
        if (!isDev) {
          if (data.isAdmin) {
            applyRole("admin");
          } else if (data.isTrainer) {
            applyRole("trainer");
          } else {
            applyRole("viewer");
          }
        }

        if (Array.isArray(data.workouts)) {
          setWorkouts(
            data.workouts.map((w: WorkoutEntry) => ({
              ...w,
              date: formatWorkoutDate(w.date),
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch workouts from D1:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainerNotes = async () => {
    try {
      const res = await fetch("/api/trainer-notes");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.notes === "string") {
          setTrainerNotes(data.notes);
          if (typeof window !== "undefined") {
            localStorage.setItem("workout_tracker_trainer_notes", data.notes);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch trainer notes from API, checking local storage:", e);
    }

    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("workout_tracker_trainer_notes");
      if (savedNotes !== null) {
        setTrainerNotes(savedNotes);
      }
    }
  };

  // Initial mount: detect dev, restore mock role or server role, load data
  useEffect(() => {
    const isDev =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
    setIsLocalDev(isDev);

    let initialRole: UserRole = "admin";
    if (isDev && typeof window !== "undefined") {
      const saved = localStorage.getItem("workout_mock_role") as UserRole | null;
      if (saved === "admin" || saved === "trainer" || saved === "viewer") {
        initialRole = saved;
      }
    }
    applyRole(initialRole);

    loadWorkouts(initialRole);
    loadTrainerNotes();
  }, []);

  const handleWorkoutSaved = (savedWorkout: WorkoutEntry, isMerged?: boolean) => {
    const formattedWorkout: WorkoutEntry = {
      ...savedWorkout,
      date: formatWorkoutDate(savedWorkout.date),
    };

    setWorkouts((prev) => {
      const existingIndex = prev.findIndex((w) => isSameWorkoutDay(w.date, formattedWorkout.date));
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        // Append newly added items to existing workout
        const mergedWorkout: WorkoutEntry = {
          ...existing,
          id: existing.id,
          date: formatWorkoutDate(formattedWorkout.date),
          title: formattedWorkout.title || existing.title,
          items: [...existing.items, ...formattedWorkout.items],
        };
        const updated = [...prev];
        updated[existingIndex] = mergedWorkout;
        return updated;
      } else {
        return [formattedWorkout, ...prev];
      }
    });

    setToastMessage(isMerged ? "Workout merged & synced to D1" : "Workout saved & synced to D1");
    setTimeout(() => setToastMessage(null), 3500);

    // Refresh from D1 in background for complete server parity
    loadWorkouts();
  };

  const handleWorkoutUpdated = (updatedWorkout: WorkoutEntry) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === updatedWorkout.id ? updatedWorkout : w))
    );
    setToastMessage("Workout updated in D1");
    setTimeout(() => setToastMessage(null), 3500);
    loadWorkouts();
  };

  const handleWorkoutDeleted = (deletedId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== deletedId));
    setToastMessage("Workout deleted from D1");
    setTimeout(() => setToastMessage(null), 3500);
    loadWorkouts();
  };

  const handleSaveTrainerNotes = async (newNotes: string) => {
    setTrainerNotes(newNotes);
    if (typeof window !== "undefined") {
      localStorage.setItem("workout_tracker_trainer_notes", newNotes);
    }

    try {
      await fetch("/api/trainer-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isLocalDev ? { "x-mock-role": currentRole } : {}),
        },
        body: JSON.stringify({ notes: newNotes }),
      });
    } catch (err) {
      console.warn("Failed to save trainer notes to DB, saved to local storage:", err);
    }

    setToastMessage("Trainer notes saved");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearTrainerNotes = async () => {
    setTrainerNotes("");
    if (typeof window !== "undefined") {
      localStorage.setItem("workout_tracker_trainer_notes", "");
    }

    try {
      await fetch("/api/trainer-notes", {
        method: "DELETE",
        headers: isLocalDev ? { "x-mock-role": currentRole } : {},
      });
    } catch (err) {
      console.warn("Failed to clear trainer notes from DB, cleared in local storage:", err);
    }

    setToastMessage("Trainer notes cleared");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleSelect = (role: UserRole) => {
    applyRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("workout_mock_role", role);
    }
    const roleLabel = role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "Viewer";
    setToastMessage(`Switched to ${roleLabel} mode (mock)`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top minimal bar (with safe area inset for notch/island) */}
      <header 
        className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-3.5 sm:px-4 py-3 sm:py-3.5"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Athlete title & live sync dot */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight truncate">
              {ATHLETE_NAME}&apos;s Workout Log
            </h1>
            <span 
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" 
              title="Live Synced with Cloudflare D1"
            />
          </div>
          
          {/* Right: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Local dev mock role switcher (Admin, Trainer, Viewer) */}
            {isLocalDev && (
              <div 
                className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10.5px] font-mono"
                title="Local mock switcher: test Admin, Trainer, and Viewer roles"
              >
                <button
                  type="button"
                  onClick={() => handleRoleSelect("admin")}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    currentRole === "admin"
                      ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Admin: shows Trainer Notes, Log Workout & Edit buttons"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("trainer")}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    currentRole === "trainer"
                      ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Trainer: shows Trainer Notes; removes Log Workout & Edit buttons"
                >
                  Trainer
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("viewer")}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    currentRole === "viewer"
                      ? "bg-zinc-800 text-zinc-300 font-medium border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Viewer: hides Trainer Notes, Log Workout & Edit buttons"
                >
                  Viewer
                </button>
              </div>
            )}

            {/* Entry count */}
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              {workouts.length} {workouts.length === 1 ? "entry" : "entries"}
            </span>

            {/* Trainer Notes Icon Button: visible for Admins and Trainers */}
            {(isAdmin || isTrainer) && (
              <button
                type="button"
                onClick={() => setIsTrainerNotesOpen(true)}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Trainer notes"
              >
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span>Trainer Notes</span>
              </button>
            )}

            {/* Log Workout Button: ONLY visible for Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Log new workout with AI"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Log Workout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Clean List */}
      <main 
        className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 sm:p-5 animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                  <div className="h-4 bg-zinc-800 rounded w-44" />
                  <div className="h-3 bg-zinc-800/80 rounded w-28" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-16 bg-zinc-950/60 border border-zinc-800/40 rounded-lg" />
                  <div className="h-16 bg-zinc-950/60 border border-zinc-800/40 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/20">
            <p className="text-sm font-mono text-zinc-400">No workout logs found.</p>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                + Log your first workout
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {workouts.map((workout) => (
              <article
                key={workout.id}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 sm:p-5 hover:border-zinc-700/80 transition-colors shadow-sm"
              >
                {/* Date, Title & Actions */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-3.5 gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                      {workout.title}
                    </h2>
                    <time className="text-xs font-mono text-zinc-400 block mt-0.5">
                      {formatWorkoutDate(workout.date)}
                    </time>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingWorkout(workout)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-950/60 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-emerald-500/30 cursor-pointer active:scale-95 transition-all shrink-0 shadow-sm"
                      title="Manual edit workout"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  )}
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
        )}
      </main>


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
        existingWorkouts={workouts}
        isReadOnly={isReadOnly}
      />

      {/* Manual Edit Workout Modal */}
      <EditWorkoutModal
        workout={editingWorkout}
        isOpen={Boolean(editingWorkout)}
        onClose={() => setEditingWorkout(null)}
        onWorkoutUpdated={handleWorkoutUpdated}
        onWorkoutDeleted={handleWorkoutDeleted}
      />

      {/* Trainer Notes Popup Modal */}
      {isTrainerNotesOpen && (
        <TrainerNotesModal
          isOpen={isTrainerNotesOpen}
          onClose={() => setIsTrainerNotesOpen(false)}
          notes={trainerNotes}
          onSave={handleSaveTrainerNotes}
          onClear={handleClearTrainerNotes}
        />
      )}
    </div>
  );
}
