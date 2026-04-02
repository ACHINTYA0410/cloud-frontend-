import { useState, useEffect, useRef, useCallback } from "react";
import type { PowerReading } from "@/lib/types";
import { predictAnomalies } from "@/api";

// ── Realistic value ranges from UCI dataset ──────────────────────────────────
function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateSensorReading(forceAnomaly = false): number[] {
  if (forceAnomaly) {
    return [
      randomInRange(6.0, 11.0),    // global_active_power (spike)
      randomInRange(0.8, 1.4),     // global_reactive_power
      randomInRange(223.0, 235.0), // voltage
      randomInRange(28.0, 45.0),   // global_intensity (spike)
      randomInRange(30.0, 40.0),   // sub_metering_1 (spike)
      randomInRange(15.0, 20.0),   // sub_metering_2
      randomInRange(15.0, 20.0),   // sub_metering_3
    ];
  }
  return [
    randomInRange(0.2, 5.0),     // global_active_power
    randomInRange(0.0, 1.0),     // global_reactive_power
    randomInRange(228.0, 245.0), // voltage
    randomInRange(0.2, 22.0),    // global_intensity
    randomInRange(0.0, 15.0),    // sub_metering_1
    randomInRange(0.0, 8.0),     // sub_metering_2
    randomInRange(0.0, 18.0),    // sub_metering_3
  ];
}

const MAX_POINTS = 60;

export function useStreamingData(intervalMs = 2000) {
  const [data, setData]               = useState<PowerReading[]>([]);
  const [isStreaming, setIsStreaming]  = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const indexRef    = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // tri-state: null = unknown, true = reachable, false = unreachable
  const backendAvailableRef = useRef<boolean | null>(null);

  // ── Single reading generation ───────────────────────────────────────────────
  const generatePoint = useCallback(async () => {
    const idx         = indexRef.current;
    indexRef.current += 1;

    const forceAnomaly = idx > 0 && idx % 10 === 0;
    const rawReading   = generateSensorReading(forceAnomaly);

    const now       = new Date();
    const timeLabel = now.toLocaleTimeString("en-GB", { hour12: false });

    // Always try the real backend — no simulation fallback
    try {
      const results = await predictAnomalies([rawReading]);
      const r       = results[0];

      if (r) {
        // Backend is alive — clear any previous error
        if (backendAvailableRef.current !== true) {
          backendAvailableRef.current = true;
          setBackendError(null);
        }

        const point: PowerReading = {
          time:                     timeLabel,
          hour:                     now.getHours(),
          consumption:              r.readings.global_active_power,
          anomalyScore:             r.score,
          isAnomaly:                r.anomaly,
          global_active_power:      r.readings.global_active_power,
          global_reactive_power:    r.readings.global_reactive_power,
          voltage:                  r.readings.voltage,
          global_intensity:         r.readings.global_intensity,
          sub_metering_1:           r.readings.sub_metering_1,
          sub_metering_2:           r.readings.sub_metering_2,
          sub_metering_3:           r.readings.sub_metering_3,
        };
        setData((prev) => {
          const next = [...prev, point];
          return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
        });
      }
    } catch (err: unknown) {
      // Backend is NOT reachable — stop the stream and surface a clear error
      backendAvailableRef.current = false;

      const message =
        err instanceof Error
          ? err.message
          : "Cannot connect to the Flask backend.";

      setBackendError(
        `Backend unreachable at http://localhost:5000. ` +
        `Make sure Flask is running (run start_backend.bat). ` +
        `Details: ${message}`
      );

      // Stop the stream so we don't keep retrying silently
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsStreaming(false);
      }
    }
  }, []);

  // ── Start / stop / reset ────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (intervalRef.current) return;
    setBackendError(null);
    backendAvailableRef.current = null;
    setIsStreaming(true);
    generatePoint();                              // immediate first reading
    intervalRef.current = setInterval(generatePoint, intervalMs);
  }, [generatePoint, intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setData([]);
    setBackendError(null);
    indexRef.current = 0;
    backendAvailableRef.current = null;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return {
    data,
    isStreaming,
    start,
    stop,
    reset,
    backendError,
    // Keep backendAvailable as derived boolean for consumers that need it
    backendAvailable: backendAvailableRef.current,
  };
}
