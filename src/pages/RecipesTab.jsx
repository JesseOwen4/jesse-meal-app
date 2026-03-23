import React from "react";
import T from "../theme";
import { MEAL_IDEAS } from "../constants";

export default function RecipesTab({ expandedIdea, setExpandedIdea }) {
  const toggle = (key) => {
    setExpandedIdea(expandedIdea === key ? null : key);
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <p
        style={{
          textTransform: "uppercase",
          fontSize: 11,
          letterSpacing: 1.2,
          color: T.textDim,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Tap any card for full recipe
      </p>

      {MEAL_IDEAS.map((cat) => (
        <div key={cat.cat} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: T.text,
              marginBottom: 10,
              paddingLeft: 4,
            }}
          >
            {cat.cat}
          </h3>

          {cat.items.map((item, index) => {
            const key = `${cat.cat}-${index}`;
            const isExpanded = expandedIdea === key;

            return (
              <div
                key={key}
                onClick={() => toggle(key)}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 10,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: T.text,
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: T.accent }}>
                        {item.macros}
                      </span>
                      <span style={{ fontSize: 12, color: T.textDim }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      color: T.textDim,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      lineHeight: 1,
                      marginTop: 2,
                    }}
                  >
                    ⌄
                  </span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ marginTop: 14 }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: T.textMid,
                        lineHeight: 1.5,
                        marginBottom: 14,
                      }}
                    >
                      {item.desc}
                    </p>

                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          color: T.textDim,
                          marginBottom: 6,
                        }}
                      >
                        Ingredients
                      </div>
                      {item.ingredients.map((ing, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 13,
                            color: T.text,
                            padding: "3px 0",
                            paddingLeft: 8,
                          }}
                        >
                          • {ing}
                        </div>
                      ))}
                    </div>

                    {item.tip && (
                      <div
                        style={{
                          borderLeft: `3px solid ${T.accent}`,
                          paddingLeft: 12,
                          paddingTop: 6,
                          paddingBottom: 6,
                          background: T.accentDim,
                          borderRadius: "0 8px 8px 0",
                        }}
                      >
                        <span style={{ fontSize: 13, color: T.textMid }}>
                          💡 {item.tip}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
