import T from "../theme";
import { getFormattedDate, DAYS, SCHEDULE } from "../utils/dateHelpers";

export default function LogTab({ meals, loggedMeals, toggleLog, activeDay, viewMode }) {
  const formattedDate = getFormattedDate();

  // Calculate logged totals for active day
  const activeMeals = meals[activeDay] || [];
  const loggedCals = activeMeals.reduce((s, m) => {
    const key = `${activeDay}-${m.id}`;
    return s + (loggedMeals[key] ? (m.cals || 0) : 0);
  }, 0);
  const loggedProtein = activeMeals.reduce((s, m) => {
    const key = `${activeDay}-${m.id}`;
    return s + (loggedMeals[key] ? (m.p || 0) : 0);
  }, 0);

  // Determine which days to show: active day + any day with logged meals
  const visibleDays = DAYS.filter((day) => {
    if (day === activeDay) return true;
    const dayMeals = meals[day] || [];
    return dayMeals.some((m) => loggedMeals[`${day}-${m.id}`]);
  });

  const hasAnyLogged = Object.values(loggedMeals).some(Boolean);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ── Header ── */}
      <div style={{ padding: "20px 20px 8px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>Today's Log</h2>
        <div style={{ fontSize: 13, color: T.textDim, marginTop: 4 }}>{formattedDate}</div>
      </div>

      {/* ── Running Totals (hide in prep mode) ── */}
      {viewMode !== "prep" && (
        <div style={{ padding: "8px 20px" }}>
          <div style={{
            background: T.surface, borderRadius: 14,
            border: `1px solid ${T.border}`, padding: "14px 16px",
          }}>
            {/* Logged calories */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMid, marginBottom: 4 }}>
                <span>Calories</span>
                <span>{loggedCals} / 3400</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.border }}>
                <div style={{
                  height: 6, borderRadius: 3, background: T.accent,
                  width: `${Math.min((loggedCals / 3400) * 100, 100)}%`,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>

            {/* Logged protein */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMid, marginBottom: 4 }}>
                <span>Protein</span>
                <span>{loggedProtein} / 195g</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.border }}>
                <div style={{
                  height: 6, borderRadius: 3, background: T.green,
                  width: `${Math.min((loggedProtein / 195) * 100, 100)}%`,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Meal Log by Day ── */}
      {hasAnyLogged || visibleDays.length > 0 ? (
        <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {visibleDays.map((day) => {
            const dayMeals = (meals[day] || []).filter(
              (m) => !(m.cals === 0 && m.name.toLowerCase().includes("meal prep"))
            );
            if (dayMeals.length === 0) return null;

            const sched = SCHEDULE[day];
            const accent = T[sched.type];
            const isActive = day === activeDay;

            return (
              <div key={day}>
                {/* Day header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4, background: accent,
                  }} />
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: isActive ? T.text : T.textMid,
                  }}>{day}</span>
                  {isActive && (
                    <span style={{
                      fontSize: 9, color: accent, background: accent + "18",
                      border: `1px solid ${accent}33`, borderRadius: 4,
                      padding: "1px 6px", letterSpacing: 1,
                    }}>TODAY</span>
                  )}
                </div>

                {/* Meal checkboxes */}
                <div style={{
                  background: T.surface, borderRadius: 12,
                  border: `1px solid ${T.border}`, overflow: "hidden",
                }}>
                  {dayMeals.map((meal, i) => {
                    const key = `${day}-${meal.id}`;
                    const isLogged = !!loggedMeals[key];
                    return (
                      <div
                        key={meal.id}
                        onClick={() => toggleLog(day, meal.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", cursor: "pointer",
                          borderTop: i > 0 ? `1px solid ${T.border}` : "none",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: isLogged ? T.green + "22" : "transparent",
                          border: `2px solid ${isLogged ? T.green : T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, color: T.green, transition: "all 0.15s",
                        }}>
                          {isLogged && "✓"}
                        </div>

                        {/* Meal info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, color: isLogged ? T.text : T.textMid,
                            textDecoration: isLogged ? "line-through" : "none",
                            opacity: isLogged ? 0.7 : 1,
                          }}>{meal.name}</div>
                          <div style={{ fontSize: 11, color: T.textDim }}>{meal.time}</div>
                        </div>

                        {/* Cals (hide in prep mode) */}
                        {viewMode !== "prep" && (
                          <span style={{
                            fontSize: 12, color: isLogged ? T.green : T.textDim, flexShrink: 0,
                          }}>{meal.cals} cal</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div style={{
          padding: "60px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, color: T.textMid }}>No meals logged yet today</div>
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>
            Head to the Plan tab to start logging meals
          </div>
        </div>
      )}
    </div>
  );
}
