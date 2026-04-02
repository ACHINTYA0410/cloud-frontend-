import { Play, Square, RotateCcw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  pointCount: number;
  backendError?: string | null;
  backendAvailable?: boolean;
}

export default function StreamControls({
  isStreaming,
  onStart,
  onStop,
  onReset,
  pointCount,
  backendError,
  backendAvailable,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {backendError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">Data source unavailable</p>
            <p className="mt-0.5 text-xs text-red-600/80 font-mono leading-relaxed">
              {backendError}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming && backendAvailable !== false ? "bg-green-500 animate-pulse" : "bg-primary"
              }`}
            />
            <span className="text-xs font-semibold text-foreground">
              {isStreaming && backendAvailable !== false ? "Live" : "Paused"}
            </span>
            <span className="text-xs text-muted-foreground">{pointCount} readings</span>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-sans font-medium hover:bg-secondary transition-colors disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>

          {isStreaming ? (
            <motion.button
              onClick={onStop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-card text-sm font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Square className="w-4 h-4" />
              Stop
            </motion.button>
          ) : (
            <motion.button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans font-semibold hover:opacity-90 transition-opacity shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-4 h-4" />
              Start Stream
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
