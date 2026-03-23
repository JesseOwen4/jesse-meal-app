import T from "../theme";
import Icon from "../components/Icon";
import MealCard from "../components/MealCard";
import { DAYS, DAY_SHORT, SCHEDULE } from "../utils/dateHelpers";

export default function PlanTab({
  activeDay, setActiveDay, meals, loggedMeals, toggleLog,
  openEdit, openSwap, viewMode, waterData, setWaterData,
}) {
  const sched = SCHEDULE[activeDay];
  const accent = T[sched.type];
  const dayMeals = meals[activeDay] || [];

  const totalCals = dayMeals.reduce((s, m) => s + (m.cals || 0), 0);
  const totalP = dayMeals.reduce((s, m) => s + (m.p || 0), 0);
  const totalF = dayMeals.reduce((s, m) => s + (m.f || 0), 0);
  const totalC = dayMeals.reduce((s, m) => s + (m.c || 0), 0);

  const loggedCals = dayMeals.reduce((s, m) => {
    const key = `${activeDay}-${m.id}`;
    return s + (loggedMeals[key] ? (m.cals || 0) : 0);
  }, 0);

  const water = waterData?.water || 0;
  const creatine = waterData?.creatine || false;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ── Day Pills ── */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        padding: "16px 20px 8px", WebkitOverflowScrolling: "touch",
      }}>
        {DAYS.map((day, i) => {
          const s = SCHEDULE[day];
          const color = T[s.type];
          const active = day === activeDay;
          return (
            <button key={day} onClick={() => setActiveDay(day)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: 10,
              background: active ? color + "22" : T.surface,
              border: `1px solid ${active ? color : T.border}`,
              color: active ? color : T.textDim,
              fontSize: 12, fontWeight: active ? 700 : 500,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}>
              {DAY_SHORT[i]}
            </button>
          );
        })}
      </div>

      {/* ── Day Summary Card ── */}
      <div style={{ padding: "8px 20px" }}>
        <div style={{
          background: T.surface, borderRadius: 14,
          border: `1px solid ${accent}33`, padding: "14px 16px",
        }}>
          {/* Schedule label */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: accent,
              }} />
              <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{sched.label}</span>
            </div>
            <span style={{ fontSize: 11, color: T.textDim }}>Gym 7–8 PM</span>
          </div>

          {/* Total cals bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMid, marginBottom: 4 }}>
              <span>Total</span>
              <span>{totalCals} / 3400 cal</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: T.border }}>
              <div style={{
                height: 6, borderRadius: 3, background: accent,
                width: `${Math.min((totalCals / 3400) * 100, 100)}%`,
                transition: "width 0.3s",
              }} />
            </div>
          </div>

          {/* Logged cals bar */}
          <div style={{ marginBottom: viewMode === "prep" ? 0 : 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMid, marginBottom: 4 }}>
              <span>Logged</span>
              <span>{loggedCals} / 3400 cal</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: T.border }}>
              <div style={{
                height: 6, borderRadius: 3, background: T.green,
                width: `${Math.min((loggedCals / 3400) * 100, 100)}%`,
                transition: "width 0.3s",
              }} />
            </div>
          </div>

          {/* P/F/C breakdown (hide in prep mode) */}
          {viewMode !== "prep" && (
            <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 4 }}>
              {[
                { label: "Protein", val: totalP, unit: "g", color: T.accent },
                { label: "Fat", val: totalF, unit: "g", color: T.blue },
                { label: "Carbs", val: totalC, unit: "g", color: T.green },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.val}<span style={{ fontSize: 10, fontWeight: 400 }}>{m.unit}</span></div>
                  <div style={{ fontSize: 10, color: T.textDim }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Water / Creatine Tracker ── */}
      <div style={{ padding: "0 20px", marginTop: 12 }}>
        <div style={{
          background: T.surface, borderRadius: 12,
          padding: "12px 16px", border: `1px solid ${T.border}`,
        }}>
          {/* Water row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: T.textMid, flexShrink: 0 }}>💧</span>
            <div
              onClick={() => { if (water < 8) setWaterData({ ...waterData, water: water + 1 }); }}
              style={{ display: "flex", gap: 6, cursor: "pointer", flex: 1 }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: i < water ? T.blue : "transparent",
                  border: `2px solid ${i < water ? T.blue : T.border}`,
                  transition: "all 0.15s",
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.textMid, flexShrink: 0, minWidth: 28, textAlign: "right" }}>{water}/8</span>
            <button
              onClick={() => { if (water > 0) setWaterData({ ...waterData, water: water - 1 }); }}
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                color: T.textDim, fontSize: 16, lineHeight: 1,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit", padding: 0,
              }}
            >−</button>
          </div>

          {/* Creatine toggle */}
          <div
            onClick={() => setWaterData({ ...waterData, creatine: !creatine })}
            style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: creatine ? T.purple + "33" : "transparent",
              border: `2px solid ${creatine ? T.purple : T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: T.purple, transition: "all 0.15s",
            }}>
              {creatine && "✓"}
            </div>
            <span style={{ fontSize: 13, color: creatine ? T.text : T.textDim }}>💊 Creatine</span>
          </div>
        </div>
      </div>

      {/* ── Meal Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px 0" }}>
        {dayMeals.map((meal, i) => {
          const key = `${activeDay}-${meal.id}`;
          const isMealPrep = meal.cals === 0 && meal.name.toLowerCase().includes("meal prep");
          return (
            <MealCard
              key={meal.id}
              meal={meal}
              index={i}
              accent={accent}
              isLogged={!!loggedMeals[key]}
              isMealPrep={isMealPrep}
              onToggleLog={() => toggleLog(activeDay, meal.id)}
              onEdit={() => openEdit(activeDay, meal)}
              onSwap={() => openSwap(activeDay, meal)}
              viewMode={viewMode}
            />
          );
        })}
      </div>
    </div>
  );
}
