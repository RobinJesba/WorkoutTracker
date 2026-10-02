"use client";

import React, { useState, useEffect, useRef } from "react";
import { MuscleIcon } from "./MuscleIcon";
import { WorkoutEntry, WorkoutItem } from "@/types/workout";
import { formatWorkoutDate, workoutDateToIso } from "@/lib/date";
import { findUnifiedExercise } from "@/lib/exerciseDatabase";

interface EditWorkoutModalProps {
  workout: WorkoutEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onWorkoutUpdated: (updated: WorkoutEntry) => void;
  onWorkoutDeleted: (deletedId: string) => void;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({
  workout,
  isOpen,
  onClose,
  onWorkoutUpdated,
  onWorkoutDeleted,
}) => {
  const [title, setTitle] = useState<string>("");
  const [dateIso, setDateIso] = useState<string>("");
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workout && isOpen) {
      setTitle(workout.title || "");
      setDateIso(workoutDateToIso(workout.date));
      setItems(workout.items ? JSON.parse(JSON.stringify(workout.items)) : []);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [workout, isOpen]);

  if (!isOpen || !workout) return null;

  const displayDate = formatWorkoutDate(dateIso);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleItemNameChange = (index: number, newName: string) => {
    setItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], name: newName };

      // Attempt live muscle auto-match if recognizable name
      if (newName.trim().length >= 3) {
        const match = findUnifiedExercise(newName.trim());
        if (match) {
          current.muscleGroup = (match.category?.toLowerCase() || current.muscleGroup) as any;
          current.targetMuscles = match.primaryMuscles;
          current.primaryMuscles = match.primaryMuscles;
          current.secondaryMuscles = match.secondaryMuscles;
        }
      }

      next[index] = current;
      return next;
    });
  };

  const handleItemDetailsChange = (index: number, newDetails: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], details: newDetails };
      return next;
    });
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddItem = () => {
    const newItem: WorkoutItem = {
      id: `item-manual-${Date.now()}-${items.length}`,
      name: "",
      muscleGroup: "full-body" as any,
      targetMuscles: ["Full-body"],
      primaryMuscles: ["Full-body"],
      secondaryMuscles: [],
      details: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a session title.");
      return;
    }

    if (items.length === 0) {
      setError("Workout must contain at least one exercise.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim()) {
        setError(`Exercise #${i + 1} name cannot be empty.`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    const updatedWorkout: WorkoutEntry = {
      id: workout.id,
      date: displayDate,
      title: title.trim(),
      items: items.map((item, idx) => ({
        ...item,
        name: item.name.trim(),
        details: item.details.trim() || "Completed",
        id: item.id || `item-${Date.now()}-${idx}`,
      })),
    };

    try {
      const res = await fetch("/api/workouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedWorkout),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update workout");
      }

      onWorkoutUpdated(updatedWorkout);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update workout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workouts?id=${encodeURIComponent(workout.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete workout");
      }

      onWorkoutDeleted(workout.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete workout");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">Manual Edit Workout</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-zinc-200">
          {/* Title & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Session Title Input */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Upper Body Pull & Push"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Workout Date Picker */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Workout Date
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenDatePicker}
                  className="w-full flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-zinc-100 hover:border-zinc-700 transition-colors text-left cursor-pointer active:bg-zinc-900"
                >
                  <span className="truncate">{displayDate}</span>
                  <svg className="w-4 h-4 text-emerald-400/80 shrink-0 ml-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateIso}
                  onChange={(e) => {
                    if (e.target.value) setDateIso(e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 pointer-events-none w-full h-full [color-scheme:dark]"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Exercises List Header */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <span className="text-xs font-mono text-zinc-400">
              Exercises ({items.length})
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Exercise</span>
            </button>
          </div>

          {/* Exercise Items List */}
          <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/60 transition-colors flex items-start gap-3"
              >
                {/* Silhouette Icon */}
                <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800/90 flex flex-col items-center justify-center shrink-0 w-[58px] min-w-[58px] mt-1">
                  <MuscleIcon
                    targetMuscles={item.targetMuscles}
                    primaryMuscles={item.primaryMuscles}
                    secondaryMuscles={item.secondaryMuscles}
                    muscleGroup={item.muscleGroup}
                    size={22}
                  />
                </div>

                {/* Exercise Fields */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemNameChange(idx, e.target.value)}
                      placeholder="Exercise Name (e.g. Dumbbell Chest Press)"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-850 transition-colors shrink-0"
                      title="Delete exercise"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>

                  {/* Muscle Tags Preview */}
                  <div className="flex flex-wrap items-center gap-1">
                    {(item.primaryMuscles || item.targetMuscles)?.map((m) => (
                      <span
                        key={m}
                        className="px-1.5 py-0.2 rounded text-[9.5px] font-mono uppercase bg-zinc-850 text-emerald-400 border border-emerald-400/20"
                      >
                        {m}
                      </span>
                    ))}
                    {item.secondaryMuscles?.map((m) => (
                      <span
                        key={m}
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-700/60"
                      >
                        + {m}
                      </span>
                    ))}
                  </div>

                  {/* Details Input */}
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) => handleItemDetailsChange(idx, e.target.value)}
                    placeholder="Details: 3 sets × 10 reps @ 20kg"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/80 bg-zinc-950/50 shrink-0">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-red-400">Delete session?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2.5 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                Delete Workout
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md active:scale-95 disabled:pointer-events-none cursor-pointer"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
