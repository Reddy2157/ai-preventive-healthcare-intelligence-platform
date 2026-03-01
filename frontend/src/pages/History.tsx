import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllRecords } from '@/hooks/useQueries';
import { History as HistoryIcon, Activity, ClipboardList } from 'lucide-react';
import type { HealthRecord } from '../backend';

function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' {
  if (score < 40) return 'LOW';
  if (score < 75) return 'MODERATE';
  return 'HIGH';
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function RiskRecordCard({ record }: { record: HealthRecord }) {
  const level = getRiskLevel(record.riskScore);
  const levelColors = {
    LOW: { badge: 'bg-risk-low border-risk-low risk-low', dot: 'bg-health-green' },
    MODERATE: { badge: 'bg-risk-moderate border-risk-moderate risk-moderate', dot: 'bg-health-amber' },
    HIGH: { badge: 'bg-risk-high border-risk-high risk-high', dot: 'bg-health-red' },
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${levelColors[level].dot}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold font-display truncate">
                {record.firstName} {record.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatTimestamp(record.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-display font-bold">{record.riskScore.toFixed(0)}%</span>
            <Badge className={`border text-xs font-semibold ${levelColors[level].badge}`}>
              {level}
            </Badge>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'Age', value: record.age.toString() },
            { label: 'BMI', value: record.bmi.toFixed(1) },
            { label: 'BP', value: `${record.bloodPressure}` },
            { label: 'Glucose', value: `${record.glucose}` },
            { label: 'Hgb', value: record.hemoglobin.toFixed(1) },
            { label: 'Chol.', value: `${record.cholesterol}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/40 rounded-md px-2 py-1.5 text-center">
              <p className="text-xs text-muted-foreground leading-none">{label}</p>
              <p className="text-xs font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground capitalize">
            {record.gender === 'male' ? '♂ Male' : '♀ Female'}
          </span>
          {record.isSmoker && (
            <span className="text-xs text-health-amber">🚬 Smoker</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function History() {
  const { data: records, isLoading } = useGetAllRecords();

  const sortedRecords = React.useMemo(() => {
    if (!records) return [];
    return [...records].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [records]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-accent" />
          Prediction History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          All past risk assessments stored on the Internet Computer blockchain.
        </p>
      </div>

      {/* Risk Assessment History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-accent" />
          <h2 className="font-display text-base font-semibold">Risk Assessment History</h2>
          {records && (
            <Badge variant="secondary" className="text-xs ml-1">
              {records.length} record{records.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedRecords.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No risk assessments yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Submit a risk prediction to see history here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedRecords.map((record, idx) => (
              <RiskRecordCard key={idx} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
