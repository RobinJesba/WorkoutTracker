# WorkoutTracker 🏋️‍♂️

A minimalist, edge-first workout tracker built with **Next.js 16**, **Cloudflare D1** (SQLite), **Cloudflare Workers AI (Llama 3.3 70B)**, and interactive **anatomical muscle silhouettes**.

Log your workouts the way you actually train: type or dictate messy shorthand notes in the gym, and let serverless AI parse exercises, sets, reps, weights, and anatomical muscle targets automatically.

---

## ⚡ Highlights

- **Natural Language AI Quick Logging**: Paste raw notes (e.g. `Dumbbell chest press - 10kg * 6, 7.5kg * 12`, `Scapula pullups 15reps, 10reps`, `Running: 5 sets 2 mins run @ 12km/h`). Meta Llama 3.3 70B running on Cloudflare Workers AI extracts structured data in sub-seconds.
- **Dual-Silhouette Anatomical Visualizer**: Custom SVG anterior and posterior human body maps that illuminate primary (*emerald*) and secondary (*amber*) activated muscle groups for every exercise.
- **Exercise Drag-and-Drop Reordering**: Smooth touch & mouse drag reordering with intelligent edge auto-scrolling for long sessions.
- **Auto-Merge & Smart Session Titles**: Logging multiple times in one day? New exercises seamlessly append to the day's session, while the AI re-evaluates and updates the overall session title (e.g. *Upper Body Push* $\rightarrow$ *Full Body Strength & Intervals*).
- **Comprehensive Exercise Catalog & Guardrails**: 800+ exercise dataset cross-referenced with a canonical dictionary, fuzzy anti-collision matching, and anatomical sanity guardrails (e.g. squats will never map to chest).
- **Serverless Edge Performance**: Deployed globally on Cloudflare Workers via OpenNext with zero cold starts, backed by Cloudflare D1 serverless SQLite.
- **Zero Trust & API Key Security**: Safe for personal hosting. Mutations (`POST`, `PUT`, `DELETE`) are guarded by Cloudflare Zero Trust Access (Google OAuth) or an `x-api-key` header.
- **PWA & Mobile-First**: Installable to iOS/Android home screens with standalone display mode, dark UI, and notch/dynamic island safe area support.

---

## 🛠️ Architecture & How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Mobile PWA / Desktop UI - Zinc-950 Dark Minimalist)      │
└───────────────┬─────────────────────────────▲───────────────┘
                │                             │
       Free-form Gym Notes             Structured Data &
                │                      Anatomical Silhouettes
                ▼                             │
┌─────────────────────────────────────────────┴───────────────┐
│              Next.js 16 Edge Route Handlers                 │
│              (@opennextjs/cloudflare worker)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. /api/parse-workout                                      │
│     ├── Cloudflare Workers AI (@cf/meta/llama-3.3-70b)      │
│     │   └── (Fallback: Deterministic Local Regex Parser)    │
│     ├── Canonical Exercise Dictionary & wger Matcher        │
│     └── Anatomical Sanity Guardrails                        │
│                                                             │
│  2. /api/workouts (CRUD)                                    │
│     ├── Auth: Cloudflare Access Header OR x-api-key         │
│     └── Cloudflare D1 Database (SQLite workouts & items)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### The Workout Parsing Pipeline
1. **Input**: You type or dictate raw workout shorthand into the Quick Log modal.
2. **AI Inference**: The serverless edge worker invokes `@cf/meta/llama-3.3-70b-instruct-fp8-fast` with few-shot examples and an approved muscle target ontology.
3. **Canonical Normalization**: The parsed output is cross-referenced against the unified exercise database (`src/data/canonicalExercises.ts` + `wger` dataset) to guarantee clean names, primary muscle activations, and secondary synergist muscles.
4. **Anatomical Sanity Filter**: Enforces anatomical physical rules (e.g. push movements cannot target hamstrings; squats cannot target lats).
5. **Persistence**: Saves directly to Cloudflare D1 tables (`workouts` and `workout_items`). If a workout already exists for the chosen date, new exercises append automatically and the session title is smartly refreshed.

---

## 🔑 Environment Variables & Cloudflare Bindings

### 1. Environment Variables (`.env.local` or Cloudflare Dashboard)

Create a `.env.local` file from the provided example:

```bash
cp .env.example .env.local
```

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `WORKOUT_API_KEY` | **Production** | *(none)* | Secret key used to authorize `POST`, `PUT`, and `DELETE` requests to `/api/workouts`. In local dev (`NODE_ENV=development`), auth is automatically bypassed for rapid testing. |
| `NEXT_PUBLIC_ATHLETE_NAME` | No | `"Robin"` | Display name shown on the header banner and page title (e.g. `Alex's Workout Log`). |

### 2. Cloudflare Bindings (`wrangler.jsonc`)

When running on Cloudflare, the application relies on two serverless bindings:

| Binding | Type | Description |
| :--- | :--- | :--- |
| `DB` | **D1 Database** | Serverless SQLite database storing `workouts` and `workout_items`. |
| `AI` | **Workers AI** | Serverless AI binding granting access to Meta Llama 3.3 70B (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`). |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- (Optional for deployment) A free [Cloudflare](https://dash.cloudflare.com) account

### Option A: Local Development (Instant, 0 Cloud Setup)

You can run the app locally without any Cloudflare configuration. When D1 or Workers AI are not detected, the app automatically switches to **offline mock mode** (using sample initial data and a deterministic local text parser):

```bash
# 1. Clone the repository
git clone https://github.com/RobinJesba/WorkoutTracker.git
cd WorkoutTracker

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Cloudflare Production Deployment

Deploy globally to Cloudflare Workers with real Cloudflare D1 database and Workers AI:

#### Step 1: Login to Cloudflare Wrangler
```bash
npx wrangler login
```

#### Step 2: Create a Cloudflare D1 Database
```bash
npx wrangler d1 create workout-tracker-db
```
Wrangler will output your database configuration:
```jsonc
{
  "binding": "DB",
  "database_name": "workout-tracker-db",
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Paste your `database_id` into `wrangler.jsonc` under `d1_databases`.

#### Step 3: Run Database Migrations
Initialize the database tables (`workouts` and `workout_items`):
```bash
# Execute schema on Cloudflare D1
npm run db:setup:remote
```
*(For local Wrangler preview, you can also execute `npm run db:setup:local`)*.

#### Step 4: Configure Secrets
Set your secret API key on Cloudflare:
```bash
npx wrangler secret put WORKOUT_API_KEY
# Enter your secret passphrase when prompted
```

#### Step 5: Build and Deploy
```bash
npm run deploy
```
This builds your Next.js application using OpenNext and deploys the worker and assets directly to your Cloudflare account.

---

## 📡 API Reference & External Automation

You can easily log workouts programmatically from **iOS Shortcuts**, **Raycast**, or **Telegram/WhatsApp bots**.

### 1. Parse Workout Notes (`POST /api/parse-workout`)
Takes raw gym notes and returns structured items and an inferred title.

```bash
curl -X POST https://your-domain.com/api/parse-workout \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Dumbbell chest press - 10kg * 6, 7.5kg * 12\nSingle arm dumbbell row 10kg * 12 reps"
  }'
```

### 2. Log Workout Entry (`POST /api/workouts`)
Creates a new workout or automatically merges with an existing log for that date.

```bash
curl -X POST https://your-domain.com/api/workouts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_WORKOUT_API_KEY" \
  -d '{
    "date": "Friday, Oct 2, 2026",
    "title": "Upper Body Strength",
    "items": [
      {
        "name": "Dumbbell Chest Press",
        "muscleGroup": "chest",
        "targetMuscles": ["Chest"],
        "primaryMuscles": ["Chest"],
        "secondaryMuscles": ["Triceps", "Shoulders"],
        "details": "10kg × 6, 7.5kg × 12 reps"
      }
    ]
  }'
```

### 3. Read All Workouts (`GET /api/workouts`)
```bash
curl -X GET https://your-domain.com/api/workouts
```

### 4. Update Workout (`PUT /api/workouts`)
```bash
curl -X PUT https://your-domain.com/api/workouts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_WORKOUT_API_KEY" \
  -d '{
    "id": "workout-1",
    "date": "Thursday, Oct 1, 2026",
    "title": "Leg Day & Intervals",
    "items": [...]
  }'
```

### 5. Delete Workout (`DELETE /api/workouts`)
```bash
curl -X DELETE "https://your-domain.com/api/workouts?id=workout-1" \
  -H "x-api-key: YOUR_WORKOUT_API_KEY"
```

---

## 📱 iOS Shortcut Setup Guide

To log workouts directly from your iPhone Action Button, Siri, or Home Screen widget:
1. Open the **Shortcuts** app on iOS and tap **+** (New Shortcut).
2. Add an **Ask for Input** action (Prompt: *"What did you lift today?"*).
3. Add a **Get Contents of URL** action:
   - **URL**: `https://<YOUR_CF_WORKER_URL>/api/parse-workout`
   - **Method**: `POST`
   - **Request Body**: JSON with key `text` set to the shortcut input.
4. Add another **Get Contents of URL** action:
   - **URL**: `https://<YOUR_CF_WORKER_URL>/api/workouts`
   - **Method**: `POST`
   - **Headers**: `x-api-key`: `<YOUR_WORKOUT_API_KEY>`
   - **Request Body**: JSON with parsed items, current date, and title.

---

## 🧰 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Edge Deployment**: [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) & [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless distributed SQLite)
- **AI & LLM**: [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) running Meta Llama 3.3 70B Instruct
- **Exercise Anatomy**: Custom vector silhouettes & [wger](https://wger.de/) exercise ontology

---

## 📄 License

MIT © [Robin Jesba](https://github.com/RobinJesba)
