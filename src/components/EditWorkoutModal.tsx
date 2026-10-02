"use client";

import React, { useState, useEffect, useRef } from "react";
import { MuscleIcon } from "./MuscleIcon";
import { WorkoutEntry, WorkoutItem } from "@/types/workout";
import { formatWorkoutDate, workoutDateToIso } from "@/lib/date";
import { findUnifiedExercise } from "@/lib/exerciseDatabase";

const APPROVED_MUSCLES = [
  "Chest",
  "Lats",
  "Upper Back",
  "Scapula",
  "Lower Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Core",
];

interface EditWorkoutModalProps {
  workout: WorkoutEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onWorkoutUpdated: (updated: WorkoutEntry) => void;
  onWorkoutDeleted: (deletedId: string) => void;
}

interface MuscleTagSelectorProps {
  type: "primary" | "secondary";
  label: string;
  muscles: string[];
  excludedMuscles?: string[];
  onAdd: (muscle: string) => void;
  onRemove: (muscle: string) => void;
}

const MuscleTagSelector: React.FC<MuscleTagSelectorProps> = ({
  type,
  label,
  muscles,
  excludedMuscles = [],
  onAdd,
  onRemove,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollParent =
        containerRef.current.closest("[data-scroll-container]") ||
        containerRef.current.closest(".overflow-y-auto");

      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const spaceBelow = parentRect.bottom - rect.bottom;
        const spaceAbove = rect.top - parentRect.top;
        // If remaining space below is less than 170px and more space above, open upward
        setOpenUpward(spaceBelow < 170 && spaceAbove > spaceBelow);
      } else {
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 170);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    checkDropdownPosition();

    const handleScrollOrResize = () => {
      checkDropdownPosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Exclude muscles already in this selector AND muscles selected in the other selector
  const allExcluded = [...muscles, ...excludedMuscles];
  const filtered = APPROVED_MUSCLES.filter(
    (m) =>
      !allExcluded.some((existing) => existing.toLowerCase() === m.toLowerCase()) &&
      m.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleSelect = (muscle: string) => {
    onAdd(muscle);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 w-14 shrink-0 font-medium">
        {label}:
      </span>

      {/* Selected Tags */}
      {muscles.map((m) => (
        <span
          key={m}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${
            type === "primary"
              ? "bg-zinc-800 text-emerald-400 border-emerald-400/20"
              : "bg-zinc-900 text-zinc-400 border-zinc-700/60"
          }`}
        >
          <span>{type === "secondary" ? `+ ${m}` : m}</span>
          <button
            type="button"
            onClick={() => onRemove(m)}
            className="text-zinc-500 hover:text-red-400 font-bold ml-0.5 leading-none transition-colors cursor-pointer"
            title={`Remove ${m}`}
          >
            ×
          </button>
        </span>
      ))}

      {/* Autocomplete Input */}
      <div className={`relative inline-block ${isOpen ? "z-30" : ""}`} ref={containerRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            checkDropdownPosition();
            setIsOpen(true);
          }}
          onFocus={() => {
            checkDropdownPosition();
            setIsOpen(true);
          }}
          onClick={() => {
            checkDropdownPosition();
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={`+ ${label.toLowerCase()}...`}
          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[11px] font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 w-24 sm:w-28"
        />

        {isOpen && filtered.length > 0 && (
          <div
            className={`absolute left-0 w-36 max-h-40 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 py-1 text-xs font-mono ${
              openUpward ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {filtered.map((m) => (
              <button
                key={m}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(m);
                }}
                className="w-full text-left px-2.5 py-1 text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{m}</span>
                <span className="text-[10px] text-zinc-500 font-bold">+</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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


  const handleItemNameChange = (index: number, newName: string) => {
    setItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], name: newName };

      // Attempt live muscle auto-match if recognizable name and muscles not explicitly set
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

  const handleAddMuscle = (itemIdx: number, type: "primary" | "secondary", muscle: string) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[itemIdx] };

      if (type === "primary") {
        const primary = [...(item.primaryMuscles || item.targetMuscles || [])];
        if (!primary.includes(muscle)) {
          primary.push(muscle);
        }
        item.primaryMuscles = primary;
        item.targetMuscles = primary;
        // Mutual exclusion: Remove from secondary if present
        if (item.secondaryMuscles) {
          item.secondaryMuscles = item.secondaryMuscles.filter(
            (m) => m.toLowerCase() !== muscle.toLowerCase()
          );
        }
      } else {
        const secondary = [...(item.secondaryMuscles || [])];
        if (!secondary.includes(muscle)) {
          secondary.push(muscle);
        }
        item.secondaryMuscles = secondary;
        // Mutual exclusion: Remove from primary if present
        const primary = (item.primaryMuscles || item.targetMuscles || []).filter(
          (m) => m.toLowerCase() !== muscle.toLowerCase()
        );
        item.primaryMuscles = primary;
        item.targetMuscles = primary;
      }

      next[itemIdx] = item;
      return next;
    });
  };

  const handleRemoveMuscle = (itemIdx: number, type: "primary" | "secondary", muscle: string) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[itemIdx] };

      if (type === "primary") {
        const primary = (item.primaryMuscles || item.targetMuscles || []).filter(
          (m) => m.toLowerCase() !== muscle.toLowerCase()
        );
        item.primaryMuscles = primary;
        item.targetMuscles = primary;
      } else {
        const secondary = (item.secondaryMuscles || []).filter(
          (m) => m.toLowerCase() !== muscle.toLowerCase()
        );
        item.secondaryMuscles = secondary;
      }

      next[itemIdx] = item;
      return next;
    });
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-hidden">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[88vh] overflow-hidden"
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
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">Edit Workout</h2>
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

        {/* Modal Body: Fixed Controls + Scrollable Exercise List */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden text-zinc-200">
          {/* Title & Date Controls (Fixed, non-scrolling) */}
          <div className="p-5 pb-3 shrink-0">
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
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    if (dateInputRef.current && typeof dateInputRef.current.showPicker === "function") {
                      try {
                        dateInputRef.current.showPicker();
                      } catch {}
                    }
                  }}
                >
                  <div
                    className="w-full flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-zinc-100 hover:border-zinc-700 transition-colors text-left"
                  >
                    <span className="truncate">{displayDate}</span>
                    <svg className="w-4 h-4 text-emerald-400/80 shrink-0 ml-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={dateIso}
                    onChange={(e) => {
                      if (e.target.value) setDateIso(e.target.value);
                    }}
                    onClick={(e) => {
                      if (typeof (e.currentTarget as any).showPicker === "function") {
                        try {
                          (e.currentTarget as any).showPicker();
                        } catch {}
                      }
                    }}
                    className="native-date-overlay text-base [color-scheme:dark]"
                    aria-label="Workout Date"
                  />
                </div>
              </div>
            </div>

            {/* Exercises List Header */}
            <div className="pt-3 mt-3 border-t border-zinc-800/60">
              <span className="text-xs font-mono text-zinc-400">
                Exercises ({items.length})
              </span>
            </div>
          </div>

          {/* Exercise Items List (Only this section scrolls!) */}
          <div
            ref={listContainerRef}
            data-scroll-container="true"
            className="flex-1 overflow-y-auto px-5 pb-4 space-y-3"
          >
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/60 transition-colors flex items-center gap-3.5"
              >
                {/* Silhouette Icon: Perfectly Centered */}
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/90 flex flex-col items-center justify-center shrink-0 w-[68px] min-w-[68px] self-center">
                  <MuscleIcon
                    targetMuscles={item.targetMuscles}
                    primaryMuscles={item.primaryMuscles}
                    secondaryMuscles={item.secondaryMuscles}
                    muscleGroup={item.muscleGroup}
                    size={24}
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
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-850 transition-colors shrink-0 cursor-pointer"
                      title="Delete exercise"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>

                  {/* Details Input */}
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) => handleItemDetailsChange(idx, e.target.value)}
                    placeholder="Details: 3 sets: 10kg × 12, 10kg × 10 reps"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />

                  {/* Muscle Tag Autocomplete Selectors */}
                  <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
                    <MuscleTagSelector
                      type="primary"
                      label="Primary"
                      muscles={item.primaryMuscles || item.targetMuscles || []}
                      excludedMuscles={item.secondaryMuscles || []}
                      onAdd={(m) => handleAddMuscle(idx, "primary", m)}
                      onRemove={(m) => handleRemoveMuscle(idx, "primary", m)}
                    />
                    <MuscleTagSelector
                      type="secondary"
                      label="Secondary"
                      muscles={item.secondaryMuscles || []}
                      excludedMuscles={item.primaryMuscles || item.targetMuscles || []}
                      onAdd={(m) => handleAddMuscle(idx, "secondary", m)}
                      onRemove={(m) => handleRemoveMuscle(idx, "secondary", m)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-5 pb-3">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {error}
              </div>
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
                  className="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
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
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer"
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
