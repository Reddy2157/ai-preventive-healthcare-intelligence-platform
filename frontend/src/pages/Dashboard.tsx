import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllRecords } from '@/hooks/useQueries';
import { exportRecordsToCSV } from '@/utils/csvExport';
import { LayoutDashboard, Download, RefreshCw, Database } from 'lucide-react';
import type { HealthRecord } from '../backend';

function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' {
  if (score < 40) return 'LOW';
  if (score < 75) return 'MODERATE';
  return 'HIGH';
}

function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  if (level === 'LOW') return <Badge className="bg-risk-low border-risk-low risk-low border text-xs font-semibold">LOW</Badge>;
  if (level === 'MODERATE') return <Badge className="bg-risk-moderate border-risk-moderate risk-moderate border text-xs font-semibold">MODERATE</Badge>;
  return <Badge className="bg-risk-high border-risk-high risk-high border text-xs font-semibold">HIGH</Badge>;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="py-4 px-5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: records, isLoading, refetch, isFetching } = useGetAllRecords();

  const stats = React.useMemo(() => {
    if (!records || records.length === 0) return null;
    const scores = records.map((r) => r.riskScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const high = records.filter((r) => r.riskScore >= 75).length;
    const moderate = records.filter((r) => r.riskScore >= 40 && r.riskScore < 75).length;
    const low = records.filter((r) => r.riskScore < 40).length;
    return { avg, high, moderate, low, total: records.length };
  }, [records]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-accent" />
            Health Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of all patient risk assessments stored on-chain.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {records && records.length > 0 && (
            <Button
              size="sm"
              onClick={() => exportRecordsToCSV(records)}
              className="h-9"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Records" value={stats.total} sub="patients assessed" />
          <StatCard label="Avg Risk Score" value={`${stats.avg.toFixed(1)}%`} sub="across all patients" />
          <StatCard label="High Risk" value={stats.high} sub={`${((stats.high / stats.total) * 100).toFixed(0)}% of patients`} />
          <StatCard label="Low Risk" value={stats.low} sub={`${((stats.low / stats.total) * 100).toFixed(0)}% of patients`} />
        </div>
      )}

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-accent" />
            Patient Records
          </CardTitle>
          <CardDescription className="text-xs">
            {records ? `${records.length} record${records.length !== 1 ? 's' : ''} stored on-chain` : 'Loading records...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !records || records.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No records yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Submit a risk assessment to see data here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground pl-6">Patient</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Age</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">BMI</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">BP</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Glucose</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Hgb</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Chol.</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Risk Score</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Level</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground pr-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6">
                        <div>
                          <p className="text-sm font-medium">{record.firstName} {record.lastName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{record.gender} {record.isSmoker ? '· Smoker' : ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{record.age.toString()}</TableCell>
                      <TableCell className="text-sm">{record.bmi.toFixed(1)}</TableCell>
                      <TableCell className="text-sm">{record.bloodPressure.toString()}</TableCell>
                      <TableCell className="text-sm">{record.glucose.toString()}</TableCell>
                      <TableCell className="text-sm">{record.hemoglobin.toFixed(1)}</TableCell>
                      <TableCell className="text-sm">{record.cholesterol.toString()}</TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold font-display">{record.riskScore.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell>
                        <RiskBadge score={record.riskScore} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground pr-6">
                        {formatTimestamp(record.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
