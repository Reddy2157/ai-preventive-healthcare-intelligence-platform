import React, { useEffect, useRef } from 'react';
import { getRiskColor, type RiskLevel } from '@/lib/riskCalculator';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskGauge({ score, level, size = 220 }: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = (size * 0.65) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.38;
    const lineWidth = size * 0.1;

    ctx.clearRect(0, 0, size, size * 0.65);

    // Draw background arc segments
    const segments = [
      { start: Math.PI, end: Math.PI * 1.4, color: '#22c55e' },   // LOW (0–40%)
      { start: Math.PI * 1.4, end: Math.PI * 1.75, color: '#f59e0b' }, // MODERATE (40–75%)
      { start: Math.PI * 1.75, end: Math.PI * 2, color: '#ef4444' },   // HIGH (75–100%)
    ];

    segments.forEach(({ start, end, color }) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.strokeStyle = color + '33';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
    });

    // Draw filled arc up to score
    const scoreAngle = Math.PI + (score / 100) * Math.PI;
    const fillColor = getRiskColor(level);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, scoreAngle);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw needle
    const needleAngle = Math.PI + (score / 100) * Math.PI;
    const needleLength = radius - lineWidth / 2 - 4;
    const nx = cx + Math.cos(needleAngle) * needleLength;
    const ny = cy + Math.sin(needleAngle) * needleLength;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Score text
    ctx.font = `bold ${size * 0.14}px Space Grotesk, sans-serif`;
    ctx.fillStyle = fillColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score.toFixed(0)}%`, cx, cy - radius * 0.35);

    // Labels
    ctx.font = `${size * 0.055}px Inter, sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.fillText('0', cx - radius - lineWidth / 2 - 4, cy + 4);
    ctx.fillText('100', cx + radius + lineWidth / 2 + 4, cy + 4);

  }, [score, level, size]);

  const levelColors: Record<RiskLevel, string> = {
    LOW: 'text-health-green',
    MODERATE: 'text-health-amber',
    HIGH: 'text-health-red',
  };

  const levelBg: Record<RiskLevel, string> = {
    LOW: 'bg-risk-low border-risk-low',
    MODERATE: 'bg-risk-moderate border-risk-moderate',
    HIGH: 'bg-risk-high border-risk-high',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold font-display ${levelColors[level]} ${levelBg[level]}`}>
        {level === 'LOW' && '🟢 LOW RISK'}
        {level === 'MODERATE' && '🟠 MODERATE RISK'}
        {level === 'HIGH' && '🔴 HIGH RISK'}
      </div>
    </div>
  );
}
