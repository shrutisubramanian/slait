import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the evaluator heading and upload prompt', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /ai workflow evaluator/i })).toBeInTheDocument();
    expect(screen.getByText(/drag & drop \.txt or \.md files here/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /what makes a good ai-assisted workflow\?/i }),
    ).toBeInTheDocument();
  });
});
