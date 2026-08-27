import { Bot } from "lucide-react";

export function CopilotPage() {
  return (
    <div className="coming-soon-panel">
      <div className="coming-soon-icon">
        <Bot size={24} />
      </div>

      <span className="panel-eyebrow">
        PayGuard workspace
      </span>

      <h2>AI Risk Copilot</h2>

      <p>
        Ask questions grounded in your live PayGuard data.
      </p>

      <div className="coming-soon-line" />
    </div>
  );
}
