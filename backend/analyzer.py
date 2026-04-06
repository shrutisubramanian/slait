import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

METRIC_KEYS = [
    "prompt_clarity",
    "context_provision",
    "iterative_refinement",
    "critical_evaluation",
    "task_decomposition",
    "ai_leverage",
]

SYSTEM_PROMPT = """You are an expert evaluator of AI-assisted software engineering workflows.
You analyze transcripts of coding sessions between engineers and AI tools (like Cursor, Claude, ChatGPT, Copilot).

Your job is to evaluate the QUALITY of the engineer's workflow — not the code itself.

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview of the session",
  "phases": [
    { "name": "Planning", "detected": true/false, "evidence": "brief quote or description" },
    { "name": "Implementation", "detected": true/false, "evidence": "..." },
    { "name": "Debugging", "detected": true/false, "evidence": "..." },
    { "name": "Review/Refinement", "detected": true/false, "evidence": "..." }
  ],
  "metrics": {
    "prompt_clarity": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    },
    "context_provision": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    },
    "iterative_refinement": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    },
    "critical_evaluation": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    },
    "task_decomposition": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    },
    "ai_leverage": {
      "score": 0-10,
      "confidence": 0-1,
      "rationale": "explanation"
    }
  },
  "overall_score": 0-10,
  "strengths": ["list of 2-3 specific strengths"],
  "improvements": ["list of 2-3 actionable improvements"],
  "workflow_style": "one of: exploratory, systematic, reactive, collaborative"
}

Metric definitions:
- prompt_clarity: How clear, specific, and well-formed are the engineer's prompts?
- context_provision: Does the engineer provide relevant context (code, errors, constraints)?
- iterative_refinement: Does the engineer build on AI responses, refine, and iterate?
- critical_evaluation: Does the engineer question, verify, or push back on AI output?
- task_decomposition: Does the engineer break complex problems into manageable pieces?
- ai_leverage: Is the engineer using AI for the right tasks (not trivial, not over-relying)?

Be honest and calibrated. A score of 7+ should be genuinely good. Return ONLY valid JSON."""

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "phases": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "detected": {"type": "boolean"},
                    "evidence": {"type": "string"},
                },
                "required": ["name", "detected", "evidence"],
            },
        },
        "metrics": {
            "type": "object",
            "properties": {
                "prompt_clarity": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
                "context_provision": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
                "iterative_refinement": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
                "critical_evaluation": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
                "task_decomposition": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
                "ai_leverage": {
                    "type": "object",
                    "properties": {
                        "score": {"type": "number"},
                        "confidence": {"type": "number"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["score", "confidence", "rationale"],
                },
            },
            "required": METRIC_KEYS,
        },
        "overall_score": {"type": "number"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "improvements": {"type": "array", "items": {"type": "string"}},
        "workflow_style": {
            "type": "string",
            "enum": ["exploratory", "systematic", "reactive", "collaborative"],
        },
    },
    "required": [
        "summary",
        "phases",
        "metrics",
        "overall_score",
        "strengths",
        "improvements",
        "workflow_style",
    ],
}


async def analyze_transcript(content: str, filename: str = "transcript") -> dict:
    # Truncate very long transcripts to fit context window
    truncated = content[:24000] if len(content) > 24000 else content

    try:
        result = await _analyze_with_gemini(truncated)
        result["filename"] = filename
        result["char_count"] = len(content)
        result["analysis_mode"] = "llm"
        return result
    except Exception as e:
        fallback = _heuristic_analysis(content, filename=filename)
        fallback["analysis_mode"] = "heuristic_fallback"
        fallback["warning"] = (
            "Used local heuristic scoring because the Gemini analysis request failed: "
            f"{str(e)}"
        )
        return fallback


def compare_transcripts(results: list) -> dict:
    """Generate a cross-session comparison summary."""
    valid = [r for r in results if "error" not in r]
    if not valid:
        return None

    scores = {
        m: [r["metrics"][m]["score"] for r in valid if m in r.get("metrics", {})]
        for m in ["prompt_clarity", "context_provision", "iterative_refinement",
                  "critical_evaluation", "task_decomposition", "ai_leverage"]
    }

    avg_scores = {k: round(sum(v) / len(v), 1) if v else 0 for k, v in scores.items()}
    overall_scores = [r["overall_score"] for r in valid]
    best = max(valid, key=lambda r: r.get("overall_score", 0))
    styles = [r.get("workflow_style", "unknown") for r in valid]

    return {
        "session_count": len(valid),
        "average_overall": round(sum(overall_scores) / len(overall_scores), 1),
        "best_session": best.get("filename"),
        "average_metrics": avg_scores,
        "workflow_styles": styles,
        "trend": _detect_trend(overall_scores),
    }


def _detect_trend(scores: list) -> str:
    if len(scores) < 2:
        return "single session"
    delta = scores[-1] - scores[0]
    if delta > 1:
        return "improving"
    elif delta < -1:
        return "declining"
    return "consistent"


def _heuristic_analysis(content: str, filename: str = "transcript") -> dict:
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    lowered = content.lower()
    char_count = len(content)
    user_lines = [line for line in lines if _looks_like_user_turn(line)]
    assistant_lines = [line for line in lines if _looks_like_ai_turn(line)]

    phases = [
        _phase_result("Planning", lowered, ["plan", "approach", "design", "architecture", "requirements"]),
        _phase_result(
            "Implementation",
            lowered,
            ["implement", "build", "write code", "function", "component", "refactor"],
        ),
        _phase_result(
            "Debugging",
            lowered,
            ["error", "bug", "fix", "failing", "traceback", "stack trace", "issue"],
        ),
        _phase_result(
            "Review/Refinement",
            lowered,
            ["review", "improve", "refine", "cleanup", "optimize", "test", "verify"],
        ),
    ]

    prompt_clarity_score = _bounded_score(
        3
        + min(len(user_lines), 8) * 0.35
        + _keyword_hits(lowered, ["please", "can you", "need", "want", "should", "requirements"]) * 0.25
        + _keyword_hits(lowered, ["because", "so that", "goal", "expected", "output"]) * 0.4
    )
    context_provision_score = _bounded_score(
        2
        + _keyword_hits(
            lowered,
            ["file", "code", "stack trace", "error", "repo", "function", "component", "terminal", "log"],
        )
        * 0.55
        + min(char_count / 4000, 3)
    )
    iterative_refinement_score = _bounded_score(
        2
        + max(len(user_lines) - 1, 0) * 0.55
        + _keyword_hits(lowered, ["again", "instead", "change", "update", "another", "try"]) * 0.45
    )
    critical_evaluation_score = _bounded_score(
        2
        + _keyword_hits(
            lowered,
            ["why", "verify", "check", "are you sure", "does this", "tradeoff", "risk", "test"],
        )
        * 0.75
    )
    task_decomposition_score = _bounded_score(
        2
        + _keyword_hits(
            lowered,
            ["step", "first", "then", "next", "split", "break down", "plan", "phase"],
        )
        * 0.7
    )
    ai_leverage_score = _bounded_score(
        4
        + _keyword_hits(lowered, ["debug", "refactor", "analyze", "compare", "summarize", "test"]) * 0.45
        + min(len(assistant_lines), 8) * 0.2
    )

    metrics = {
        "prompt_clarity": _metric_result(
            prompt_clarity_score,
            0.48,
            "Estimated from specificity cues in user requests and the amount of goal-setting language.",
        ),
        "context_provision": _metric_result(
            context_provision_score,
            0.45,
            "Estimated from references to code, files, logs, errors, and other technical context in the transcript.",
        ),
        "iterative_refinement": _metric_result(
            iterative_refinement_score,
            0.46,
            "Estimated from repeated user follow-ups and phrases suggesting revision or incremental improvement.",
        ),
        "critical_evaluation": _metric_result(
            critical_evaluation_score,
            0.4,
            "Estimated from verification, questioning, testing, and risk-checking language.",
        ),
        "task_decomposition": _metric_result(
            task_decomposition_score,
            0.42,
            "Estimated from sequencing and planning language that suggests breaking work into steps.",
        ),
        "ai_leverage": _metric_result(
            ai_leverage_score,
            0.43,
            "Estimated from whether the session appears to use AI for meaningful engineering work rather than trivial lookups.",
        ),
    }

    overall_score = round(sum(metrics[key]["score"] for key in METRIC_KEYS) / len(METRIC_KEYS), 1)
    workflow_style = _detect_style(lowered)
    strengths = _top_strengths(metrics)
    improvements = _top_improvements(metrics)
    summary = _build_summary(filename, phases, overall_score, workflow_style, char_count)

    return {
        "filename": filename,
        "char_count": char_count,
        "summary": summary,
        "overall_score": overall_score,
        "workflow_style": workflow_style,
        "phases": phases,
        "metrics": metrics,
        "strengths": strengths,
        "improvements": improvements,
    }


def _bounded_score(value: float) -> float:
    return round(max(0, min(10, value)), 1)


def _metric_result(score: float, confidence: float, rationale: str) -> dict:
    return {
        "score": score,
        "confidence": confidence,
        "rationale": rationale,
    }


def _keyword_hits(text: str, keywords: list[str]) -> int:
    return sum(1 for keyword in keywords if keyword in text)


def _phase_result(name: str, text: str, keywords: list[str]) -> dict:
    for keyword in keywords:
        if keyword in text:
            return {"name": name, "detected": True, "evidence": f"Detected keyword: '{keyword}'"}
    return {"name": name, "detected": False, "evidence": "No strong signal detected"}


def _looks_like_user_turn(line: str) -> bool:
    lower = line.lower()
    return lower.startswith(("user:", "human:", "me:", "developer:", "engineer:"))


def _looks_like_ai_turn(line: str) -> bool:
    lower = line.lower()
    return lower.startswith(("assistant:", "ai:", "chatgpt:", "claude:", "cursor:", "copilot:"))


def _detect_style(text: str) -> str:
    if _keyword_hits(text, ["plan", "step", "requirements", "break down"]) >= 2:
        return "systematic"
    if _keyword_hits(text, ["together", "pair", "collaborate", "back-and-forth"]) >= 1:
        return "collaborative"
    if _keyword_hits(text, ["error", "fix", "bug", "broken"]) >= 2:
        return "reactive"
    return "exploratory"


def _build_summary(
    filename: str,
    phases: list[dict],
    overall_score: float,
    workflow_style: str,
    char_count: int,
) -> str:
    detected_phases = [phase["name"] for phase in phases if phase["detected"]]
    phase_text = ", ".join(detected_phases) if detected_phases else "no clear workflow phases"
    return (
        f"{filename} was evaluated using a local heuristic fallback rather than the Gemini API. "
        f"The transcript shows {phase_text} across roughly {char_count} characters, with an estimated "
        f"workflow score of {overall_score}/10 and a mostly {workflow_style} style."
    )


def _top_strengths(metrics: dict) -> list[str]:
    labels = {
        "prompt_clarity": "Prompts appear reasonably specific and goal-directed.",
        "context_provision": "The transcript includes technical context that helps ground the work.",
        "iterative_refinement": "The workflow shows signs of iteration instead of a single-shot exchange.",
        "critical_evaluation": "There are some signals of verification or questioning rather than blind acceptance.",
        "task_decomposition": "The work appears to be broken into smaller steps or phases.",
        "ai_leverage": "AI seems to be used for substantive engineering tasks.",
    }
    top_keys = sorted(METRIC_KEYS, key=lambda key: metrics[key]["score"], reverse=True)[:3]
    return [labels[key] for key in top_keys]


def _top_improvements(metrics: dict) -> list[str]:
    labels = {
        "prompt_clarity": "State the target outcome, constraints, and expected output format more explicitly.",
        "context_provision": "Include more concrete code snippets, file names, errors, or repo context in prompts.",
        "iterative_refinement": "Build more deliberately on prior AI outputs instead of jumping between requests.",
        "critical_evaluation": "Add more explicit verification, testing, and challenge of AI suggestions.",
        "task_decomposition": "Break larger requests into smaller sequential sub-problems before asking for help.",
        "ai_leverage": "Use AI more deliberately for debugging, planning, or review where leverage is highest.",
    }
    bottom_keys = sorted(METRIC_KEYS, key=lambda key: metrics[key]["score"])[:3]
    return [labels[key] for key in bottom_keys]


async def _analyze_with_gemini(content: str) -> dict:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            f"{SYSTEM_PROMPT}\n\n"
                            f"Analyze this AI coding session transcript:\n\n{content}"
                        )
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "responseJsonSchema": ANALYSIS_SCHEMA,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GEMINI_API_URL,
            headers={
                "x-goog-api-key": GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    text = _extract_gemini_text(data)
    return json.loads(text)


def _extract_gemini_text(data: dict) -> str:
    candidates = data.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"No Gemini candidates returned: {json.dumps(data)}")

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if part.get("text")]
    if not text_parts:
        raise RuntimeError(f"No Gemini text returned: {json.dumps(data)}")

    return "".join(text_parts)
