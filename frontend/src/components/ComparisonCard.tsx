import type { CSSProperties } from 'react';
import type { ComparisonResult } from '../types';

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

function TrendIndicator({ trend }: { trend: ComparisonResult['trend'] }) {
  const trendClass = `trend-indicator trend-${trend.replace(' ', '-')}`;

  let content: string;
  let style: CSSProperties = {};

  switch (trend) {
    case 'improving':
      content = '↑ Improving';
      style = { color: 'green' };
      break;
    case 'declining':
      content = '↓ Declining';
      style = { color: 'red' };
      break;
    case 'consistent':
      content = '→ Consistent';
      style = { color: 'grey' };
      break;
    case 'single session':
      content = '— Single Session';
      break;
  }

  return <span className={trendClass} style={style}>{content}</span>;
}

interface ComparisonCardProps {
  comparison: ComparisonResult;
}

export default function ComparisonCard({ comparison }: ComparisonCardProps) {
  return (
    <div className="comparison-card">
      {/* Header */}
      <div>
        <h2>Session Comparison</h2>
        <p>{comparison.session_count} sessions analyzed</p>
      </div>

      {/* Average Overall Score */}
      <div className="avg-score-section">
        <span>Average Score</span>
        <span className="avg-score-value">{comparison.average_overall} / 10</span>
        <TrendIndicator trend={comparison.trend} />
      </div>

      {/* Best Session */}
      <div className="best-session-section">
        <span>Best Session</span>
        <span className="best-session-name">{comparison.best_session}</span>
      </div>

      {/* Average Metrics */}
      <div className="avg-metrics-section">
        <h3>Average Metric Scores</h3>
        {METRIC_KEYS.map(key => {
          const score = comparison.average_metrics[key] ?? 0;
          return (
            <div key={key} className="metric-item">
              <span className="metric-label">{formatMetricName(key)}</span>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
              <span className="metric-score">{score}</span>
            </div>
          );
        })}
      </div>

      {/* Workflow Styles */}
      <div className="styles-section">
        <h3>Workflow Styles</h3>
        <ul>
          {comparison.workflow_styles.map((style, i) => (
            <li key={i}>{style}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
