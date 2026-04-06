# AI Workflow Evaluator

A lightweight web app that analyzes AI-assisted coding session transcripts and produces structured insights about workflow quality.

## What it does

Upload `.txt` or `.md` transcripts from sessions with Cursor, Claude, ChatGPT, Copilot, or any AI coding tool. The app evaluates:

- **6 workflow metrics** — prompt clarity, context provision, iterative refinement, critical evaluation, task decomposition, AI leverage
- **Session phases** — Planning, Implementation, Debugging, Review/Refinement
- **Workflow style** — exploratory, systematic, reactive, or collaborative
- **Multi-session comparison** — averages, trend detection, best session
- **Confidence scores** per metric

## Project structure

```
ai-workflow-evaluator/
├── backend/          # FastAPI + Gemini
│   ├── main.py
│   ├── analyzer.py
│   └── requirements.txt
└── frontend/         # React + TypeScript + Vite
    └── src/
        ├── components/
        ├── types.ts
        ├── validation.ts
        └── App.tsx
```

## Setup

### Backend

```bash
cd ai-workflow-evaluator/backend

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key
export GEMINI_API_KEY=your-key

# Start the server
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### Frontend

```bash
cd ai-workflow-evaluator/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Runs on http://localhost:5173

# Run tests
npm test
```

## Usage

1. Start the backend (requires `GEMINI_API_KEY`)
2. Start the frontend
3. Open `http://localhost:5173`
4. Drag and drop `.txt` or `.md` transcript files (1–10 files)
5. Click **Analyze**

## Approach

The backend sends each transcript to Gemini with a structured prompt and JSON schema that define the 6 metrics, phase detection, and workflow style classification. The model returns a JSON object with scores, confidence values, rationales, and qualitative feedback.

The frontend renders results as a visual dashboard — CSS-based metric bars, phase timeline chips, and a cross-session comparison card when multiple transcripts are uploaded.

Key design decisions:
- **No chart libraries** — CSS-only bars keep the bundle small
- **Stateless backend** — each `/analyze` call is self-contained, no database
- **Client-side validation** — format and count checks before any network request
- **Graceful error isolation** — per-session errors don't block other results from rendering

## What makes a good AI-assisted workflow?

The evaluation framework is grounded in observable behaviors:
- Clear, specific prompts reduce back-and-forth
- Providing context (code, errors, constraints) improves AI accuracy
- Iterating on responses rather than accepting the first answer
- Critically evaluating AI output rather than blindly accepting it
- Decomposing complex problems into focused sub-tasks
- Using AI for meaningful work, not trivial lookups or over-relying on it for judgment calls
