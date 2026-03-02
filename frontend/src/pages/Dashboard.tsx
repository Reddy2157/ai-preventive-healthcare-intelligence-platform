import { useMemo } from "react";
import { Download, Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllRecords } from "@/hooks/useQueries";
import { exportRecordsToCSV } from "@/utils/csvExport";
import { Gender, RiskLevel } from "../backend";

function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === RiskLevel.high) {
    return <Badge className="bg-health-red/20 text-health-red border-health-red/30">High</Badge>;
  }
  if (level === RiskLevel.moderate) {
    return <Badge className="bg-health-amber/20 text-health-amber border-health-amber/30">Moderate</Badge>;
  }
  return <Badge className="bg-health-green/20 text-health-green border-health-green/30">Low</Badge>;
}

export default function Dashboard() {
  const { data: records = [], isLoading } = useGetAllRecords();

  const stats = useMemo(() => {
    const total = records.length;
    const highRisk = records.filter((r) => r.riskLevel === RiskLevel.high).length;
    const moderate = records.filter((r) => r.riskLevel === RiskLevel.moderate).length;
    const avgScore =
      total > 0
        ? records.reduce((sum, r) => sum + r.riskScore, 0) / total
        : 0;
    return { total, highRisk, moderate, avgScore };
  }, [records]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [records]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Health Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all patient risk assessments.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportRecordsToCSV(records)}
          disabled={records.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: Users, color: "text-primary" },
          { label: "High Risk", value: stats.highRisk, icon: AlertTriangle, color: "text-health-red" },
          { label: "Moderate Risk", value: stats.moderate, icon: TrendingUp, color: "text-health-amber" },
          { label: "Avg Risk Score", value: stats.avgScore.toFixed(1), icon: Activity, color: "text-health-green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-12 mt-1" />
                  ) : (
                    <p className="text-xl font-bold">{value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Activity className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No records yet. Add a patient assessment to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>Glucose</TableHead>
                  <TableHead>Cholesterol</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(Number(record.timestamp) / 1_000_000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {record.patientName && record.patientName !== "unknown"
                        ? record.patientName
                        : <span className="text-muted-foreground italic">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {record.gender === Gender.male ? "Male" : "Female"},{" "}
                        {record.age.toString()}y
                        {record.isSmoker && (
                          <span className="ml-1 text-xs text-muted-foreground">(smoker)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{record.bmi.toFixed(1)}</TableCell>
                    <TableCell>{record.bloodPressure.toString()}</TableCell>
                    <TableCell>{record.glucose.toString()}</TableCell>
                    <TableCell>{record.cholesterol.toString()}</TableCell>
                    <TableCell>{record.riskScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <RiskBadge level={record.riskLevel} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
