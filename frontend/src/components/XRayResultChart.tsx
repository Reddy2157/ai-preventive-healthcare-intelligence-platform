import React from 'react';

interface XRayResultChartProps {
  normalProb: number;
  pneumoniaProb: number;
}

export function XRayResultChart({ normalProb, pneumoniaProb }: XRayResultChartProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-health-green">Normal</span>
          <span className="text-health-green font-semibold">{(normalProb * 100).toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${normalProb * 100}%`,
              backgroundColor: '#22c55e',
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-health-red">Pneumonia</span>
          <span className="text-health-red font-semibold">{(pneumoniaProb * 100).toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pneumoniaProb * 100}%`,
              backgroundColor: '#ef4444',
            }}
          />
        </div>
      </div>
    </div>
  );
}
