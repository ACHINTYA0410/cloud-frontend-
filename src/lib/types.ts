// Shared TypeScript interfaces for the Power Anomaly Detection app

export interface PowerReading {
  /** ISO timestamp string */
  time: string;
  hour: number;
  /** Displayed kW value (global_active_power) */
  consumption: number;
  anomalyScore: number;
  isAnomaly: boolean;
  anomalyClass: "inlier" | "borderline_outlier" | "moderate_outlier" | "critical_outlier";
  anomalySeverity: "none" | "low" | "medium" | "high";
  riskIndex: number;
  // Full sensor readings
  global_active_power: number;
  global_reactive_power: number;
  voltage: number;
  global_intensity: number;
  sub_metering_1: number;
  sub_metering_2: number;
  sub_metering_3: number;
}

export interface HistoryRow {
  id: number;
  timestamp: string;
  global_active_power: number;
  global_reactive_power: number;
  voltage: number;
  global_intensity: number;
  sub_metering_1: number;
  sub_metering_2: number;
  sub_metering_3: number;
  anomaly_score: number;
  is_anomaly: boolean;
  anomaly_class: "inlier" | "borderline_outlier" | "moderate_outlier" | "critical_outlier";
  anomaly_severity: "none" | "low" | "medium" | "high";
  risk_index: number;
}

export interface HistoryResponse {
  rows: HistoryRow[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StatsData {
  total_predictions: number;
  total_anomalies: number;
  normal_readings: number;
  anomaly_rate: number;
}

export interface ModelInfo {
  model_type: string;
  contamination: number;
  n_estimators: number;
  features: string[];
  total_records_trained: number;
  training_date: string;
  feature_means: Record<string, number>;
  feature_stds: Record<string, number>;
}

export interface PredictResult {
  index: number;
  timestamp: string;
  anomaly: boolean;
  score: number;
  anomaly_class: "inlier" | "borderline_outlier" | "moderate_outlier" | "critical_outlier";
  anomaly_severity: "none" | "low" | "medium" | "high";
  risk_index: number;
  readings: {
    global_active_power: number;
    global_reactive_power: number;
    voltage: number;
    global_intensity: number;
    sub_metering_1: number;
    sub_metering_2: number;
    sub_metering_3: number;
  };
}
