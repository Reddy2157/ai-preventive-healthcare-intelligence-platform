import { RiskLevel } from "../backend";

export interface RiskResult {
  score: number;
  level: RiskLevel;
}

export function calculateRiskScore(params: {
  age: number;
  bmi: number;
  bloodPressure: number;
  glucose: number;
  hemoglobin: number;
  cholesterol: number;
  isSmoker: boolean;
}): RiskResult {
  let risk = 0;

  const { age, bmi, bloodPressure, glucose, hemoglobin, cholesterol, isSmoker } = params;

  if (age >= 20 && age <= 100) {
    risk += ((age - 20) / 80) * 20;
  }

  if (bmi >= 30) risk += 15;
  else if (bmi >= 25) risk += 7.5;

  if (bloodPressure >= 140) risk += 15;
  else if (bloodPressure >= 120) risk += 7.5;

  if (glucose >= 140) risk += 15;
  else if (glucose >= 110) risk += 7.5;

  if (cholesterol >= 250) risk += 15;
  else if (cholesterol >= 200) risk += 7.5;

  if (hemoglobin < 10) risk += 20;
  else if (hemoglobin < 12) risk += 10;

  if (isSmoker) risk += 20;

  const score = Math.min(100, risk);

  let level: RiskLevel;
  if (score < 33.3) {
    level = RiskLevel.low;
  } else if (score < 66.6) {
    level = RiskLevel.moderate;
  } else {
    level = RiskLevel.high;
  }

  return { score, level };
}
