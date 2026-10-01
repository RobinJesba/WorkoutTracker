-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout items table
CREATE TABLE IF NOT EXISTS workout_items (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  target_muscles TEXT NOT NULL,
  details TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Seed Initial Workout (Oct 1, 2026)
INSERT OR IGNORE INTO workouts (id, date, title) 
VALUES ('workout-1', 'Thursday, Oct 1, 2026', 'Interval Run & Bodyweight Squats');

INSERT OR IGNORE INTO workout_items (id, workout_id, name, muscle_group, target_muscles, details, sort_order) 
VALUES 
  ('item-1-1', 'workout-1', 'Running Intervals', 'legs', '["Quads", "Calves"]', '5 sets: 2 mins run @ 12 km/h + 2 mins walk @ 3 km/h (0% incline)', 1),
  ('item-1-2', 'workout-1', 'Bodyweight Squats', 'quads', '["Quadriceps", "Glutes"]', '3 sets × 15 reps', 2);
