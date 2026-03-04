import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteRecord, useGetAllRecords } from "@/hooks/useQueries";
import { exportRecordsToCSV } from "@/utils/csvExport";
import {
  Activity,
  AlertTriangle,
  Download,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Gender, RiskLevel } from "../backend";

function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === RiskLevel.high) {
    return (
      <Badge className="bg-health-red/20 text-health-red border-health-red/30">
        High
      </Badge>
    );
  }
  if (level === RiskLevel.moderate) {
    return (
      <Badge className="bg-health-amber/20 text-health-amber border-health-amber/30">
        Moderate
      </Badge>
    );
  }
  return (
    <Badge className="bg-health-green/20 text-health-green border-health-green/30">
      Low
    </Badge>
  );
}

export default function Dashboard() {
  const { data: records = [], isLoading } = useGetAllRecords();
  const deleteRecord = useDeleteRecord();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const total = records.length;
    const highRisk = records.filter(
      (r) => r.riskLevel === RiskLevel.high,
    ).length;
    const moderate = records.filter(
      (r) => r.riskLevel === RiskLevel.moderate,
    ).length;
    const avgScore =
      total > 0 ? records.reduce((sum, r) => sum + r.riskScore, 0) / total : 0;
    return { total, highRisk, moderate, avgScore };
  }, [records]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [records],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((r) => r.patientName?.toLowerCase().includes(q));
  }, [sorted, search]);

  const handleDelete = (recordId: string, patientName?: string) => {
    deleteRecord.mutate(
      { recordId },
      {
        onSuccess: () =>
          toast.success(
            patientName && patientName !== "unknown"
              ? `Record for ${patientName} deleted`
              : "Record deleted successfully",
          ),
        onError: () => toast.error("Failed to delete record"),
      },
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of all patient risk assessments.
          </p>
        </div>
        <Button
          data-ocid="dashboard.export_button"
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
          {
            label: "Total Records",
            value: stats.total,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "High Risk",
            value: stats.highRisk,
            icon: AlertTriangle,
            color: "text-health-red",
          },
          {
            label: "Moderate Risk",
            value: stats.moderate,
            icon: TrendingUp,
            color: "text-health-amber",
          },
          {
            label: "Avg Risk Score",
            value: stats.avgScore.toFixed(1),
            icon: Activity,
            color: "text-health-green",
          },
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base">All Records</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="dashboard.search_input"
                placeholder="Search by patient name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="dashboard.empty_state"
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
            >
              <Activity className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">
                {sorted.length === 0
                  ? "No records yet. Add a patient assessment to get started."
                  : "No records match your search."}
              </p>
            </div>
          ) : (
            <Table data-ocid="dashboard.table">
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
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record, idx) => {
                  const displayName =
                    record.patientName && record.patientName !== "unknown"
                      ? record.patientName
                      : undefined;
                  const recordId = record.timestamp.toString();

                  return (
                    <TableRow
                      key={record.timestamp.toString()}
                      data-ocid={`dashboard.row.${idx + 1}`}
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(
                          Number(record.timestamp) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {displayName ?? (
                          <span className="text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {record.gender === Gender.male ? "Male" : "Female"},{" "}
                          {record.age.toString()}y
                          {record.isSmoker && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (smoker)
                            </span>
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
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`dashboard.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this record
                                {displayName ? ` for ${displayName}` : ""}? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="dashboard.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid="dashboard.confirm_button"
                                onClick={() =>
                                  handleDelete(recordId, displayName)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
