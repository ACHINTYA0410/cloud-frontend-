import { useStreamingData } from "@/hooks/useStreamingData";
import PowerChart from "@/components/PowerChart";
import AnomalyBar from "@/components/AnomalyBar";
import StatsCards from "@/components/StatsCards";
import StreamControls from "@/components/StreamControls";
import LiveFeed from "@/components/LiveFeed";

export default function Index() {
  const { data, isStreaming, start, stop, reset, backendAvailable, backendError } =
    useStreamingData(2000);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto px-8 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground leading-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time power consumption monitoring
            </p>
          </div>
        </div>

        <StreamControls
          isStreaming={isStreaming}
          onStart={start}
          onStop={stop}
          onReset={reset}
          pointCount={data.length}
          backendError={backendError}
          backendAvailable={backendAvailable}
        />
        <StatsCards data={data} />
        <PowerChart data={data} />
        <AnomalyBar data={data} />
        <LiveFeed data={data} />
      </div>
    </div>
  );
}
