import React from "react";
import T from "../theme";
import { DEFAULT_GROCERY } from "../constants";

export default function GroceryTab({
  checkedItems,
  setCheckedItems,
  viewMode,
  pantryItems,
}) {
  const totalGrocery = DEFAULT_GROCERY.reduce(
    (sum, sec) => sum + sec.items.length,
    0
  );
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalGrocery > 0 ? checkedCount / totalGrocery : 0;

  const toggleGrocery = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetGrocery = () => {
    setCheckedItems({});
  };

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              margin: 0,
            }}
          >
            Weekly List
          </h2>
          <p
            style={{
              fontSize: 11,
              color: T.textDim,
              marginTop: 4,
              letterSpacing: 0.5,
            }}
          >
            Shared · syncs in real time
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: T.textMid }}>
            {checkedCount}/{totalGrocery}
          </span>
          <button
            onClick={resetGrocery}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              color: T.textMid,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: T.surface,
          borderRadius: 3,
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: T.green,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Grocery sections */}
      {DEFAULT_GROCERY.map((section) => (
        <div key={section.section} style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: section.color,
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            {section.section}
          </h3>

          {section.items.map((item) => {
            const isChecked = !!checkedItems[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleGrocery(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 12px",
                  borderBottom: `1px solid ${T.border}`,
                  cursor: "pointer",
                  opacity: isChecked ? 0.45 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${isChecked ? section.color : T.borderLight}`,
                    background: isChecked ? section.color : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                >
                  {isChecked && (
                    <span
                      style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Item info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: T.text,
                      textDecoration: isChecked ? "line-through" : "none",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textDim,
                      marginTop: 2,
                    }}
                  >
                    {item.qty}
                    {viewMode !== "prep" && item.use && (
                      <span style={{ color: T.textDim }}> · {item.use}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Sunday Prep Checklist */}
      <div
        style={{
          borderLeft: `3px solid ${T.green}`,
          background: T.greenDim,
          borderRadius: "0 12px 12px 0",
          padding: "16px 18px",
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.green,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          📦 SUNDAY PREP CHECKLIST
        </div>
        {[
          "Cook 2–3 lbs meatballs → portion into 4 containers",
          "Bake 3–4 lbs chicken breasts → slice & portion with rice",
          "Form & cook 2 lbs ground beef patties → store",
          "Hard boil 8–10 eggs → peel & refrigerate",
          "Cook big batch of rice for the week",
          "Stock fridge: jerky + cheddar for pre-bed snacks",
          "Pack Monday's portable lunch the night before",
        ].map((step, i) => (
          <div
            key={i}
            style={{
              fontSize: 13,
              color: T.textMid,
              padding: "4px 0",
              paddingLeft: 4,
            }}
          >
            ✦ {step}
          </div>
        ))}
      </div>
    </div>
  );
}
