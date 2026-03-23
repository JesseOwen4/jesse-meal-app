import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import T from "../theme";

const COLORS = [T.accent, T.green, T.blue, T.purple, "#a06c30"];

export default function Chart({ type = "bar", data = [], dataKeys = [], xKey = "date", height = 200, referenceLine }) {
  if (!data.length) return <div style={{ color: T.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>No data yet</div>;

  const tooltipStyle = { backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 };

  if (type === "pie") {
    // For pie, use first dataKey only, data should have { name, value } format
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11} fill={T.accent}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: T.textDim }} stroke={T.border} />
          <YAxis tick={{ fontSize: 10, fill: T.textDim }} stroke={T.border} domain={["auto", "auto"]} />
          <Tooltip contentStyle={tooltipStyle} />
          {referenceLine && <ReferenceLine y={referenceLine.y} stroke={referenceLine.color || T.green} strokeDasharray="5 5" label={{ value: referenceLine.label, fill: referenceLine.color || T.green, fontSize: 10 }} />}
          {dataKeys.map((dk, i) => <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color || COLORS[i]} name={dk.name || dk.key} dot={{ r: 3 }} strokeWidth={2} />)}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: T.textDim }} stroke={T.border} />
        <YAxis tick={{ fontSize: 10, fill: T.textDim }} stroke={T.border} />
        <Tooltip contentStyle={tooltipStyle} />
        {referenceLine && <ReferenceLine y={referenceLine.y} stroke={referenceLine.color || T.accent} strokeDasharray="5 5" label={{ value: referenceLine.label, fill: referenceLine.color || T.accent, fontSize: 10 }} />}
        {dataKeys.map((dk, i) => <Bar key={dk.key} dataKey={dk.key} fill={dk.color || COLORS[i]} name={dk.name || dk.key} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}
