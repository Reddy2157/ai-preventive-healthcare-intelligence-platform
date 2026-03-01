import { type HealthRecord } from '../backend';

function getRiskLevel(score: number): string {
  if (score < 40) return 'LOW';
  if (score < 75) return 'MODERATE';
  return 'HIGH';
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

export function exportRecordsToCSV(records: HealthRecord[]): void {
  const headers = [
    'First Name',
    'Last Name',
    'Age',
    'BMI',
    'Blood Pressure (mmHg)',
    'Glucose (mg/dL)',
    'Hemoglobin (g/dL)',
    'Cholesterol (mg/dL)',
    'Gender',
    'Smoker',
    'Risk Score (%)',
    'Risk Level',
    'Date',
  ];

  const rows = records.map((r) => [
    r.firstName,
    r.lastName,
    r.age.toString(),
    r.bmi.toFixed(1),
    r.bloodPressure.toString(),
    r.glucose.toString(),
    r.hemoglobin.toFixed(1),
    r.cholesterol.toString(),
    r.gender === 'male' ? 'Male' : 'Female',
    r.isSmoker ? 'Yes' : 'No',
    r.riskScore.toFixed(1),
    getRiskLevel(r.riskScore),
    formatTimestamp(r.timestamp),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `health-records-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
