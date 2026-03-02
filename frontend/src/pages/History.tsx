import { useMemo } from "react";
import { Clock, Activity, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllRecords } from "@/hooks/useQueries";
import { Gender, RiskLevel } from "../backend";

function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === RiskLevel.high) {
    return <Badge className="bg-health-red/20 text-health-red border-health-red/30">High Risk</Badge>;
  }
  if (level === RiskLevel.moderate) {
    return <Badge className="bg-health-amber/20 text-health-amber border-health-amber/30">Moderate Risk</Badge>;
  }
  return <Badge className="bg-health-green/20 text-health-green border-health-green/30">Low Risk</Badge>;
}

export default function History() {
  const { data: records = [], isLoading } = useGetAllRecords();

  const sorted = useMemo(
    () => [...records].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [records]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Prediction History</h1>
        <p className="text-muted-foreground mt-1">
          All past risk assessments, most recent first.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Clock className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No history yet. Run a risk assessment to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((record, idx) => {
            const date = new Date(Number(record.timestamp) / 1_000_000);
            const genderLabel = record.gender === Gender.male ? "Male" : "Female";
            const displayName = record.patientName && record.patientName !== "unknown"
              ? record.patientName
              : null;
            const riskColor =
              record.riskLevel === RiskLevel.high
                ? "border-l-health-red"
                : record.riskLevel === RiskLevel.moderate
                ? "border-l-health-amber"
                : "border-l-health-green";

            return (
              <Card key={idx} className={`border-l-4 ${riskColor}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {displayName ? (
                            <span>{displayName} &mdash; </span>
                          ) : null}
                          {genderLabel}, {record.age.toString()} years old
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RiskBadge level={record.riskLevel} />
                      <span className="text-xs text-muted-foreground">
                        Score: {record.riskScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {[
                      { label: "BMI", value: record.bmi.toFixed(1) },
                      { label: "BP", value: `${record.bloodPressure.toString()} mmHg` },
                      { label: "Glucose", value: `${record.glucose.toString()} mg/dL` },
                      { label: "Hgb", value: `${record.hemoglobin.toFixed(1)} g/dL` },
                      { label: "Chol", value: `${record.cholesterol.toString()} mg/dL` },
                      { label: "Smoker", value: record.isSmoker ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/50 rounded p-1.5 text-center">
                        <p className="text-muted-foreground">{label}</p>
                        <p className="font-medium mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-3 h-3" />
          {sorted.length} record{sorted.length !== 1 ? "s" : ""} total
        </div>
      )}
    </div>
  );
}
