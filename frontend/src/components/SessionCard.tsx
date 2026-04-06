import type { AnalysisResult } from '../types';

const METRIC_KEYS = [
  'prompt_clarity',
  'context_provision',
  'iterative_refinement',
  'critical_evaluation',
  'task_decomposition',
  'ai_leverage',
] as const;

function formatMetricName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface SessionCardProps {
  result: AnalysisResult;
}

export default function SessionCard({ result }: SessionCardProps) {
  if (result.error) {
    return (
      <div className="session-card session-card--error">
        <p className="session-filename">{result.filename}</p>
        <p className="error-message">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="session-card">
      {result.warning && (
        <div className="warning-banner">
          {result.warning}
        </div>
      )}

      {/* Score Header */}
      <div className="score-header">
        <span className="session-filename">{result.filename}</span>
        <span className="overall-score">{result.overall_score} / 10</span>
        <span className={`workflow-style-badge style-${result.workflow_style}`}>
          {result.workflow_style.charAt(0).toUpperCase() + result.workflow_style.slice(1)}
        </span>
      </div>

      {/* Summary */}
      <p className="session-summary">{result.summary}</p>

      {/* Phase Timeline */}
      <div className="phase-timeline">
        <span>Session Phases</span>
        {result.phases.map(phase => (
          <span
            key={phase.name}
            className={`phase-chip ${phase.detected ? 'phase-detected' : 'phase-missing'}`}
            title={phase.detected ? phase.evidence : undefined}
          >
            {phase.name}
          </span>
        ))}
      </div>

      {/* Metric Grid */}
      <div className="metric-grid">
        <span>Workflow Metrics</span>
        {METRIC_KEYS.map(key => {
          const metric = result.metrics[key];
          return (
            <div key={key} className="metric-item">
              <span className="metric-label">{formatMetricName(key)}</span>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${(metric.score / 10) * 100}%` }}
                />
              </div>
              <span className="metric-score">{metric.score}/10</span>
              <span className="confidence-badge">conf: {(metric.confidence * 100).toFixed(0)}%</span>
              <p className="metric-rationale">{metric.rationale}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths */}
      <div className="strengths-section">
        <h3>Strengths</h3>
        <ul>
          {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      {/* Improvements */}
      <div className="improvements-section">
        <h3>Areas for Improvement</h3>
        <ul>
          {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
        </ul>
      </div>
    </div>
  );
}
