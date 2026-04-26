export interface PredictionResult {
  id: number;
  features: Record<string, any>;
  prediction: "attack" | "safe";
  attack_type: string | null;
  confidence: number;
}

export interface BatchResponse {
  total_packets: number;
  threats_detected: number;
  avg_confidence: number;
  attack_breakdown: Record<string, number>;
  results: PredictionResult[];
}

export interface SinglePredictionResponse {
  Prediction: string;
  Attack_Type: string;
  Confidence: number;
  [key: string]: any;
}
