import { useStreamingData } from "@/hooks/useStreamingData";
import PowerChart from "@/components/PowerChart";
import AnomalyBar from "@/components/AnomalyBar";
import StatsCards from "@/components/StatsCards";
import StreamControls from "@/components/StreamControls";
import LiveFeed from "@/components/LiveFeed";
import { WifiOff, Wifi } from "lucide-react";

export default function Index() {
  const { data, isStreaming, start, stop, reset, backendAvailable, backendError } =
    useStreamingData(2000);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Page title + backend status */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time power consumption monitoring
            </p>
          </div>

          {backendAvailable === false && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
              <WifiOff className="w-3.5 h-3.5" />
              Disconnected — Flask backend down
            </div>
          )}
          {backendAvailable === true && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <Wifi className="w-3.5 h-3.5" />
              Connected to Flask backend
            </div>
          )}
        </div>

        <StreamControls
          isStreaming={isStreaming}
          onStart={start}
          onStop={stop}
          onReset={reset}
          pointCount={data.length}
          backendError={backendError}
        />
        <StatsCards data={data} />
        <PowerChart data={data} />
        <AnomalyBar data={data} />
        <LiveFeed data={data} />
      </div>
    </div>
  );
}
