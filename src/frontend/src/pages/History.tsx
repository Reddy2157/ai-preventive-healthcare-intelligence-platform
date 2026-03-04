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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteRecord, useGetAllRecords } from "@/hooks/useQueries";
import { Activity, Clock, Search, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Gender, RiskLevel } from "../backend";

type RiskFilter = "all" | "low" | "moderate" | "high";

function RiskBadge({ level }: { level: RiskLevel }) {
  if (level === RiskLevel.high) {
    return (
      <Badge className="bg-health-red/20 text-health-red border-health-red/30">
        High Risk
      </Badge>
    );
  }
  if (level === RiskLevel.moderate) {
    return (
      <Badge className="bg-health-amber/20 text-health-amber border-health-amber/30">
        Moderate Risk
      </Badge>
    );
  }
  return (
    <Badge className="bg-health-green/20 text-health-green border-health-green/30">
      Low Risk
    </Badge>
  );
}

export default function History() {
  const { data: records = [], isLoading } = useGetAllRecords();
  const deleteRecord = useDeleteRecord();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  const sorted = useMemo(
    () => [...records].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [records],
  );

  const filtered = useMemo(() => {
    let result = sorted;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => r.patientName?.toLowerCase().includes(q));
    }
    if (riskFilter !== "all") {
      result = result.filter((r) => {
        if (riskFilter === "high") return r.riskLevel === RiskLevel.high;
        if (riskFilter === "moderate")
          return r.riskLevel === RiskLevel.moderate;
        if (riskFilter === "low") return r.riskLevel === RiskLevel.low;
        return true;
      });
    }
    return result;
  }, [sorted, search, riskFilter]);

  const handleDelete = (recordId: string) => {
    deleteRecord.mutate(
      { recordId },
      {
        onSuccess: () => toast.success("Record deleted successfully"),
        onError: () => toast.error("Failed to delete record"),
      },
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          Prediction History
        </h1>
        <p className="text-muted-foreground mt-1">
          All past risk assessments, most recent first.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="history.search_input"
            placeholder="Search by patient name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs
          value={riskFilter}
          onValueChange={(v) => setRiskFilter(v as RiskFilter)}
        >
          <TabsList>
            <TabsTrigger data-ocid="history.filter.tab" value="all">
              All
            </TabsTrigger>
            <TabsTrigger data-ocid="history.filter.tab" value="low">
              Low
            </TabsTrigger>
            <TabsTrigger data-ocid="history.filter.tab" value="moderate">
              Moderate
            </TabsTrigger>
            <TabsTrigger data-ocid="history.filter.tab" value="high">
              High
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4", "s5"].map((k) => (
            <Skeleton key={k} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <Clock className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">
            {sorted.length === 0
              ? "No history yet. Run a risk assessment to see results here."
              : "No records match your current search or filter."}
          </p>
        </div>
      ) : (
        <div data-ocid="history.list" className="space-y-3">
          {filtered.map((record, idx) => {
            const date = new Date(Number(record.timestamp) / 1_000_000);
            const genderLabel =
              record.gender === Gender.male ? "Male" : "Female";
            const displayName =
              record.patientName && record.patientName !== "unknown"
                ? record.patientName
                : null;
            const riskColor =
              record.riskLevel === RiskLevel.high
                ? "border-l-health-red"
                : record.riskLevel === RiskLevel.moderate
                  ? "border-l-health-amber"
                  : "border-l-health-green";
            const recordId = record.timestamp.toString();

            return (
              <Card
                key={record.timestamp.toString()}
                data-ocid={`history.item.${idx + 1}`}
                className={`border-l-4 ${riskColor}`}
              >
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
                          {date.toLocaleDateString()} at{" "}
                          {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={record.riskLevel} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`history.delete_button.${idx + 1}`}
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
                              <AlertDialogCancel data-ocid="history.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid="history.confirm_button"
                                onClick={() => handleDelete(recordId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Score: {record.riskScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {[
                      { label: "BMI", value: record.bmi.toFixed(1) },
                      {
                        label: "BP",
                        value: `${record.bloodPressure.toString()} mmHg`,
                      },
                      {
                        label: "Glucose",
                        value: `${record.glucose.toString()} mg/dL`,
                      },
                      {
                        label: "Hgb",
                        value: `${record.hemoglobin.toFixed(1)} g/dL`,
                      },
                      {
                        label: "Chol",
                        value: `${record.cholesterol.toString()} mg/dL`,
                      },
                      {
                        label: "Smoker",
                        value: record.isSmoker ? "Yes" : "No",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-muted/50 rounded p-1.5 text-center"
                      >
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
          {filtered.length !== sorted.length
            ? `${filtered.length} of ${sorted.length} record${sorted.length !== 1 ? "s" : ""} shown`
            : `${sorted.length} record${sorted.length !== 1 ? "s" : ""} total`}
        </div>
      )}
    </div>
  );
}
