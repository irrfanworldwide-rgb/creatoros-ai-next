import type { DailyPoint } from "@/lib/admin/stats";

interface AdminChartProps {
  title: string;
  data: DailyPoint[];
  color?: string;
  prefix?: string;
}

export default function AdminChart({ title, data, color = "#A855F7", prefix = "" }: AdminChartProps) {
  const width = 600;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.value));

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.value / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1]?.x ?? padding},${height - padding} L${padding},${height - padding} Z`;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="admin-card">
      <div className="admin-card-title">
        <span>{title}</span>
        <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>
          {prefix}
          {total.toLocaleString()} total
        </span>
      </div>
      <div className="admin-chart-wrap">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ minWidth: 480 }}>
          <defs>
            <linearGradient id={`area-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#area-${title.replace(/\s/g, "")})`} stroke="none" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text3)", marginTop: 4 }}>
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
