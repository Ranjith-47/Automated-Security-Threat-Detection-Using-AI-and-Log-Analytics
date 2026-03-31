import { BatchResponse, PredictionResult } from "@/types/ids";

const ATTACK_TYPES = ["DDoS", "Port Scan", "SQL Injection", "Brute Force", "Phishing", "Malware", "XSS", "Man-in-the-Middle"];

function randomAttackType() {
  return ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
}

export function generateMockBatchResponse(rowCount: number): BatchResponse {
  const results: PredictionResult[] = [];
  const attackBreakdown: Record<string, number> = {};
  let attacks = 0;

  for (let i = 0; i < rowCount; i++) {
    const isAttack = Math.random() < 0.28;
    const attackType = isAttack ? randomAttackType() : undefined;
    
    if (isAttack) {
      attacks++;
      attackBreakdown[attackType!] = (attackBreakdown[attackType!] || 0) + 1;
    }

    results.push({
      id: i + 1,
      features: {
        src_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        dst_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        protocol: ["TCP", "UDP", "ICMP"][Math.floor(Math.random() * 3)],
        src_port: Math.floor(Math.random() * 65535),
        dst_port: [80, 443, 22, 3389, 8080, 53][Math.floor(Math.random() * 6)],
        duration: +(Math.random() * 120).toFixed(2),
        bytes: Math.floor(Math.random() * 100000),
      },
      prediction: isAttack ? "attack" : "normal",
      attack_type: attackType,
      confidence: +(0.7 + Math.random() * 0.29).toFixed(3),
    });
  }

  return {
    total: rowCount,
    attacks,
    normal: rowCount - attacks,
    attack_breakdown: attackBreakdown,
    results,
  };
}

export function generateMockSingleResponse() {
  const isAttack = Math.random() < 0.4;
  return {
    prediction: isAttack ? "attack" as const : "normal" as const,
    attack_type: isAttack ? randomAttackType() : undefined,
    confidence: +(0.75 + Math.random() * 0.24).toFixed(3),
  };
}
