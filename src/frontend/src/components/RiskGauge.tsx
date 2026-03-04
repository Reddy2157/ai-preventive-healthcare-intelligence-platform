import { useEffect, useRef } from "react";
import { RiskLevel } from "../backend";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H - 20;
    const r = Math.min(W, H * 2) / 2 - 20;

    ctx.clearRect(0, 0, W, H);

    // Background arc segments
    const segments: [number, number, string][] = [
      [Math.PI, Math.PI * 1.33, "#22c55e"],
      [Math.PI * 1.33, Math.PI * 1.66, "#f59e0b"],
      [Math.PI * 1.66, Math.PI * 2, "#ef4444"],
    ];

    for (const [start, end, color] of segments) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.lineWidth = 18;
      ctx.strokeStyle = `${color}40`;
      ctx.stroke();
    }

    // Active arc
    const angle = Math.PI + (score / 100) * Math.PI;
    const activeColor =
      level === RiskLevel.high
        ? "#ef4444"
        : level === RiskLevel.moderate
          ? "#f59e0b"
          : "#22c55e";

    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, angle);
    ctx.lineWidth = 18;
    ctx.strokeStyle = activeColor;
    ctx.lineCap = "round";
    ctx.stroke();

    // Needle
    const needleAngle = Math.PI + (score / 100) * Math.PI;
    const nx = cx + (r - 10) * Math.cos(needleAngle);
    const ny = cy + (r - 10) * Math.sin(needleAngle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = 3;
    ctx.strokeStyle = activeColor;
    ctx.lineCap = "round";
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();

    // Score text
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillStyle = activeColor;
    ctx.textAlign = "center";
    ctx.fillText(score.toFixed(0), cx, cy - 20);

    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("/ 100", cx, cy - 4);
  }, [score, level]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={140}
      className="mx-auto block"
      aria-label={`Risk gauge showing score ${score.toFixed(0)}`}
    />
  );
}
