import { Terminal, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface OutputPanelProps {
  output: string;
  error: string;
  isRunning: boolean;
  executionTime?: number;
}

export function OutputPanel({ output, error, isRunning, executionTime }: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</span>
        {isRunning && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin ml-auto" />}
        {!isRunning && output && !error && (
          <div className="flex items-center gap-1.5 ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            {executionTime && (
              <span className="text-xs text-muted-foreground">{executionTime}ms</span>
            )}
          </div>
        )}
        {!isRunning && error && <XCircle className="w-3.5 h-3.5 text-destructive ml-auto" />}
      </div>
      <div className="flex-1 p-4 overflow-auto font-mono text-sm">
        {isRunning && (
          <p className="text-muted-foreground animate-pulse">Running code...</p>
        )}
        {!isRunning && error && (
          <pre className="text-destructive whitespace-pre-wrap">{error}</pre>
        )}
        {!isRunning && !error && output && (
          <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
        )}
        {!isRunning && !error && !output && (
          <p className="text-muted-foreground">Run your code to see output here.</p>
        )}
      </div>
    </div>
  );
}
