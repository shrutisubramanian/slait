export default function ReflectionSection() {
  return (
    <section className="reflection-section">
      <h2>What Makes a Good AI-Assisted Workflow?</h2>
      <p>
        This tool evaluates your AI coding sessions across six dimensions. Here's what each metric,
        phase, and style means.
      </p>

      <div className="reflection-guide">
        <h3>Workflow Metrics</h3>
        <dl>
          <div className="reflection-item">
            <dt>Prompt Clarity</dt>
            <dd>
              How clear, specific, and well-formed your prompts are. Good prompts reduce
              back-and-forth and get better results faster.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Context Provision</dt>
            <dd>
              Whether you provide relevant context like code snippets, error messages, or
              constraints. Context helps AI give accurate, targeted responses.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Iterative Refinement</dt>
            <dd>
              Whether you build on AI responses, refine outputs, and iterate toward a solution
              rather than accepting the first answer.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Critical Evaluation</dt>
            <dd>
              Whether you question, verify, or push back on AI output. Good engineers don't blindly
              accept AI suggestions.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Task Decomposition</dt>
            <dd>
              Whether you break complex problems into manageable pieces before asking for help.
              Smaller, focused prompts yield better results.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>AI Leverage</dt>
            <dd>
              Whether you're using AI for the right tasks — meaningful work, not trivial lookups,
              and not over-relying on AI for decisions that require human judgment.
            </dd>
          </div>
        </dl>
      </div>

      <div className="reflection-guide">
        <h3>Session Phases</h3>
        <dl>
          <div className="reflection-item">
            <dt>Planning</dt>
            <dd>
              Scoping the problem, discussing approach, or outlining requirements before writing
              code.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Implementation</dt>
            <dd>Writing, generating, or modifying code to build the feature.</dd>
          </div>
          <div className="reflection-item">
            <dt>Debugging</dt>
            <dd>Diagnosing errors, tracing issues, or fixing broken behavior.</dd>
          </div>
          <div className="reflection-item">
            <dt>Review/Refinement</dt>
            <dd>
              Reviewing generated code, improving quality, or iterating on the solution.
            </dd>
          </div>
        </dl>
      </div>

      <div className="reflection-guide">
        <h3>Workflow Styles</h3>
        <dl>
          <div className="reflection-item">
            <dt>Exploratory</dt>
            <dd>Open-ended discovery, trying different approaches, learning as you go.</dd>
          </div>
          <div className="reflection-item">
            <dt>Systematic</dt>
            <dd>
              Structured, methodical approach with clear steps and deliberate decisions.
            </dd>
          </div>
          <div className="reflection-item">
            <dt>Reactive</dt>
            <dd>Responding to problems as they arise, less upfront planning.</dd>
          </div>
          <div className="reflection-item">
            <dt>Collaborative</dt>
            <dd>
              Treating AI as a true partner, with back-and-forth dialogue and shared
              problem-solving.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
