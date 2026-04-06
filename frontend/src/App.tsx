import { useState } from 'react';
import type { ApiResponse, AnalysisResult, ComparisonResult } from './types';
import UploadZone from './components/UploadZone';
import ResultsPanel from './components/ResultsPanel';
import ReflectionSection from './components/ReflectionSection';
import './App.css';

export default function App() {
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(files: File[]) {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setComparison(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setResults(data.results);
      setComparison(data.comparison);
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Could not reach the analysis server. Is the backend running?');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Workflow Evaluator</h1>
        <p>Analyze your AI-assisted coding sessions and get structured feedback on your workflow quality.</p>
      </header>
      <main className="app-main">
        <UploadZone onSubmit={handleSubmit} isSubmitting={isLoading} />
        <ResultsPanel results={results} comparison={comparison} isLoading={isLoading} error={error} />
      </main>
      <ReflectionSection />
    </div>
  );
}
