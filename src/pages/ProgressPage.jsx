import { useState, useMemo } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import Chart from "../components/Chart";

const TIME_RANGES = [
  { label: "This Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "Month", days: 30 },
  { label: "All", days: null },
];

const METRICS = [
  { key: "calories", label: "Calories", color: T.accent },
  { key: "protein", label: "Protein", color: T.green },
  { key: "fat", label: "Fat", color: T.blue },
  { key: "carbs", label: "Carbs", color: T.purple },
];

function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDayName(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export default function ProgressPage({ setTab, meals, loggedMeals, allLogData = [] }) {
  const [range, setRange] = useState("This Week");
  const [chartType, setChartType] = useState("bar");
  const [selectedMetrics, setSelectedMetrics] = useState(["calories"]);

  const toggleMetric = (key) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((m) => m !== key) : prev) : [...prev, key]
    );
  };

  // Compute daily totals from allLogData + meals
  const dailyData = useMemo(() => {
    if (!allLogData.length || !meals) return [];

    return allLogData.map(({ date, logged }) => {
      const dayName = getDayName(date);
      let calories = 0, protein = 0, fat = 0, carbs = 0;

      if (logged && meals[dayName]) {
        const dayMeals = meals[dayName];
        Object.keys(logged).forEach((key) => {
          if (!logged[key]) return;
          // key format: "Monday-m1", "Monday-s1", etc.
          const parts = key.split("-");
          const mealKey = parts.slice(1).join("-");
          const meal = dayMeals[mealKey];
          if (meal) {
            calories += Number(meal.calories) || 0;
            protein += Number(meal.protein) || 0;
            fat += Number(meal.fat) || 0;
            carbs += Number(meal.carbs) || 0;
          }
        });
      }

      return { date, label: formatShortDate(date), calories, protein, fat, carbs };
    });
  }, [allLogData, meals]);

  // Filter by time range
  const filteredData = useMemo(() => {
    const r = TIME_RANGES.find((r) => r.label === range);
    if (!r || !r.days) return dailyData;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - r.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return dailyData.filter((d) => d.date >= cutoffStr);
  }, [dailyData, range]);

  // Stats
  const daysHitCal = filteredData.filter((d) => d.calories >= 3400).length;
  const totalDays = filteredData.length;

  const proteinStreak = useMemo(() => {
    let streak = 0;
    const sorted = [...dailyData].sort((a, b) => (a.date > b.date ? -1 : 1));
    for (const d of sorted) {
      if (d.protein >= 195) streak++;
      else break;
    }
    return streak;
  }, [dailyData]);

  // Pie data: average macro split by calories
  const pieData = useMemo(() => {
    if (!filteredData.length) return [];
    const avgP = filteredData.reduce((s, d) => s + d.protein, 0) / filteredData.length;
    const avgF = filteredData.reduce((s, d) => s + d.fat, 0) / filteredData.length;
    const avgC = filteredData.reduce((s, d) => s + d.carbs, 0) / filteredData.length;
    const pCal = avgP * 4;
    const fCal = avgF * 9;
    const cCal = avgC * 4;
    return [
      { name: "Protein", value: Math.round(pCal) },
      { name: "Fat", value: Math.round(fCal) },
      { name: "Carbs", value: Math.round(cCal) },
    ];
  }, [filteredData]);

  const chartData = filteredData.map((d) => ({ ...d, date: d.label }));
  const activeDataKeys = METRICS.filter((m) => selectedMetrics.includes(m.key)).map((m) => ({
    key: m.key,
    color: m.color,
    name: m.label,
  }));

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

  const isEmpty = !allLogData.length;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setTab("more")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Progress</div>
      </div>

      {isEmpty ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: T.textDim, fontSize: 14 }}>
          Start logging meals to see your progress here.
        </div>
      ) : (
        <>
          {/* Time range pills */}
          <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 16, flexWrap: "wrap" }}>
            {TIME_RANGES.map((r) => (
              <button key={r.label} onClick={() => setRange(r.label)} style={pillStyle(range === r.label)}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 10, padding: "0 20px", marginBottom: 16 }}>
            <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: 14, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.accent }}>{daysHitCal}/{totalDays}</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>days hit 3,400 cal</div>
            </div>
            <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: 14, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.green }}>{proteinStreak}</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>day protein streak (195g+)</div>
            </div>
          </div>

          {/* Chart type toggle */}
          <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 12 }}>
            {["Bar", "Line", "Pie"].map((t) => (
              <button key={t} onClick={() => setChartType(t.toLowerCase())} style={pillStyle(chartType === t.toLowerCase())}>
                {t}
              </button>
            ))}
          </div>

          {/* Metric selector (not for pie) */}
          {chartType !== "pie" && (
            <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 16, flexWrap: "wrap" }}>
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  style={{
                    ...pillStyle(selectedMetrics.includes(m.key)),
                    borderColor: selectedMetrics.includes(m.key) ? m.color : T.border,
                    background: selectedMetrics.includes(m.key) ? m.color : "transparent",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Chart */}
          <div style={{ padding: "0 12px", marginBottom: 24 }}>
            {chartType === "pie" ? (
              <Chart type="pie" data={pieData} height={240} />
            ) : (
              <Chart
                type={chartType}
                data={chartData}
                dataKeys={activeDataKeys}
                xKey="date"
                height={220}
                referenceLine={selectedMetrics.includes("calories") ? { y: 3400, label: "Goal: 3,400", color: T.accent } : undefined}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
