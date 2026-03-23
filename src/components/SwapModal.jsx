import T from "../theme";
import Icon from "./Icon";
import { MEAL_IDEAS } from "../constants";
import { findSimilarMeals } from "../utils/macroHelpers";

export default function SwapModal({ meal, day, onSwap, onClose }) {
  if (!meal) return null;

  const suggestions = findSimilarMeals(meal.cals, meal.p, MEAL_IDEAS);

  const handleSwap = (suggestion) => {
    const newMealData = {
      name: suggestion.name,
      items: suggestion.ingredients,
      cals: suggestion.parsedCals,
      p: suggestion.parsedProt,
    };
    onSwap(day, meal.id, newMealData);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, margin: "0 auto",
        padding: 20, maxHeight: "75vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 16, color: T.text }}>Swap: {meal.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 14 }}>
          Similar options based on {meal.cals} cal target
        </div>

        {suggestions.length === 0 ? (
          <div style={{ textAlign: "center", color: T.textDim, fontSize: 14, padding: "32px 0" }}>
            No similar meals found in your recipes.
          </div>
        ) : (
          suggestions.map((s, idx) => (
            <div key={idx} style={{
              background: T.surfaceHigh, borderRadius: 10, padding: 14, marginBottom: 10,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 14, color: T.text }}>{s.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: T.accent }}>{s.parsedCals} cal · {s.parsedProt}g P</span>
                {s.category && (
                  <span style={{ fontSize: 10, color: T.accent, background: T.accent + "22", borderRadius: 4, padding: "1px 6px" }}>
                    {s.category}
                  </span>
                )}
              </div>
              {s.time && <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>⏱ {s.time}</div>}
              <button onClick={() => handleSwap(s)} style={{
                marginTop: 8, padding: "7px 14px", borderRadius: 6,
                background: T.accent, border: "none", color: "#fff",
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>Use This</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
