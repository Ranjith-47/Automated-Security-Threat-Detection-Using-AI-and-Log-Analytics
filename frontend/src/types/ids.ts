export interface PredictionResult {
  id: number;
  features: Record<string, number | string>;
  prediction: "attack" | "normal";
  attack_type?: string;
  confidence: number;
}

export interface BatchResponse {
  total: number;
  attacks: number;
  normal: number;
  attack_breakdown: Record<string, number>;
  results: PredictionResult[];
}

export interface SinglePredictionResponse {
  prediction: "attack" | "normal";
  attack_type?: string;
  confidence: number;
}
