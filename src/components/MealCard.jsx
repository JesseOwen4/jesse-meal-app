import T from "../theme";
import Icon from "./Icon";

export default function MealCard({ meal, index, accent, isLogged, isMealPrep, onToggleLog, onEdit, onSwap, onPhoto, viewMode }) {
  const hasCfa = meal.items.some(item => item.toLowerCase().includes("chick-fil-a"));
  const isSundayView = false; // parent passes this via context if needed

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${meal.portable ? T.green + "44" : T.border}`,
      borderRadius: 12, overflow: "hidden",
      opacity: isLogged ? 0.65 : 1, transition: "opacity 0.2s",
    }}>
      {/* Meal header */}
      <div style={{ padding: "12px 14px", background: T.surfaceHigh, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: accent + "18", border: `1px solid ${accent}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: accent, fontWeight: "bold", flexShrink: 0,
        }}>
          {isMealPrep ? "📦" : index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: T.text }}>{meal.name}</span>
            {meal.portable && (
              <span style={{
                fontSize: 9, color: T.green, background: T.greenDim,
                border: `1px solid ${T.green}44`, borderRadius: 4,
                padding: "1px 6px", letterSpacing: 1,
              }}>🎒 PORTABLE</span>
            )}
            {isLogged && <span style={{ fontSize: 9, color: T.green, letterSpacing: 1 }}>✓ LOGGED</span>}
          </div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>{meal.time}</div>
        </div>
        {!isMealPrep && viewMode !== "prep" && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 15, color: T.text }}>{meal.cals}<span style={{ fontSize: 9, color: T.textDim }}> cal</span></div>
            <div style={{ fontSize: 10, color: T.textDim }}>P{meal.p}·F{meal.f}·C{meal.c}</div>
          </div>
        )}
      </div>

      {/* Meal body */}
      <div style={{ padding: "12px 14px" }}>
        <ul style={{ margin: 0, padding: "0 0 0 16px", color: T.textMid, fontSize: 13, lineHeight: 1.8 }}>
          {meal.items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
        {!isMealPrep && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={onToggleLog} style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              background: isLogged ? T.green + "22" : T.surfaceHigh,
              border: `1px solid ${isLogged ? T.green : T.border}`,
              color: isLogged ? T.green : T.textMid,
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}>{isLogged ? "✓ Logged" : "Log this meal"}</button>
            {onSwap && (
              <button onClick={onSwap} style={{
                padding: "10px 14px", borderRadius: 8,
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                color: T.textDim, cursor: "pointer",
              }}>
                <Icon name="swap" size={15} color={T.textDim} />
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} style={{
                padding: "10px 14px", borderRadius: 8,
                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                color: T.textDim, cursor: "pointer",
              }}>
                <Icon name="edit" size={15} color={T.textDim} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
