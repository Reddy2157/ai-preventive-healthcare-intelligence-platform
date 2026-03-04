import { Gender, type HealthRecord, RiskLevel } from "../backend";

export function exportRecordsToCSV(records: HealthRecord[]): void {
  const headers = [
    "Age",
    "Gender",
    "BMI",
    "Blood Pressure",
    "Glucose",
    "Hemoglobin",
    "Cholesterol",
    "Smoker",
    "Risk Score",
    "Risk Level",
    "Timestamp",
  ];

  const rows = records.map((r) => [
    r.age.toString(),
    r.gender === Gender.male ? "Male" : "Female",
    r.bmi.toFixed(1),
    r.bloodPressure.toString(),
    r.glucose.toString(),
    r.hemoglobin.toFixed(1),
    r.cholesterol.toString(),
    r.isSmoker ? "Yes" : "No",
    r.riskScore.toFixed(1),
    r.riskLevel === RiskLevel.low
      ? "Low"
      : r.riskLevel === RiskLevel.moderate
        ? "Moderate"
        : "High",
    new Date(Number(r.timestamp) / 1_000_000).toISOString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `health-records-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
