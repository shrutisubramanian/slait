import type { AnalysisResult, ComparisonResult } from '../types';
import SessionCard from './SessionCard';
import ComparisonCard from './ComparisonCard';

interface ResultsPanelProps {
  results: AnalysisResult[] | null;
  comparison: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResultsPanel({ results, comparison, isLoading, error }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="loading-indicator">
        <div className="spinner" />
        Analyzing your transcripts…
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (results) {
    const allFailed = results.length > 0 && results.every(r => !!r.error);

    return (
      <div className="results-panel">
        {allFailed && !comparison && (
          <p>All sessions failed to analyze. Please check your files and try again.</p>
        )}
        {results.map((r, i) => (
          <SessionCard key={r.filename ?? i} result={r} />
        ))}
        {comparison && <ComparisonCard comparison={comparison} />}
      </div>
    );
  }

  return null;
}
