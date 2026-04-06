export interface MetricResult {
  score: number;        // 0–10
  confidence: number;   // 0–1
  rationale: string;
}

export interface PhaseResult {
  name: "Planning" | "Implementation" | "Debugging" | "Review/Refinement";
  detected: boolean;
  evidence: string;
}

export interface AnalysisResult {
  filename: string;
  char_count: number;
  summary: string;
  overall_score: number;
  workflow_style: "exploratory" | "systematic" | "reactive" | "collaborative";
  phases: PhaseResult[];
  metrics: {
    prompt_clarity: MetricResult;
    context_provision: MetricResult;
    iterative_refinement: MetricResult;
    critical_evaluation: MetricResult;
    task_decomposition: MetricResult;
    ai_leverage: MetricResult;
  };
  strengths: string[];
  improvements: string[];
  error?: string;
  warning?: string;
  analysis_mode?: "llm" | "heuristic_fallback";
}

export interface ComparisonResult {
  session_count: number;
  average_overall: number;
  best_session: string;
  average_metrics: Record<string, number>;
  workflow_styles: string[];
  trend: "improving" | "declining" | "consistent" | "single session";
}

export interface ApiResponse {
  results: AnalysisResult[];
  comparison: ComparisonResult | null;
}

export interface UploadState {
  files: File[];
  errors: string[];
  isSubmitting: boolean;
}
