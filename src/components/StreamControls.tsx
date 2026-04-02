import { Play, Square, RotateCcw, Radio, AlertTriangle } from "lucide-react";

interface Props {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  pointCount: number;
  backendError?: string | null;
}

export default function StreamControls({
  isStreaming,
  onStart,
  onStop,
  onReset,
  pointCount,
  backendError,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* ── Error banner — shown when backend is unreachable ── */}
      {backendError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Backend Unreachable
            </p>
            <p className="mt-0.5 text-xs text-red-600/80 font-mono leading-relaxed">
              {backendError}
            </p>
            <p className="mt-2 text-xs text-red-600 font-medium">
              Fix: Open a terminal in <code>backend/</code> and run{" "}
              <code className="bg-red-100 px-1 rounded">start_backend.bat</code>{" "}
              (or <code className="bg-red-100 px-1 rounded">python app.py</code>
              ), then click Reset and Start Stream again.
            </p>
          </div>
        </div>
      )}

      {/* ── Controls row ── */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div
            className={`relative p-2 rounded-xl ${
              isStreaming ? "bg-primary/10" : "bg-secondary"
            }`}
          >
            <Radio
              className={`w-5 h-5 ${
                isStreaming ? "text-primary" : "text-muted-foreground"
              }`}
            />
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground leading-tight">
              {isStreaming ? "Live Stream Active" : "Stream Controls"}
            </h3>
            <p className="text-sm text-muted-foreground font-sans">
              {isStreaming
                ? `Receiving data from Flask backend · ${pointCount} readings captured`
                : backendError
                ? "Stream stopped — backend connection failed"
                : "Start the power consumption stream (requires Flask backend on port 5000)"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-sans font-medium hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {isStreaming ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-card text-sm font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Play className="w-4 h-4" />
              Start Stream
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
