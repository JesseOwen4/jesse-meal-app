import { useState, useMemo } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import Chart from "../components/Chart";
import { useWeightLog } from "../hooks/useWeightLog";

const RANGES = [
  { label: "1W", days: 7 },
  { label: "2W", days: 14 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "All", days: null },
];

function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function WeightLogPage({ setTab, goalWeight }) {
  const { entries, loading, addEntry, deleteEntry } = useWeightLog();
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayStr());
  const [chartType, setChartType] = useState("line");
  const [range, setRange] = useState("1M");

  const filteredEntries = useMemo(() => {
    const r = RANGES.find((r) => r.label === range);
    if (!r || !r.days) return entries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - r.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return entries.filter((e) => e.date >= cutoffStr);
  }, [entries, range]);

  const chartData = useMemo(
    () => filteredEntries.map((e) => ({ date: formatShortDate(e.date), weight: Number(e.weight) })),
    [filteredEntries]
  );

  const latest = entries.length ? entries[entries.length - 1] : null;
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const change = latest && previous ? (Number(latest.weight) - Number(previous.weight)).toFixed(1) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) return;
    const ok = await addEntry(Number(weight), date);
    if (ok) {
      setWeight("");
      setDate(todayStr());
    }
  };

  const pillStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 20,
    border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? T.accent : "transparent",
    color: active ? "#fff" : T.textDim,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  });

  const recentEntries = [...entries].reverse().slice(0, 10);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setTab("more")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Weight Log</div>
      </div>

      {/* Current weight card */}
      {latest && (
        <div style={{ margin: "0 20px 16px", background: T.surface, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: T.text }}>{Number(latest.weight).toFixed(1)}</span>
            <span style={{ fontSize: 14, color: T.textDim }}>lbs</span>
            {change !== null && (
              <span style={{ fontSize: 13, color: Number(change) <= 0 ? T.green : T.accent, marginLeft: 8 }}>
                {Number(change) <= 0 ? "\u25BC" : "\u25B2"} {Math.abs(Number(change))} lbs
              </span>
            )}
          </div>
          {goalWeight && (
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Goal: {goalWeight} lbs</div>
          )}
        </div>
      )}

      {/* Entry form */}
      <form onSubmit={handleSubmit} style={{ margin: "0 20px 20px", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="number"
          step="0.1"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 14 }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 14 }}
        />
        <button type="submit" style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          Log Weight
        </button>
      </form>

      {/* Chart type toggle */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 12 }}>
        {["Line", "Bar"].map((t) => (
          <button key={t} onClick={() => setChartType(t.toLowerCase())} style={pillStyle(chartType === t.toLowerCase())}>
            {t}
          </button>
        ))}
      </div>

      {/* Time range pills */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 16 }}>
        {RANGES.map((r) => (
          <button key={r.label} onClick={() => setRange(r.label)} style={pillStyle(range === r.label)}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: "0 12px", marginBottom: 24 }}>
        <Chart
          type={chartType}
          data={chartData}
          dataKeys={[{ key: "weight", color: T.accent, name: "Weight" }]}
          xKey="date"
          height={220}
          referenceLine={goalWeight ? { y: goalWeight, label: `Goal: ${goalWeight}`, color: T.green } : undefined}
        />
      </div>

      {/* Recent entries */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 10 }}>Recent Entries</div>
        {loading && <div style={{ color: T.textDim, fontSize: 13 }}>Loading...</div>}
        {!loading && recentEntries.length === 0 && (
          <div style={{ color: T.textDim, fontSize: 13 }}>No entries yet. Log your first weight above!</div>
        )}
        {recentEntries.map((entry) => (
          <div
            key={entry.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}
          >
            <div>
              <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{Number(entry.weight).toFixed(1)} lbs</span>
              <span style={{ fontSize: 12, color: T.textDim, marginLeft: 10 }}>{formatFullDate(entry.date)}</span>
            </div>
            <button
              onClick={() => deleteEntry(entry.id)}
              style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4, fontSize: 16 }}
            >
              \u2715
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
