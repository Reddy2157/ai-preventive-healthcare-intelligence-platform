export interface RiskInputs {
  age: number;
  bmi: number;
  bloodPressure: number;
  glucose: number;
  hemoglobin: number;
  cholesterol: number;
  isSmoker: boolean;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface RiskResult {
  score: number;
  level: RiskLevel;
}

export function calculateRiskScore(inputs: RiskInputs): RiskResult {
  let risk = 0;

  // Age factor (0–20 points)
  risk += ((inputs.age - 20) / 80) * 20;

  // BMI factor
  if (inputs.bmi >= 30) risk += 15;
  else if (inputs.bmi >= 25) risk += 7.5;

  // Blood pressure factor
  if (inputs.bloodPressure >= 140) risk += 15;
  else if (inputs.bloodPressure >= 120) risk += 7.5;

  // Glucose factor
  if (inputs.glucose >= 140) risk += 15;
  else if (inputs.glucose >= 110) risk += 7.5;

  // Cholesterol factor
  if (inputs.cholesterol >= 250) risk += 15;
  else if (inputs.cholesterol >= 200) risk += 7.5;

  // Hemoglobin factor
  if (inputs.hemoglobin < 10) risk += 20;
  else if (inputs.hemoglobin < 12) risk += 10;

  // Smoking factor
  if (inputs.isSmoker) risk += 20;

  const score = Math.min(100, Math.max(0, risk));

  let level: RiskLevel;
  if (score < 40) level = 'LOW';
  else if (score < 75) level = 'MODERATE';
  else level = 'HIGH';

  return { score, level };
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return '#22c55e';
    case 'MODERATE': return '#f59e0b';
    case 'HIGH': return '#ef4444';
  }
}

export function getRiskBgClass(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'bg-risk-low border-risk-low risk-low';
    case 'MODERATE': return 'bg-risk-moderate border-risk-moderate risk-moderate';
    case 'HIGH': return 'bg-risk-high border-risk-high risk-high';
  }
}
