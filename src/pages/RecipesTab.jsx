import { useState } from "react";
import T from "../theme";
import Icon from "../components/Icon";

export default function RecipesTab({ grouped, recipeActions, onScan, onEdit }) {
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = Object.keys(grouped || {});

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, padding: "0 20px", marginBottom: 16 }}>
        <button onClick={() => onEdit(null)} style={{
          flex: 1, padding: "12px 0", borderRadius: 10,
          background: T.accent, border: "none",
          color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>+ Add Recipe</button>
        <button onClick={onScan} style={{
          flex: 1, padding: "12px 0", borderRadius: 10,
          background: T.surface, border: `1px solid ${T.border}`,
          color: T.text, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>📷 Scan Recipe</button>
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: "center", color: T.textDim, fontSize: 14, marginTop: 40 }}>
          No recipes yet. Add one or scan a paper recipe!
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24, padding: "0 20px" }}>
          <div style={{ fontSize: 16, color: T.text, marginBottom: 10, fontWeight: "bold" }}>{cat}</div>

          {grouped[cat].map(recipe => {
            const isExpanded = expandedId === recipe.id;

            return (
              <div key={recipe.id} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 12, marginBottom: 10, overflow: "hidden",
              }}>
                {/* Header — tap to expand */}
                <div onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                  style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: T.text, marginBottom: 4 }}>{recipe.name}</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {recipe.macros && <span style={{ fontSize: 12, color: T.accent }}>{recipe.macros}</span>}
                      {recipe.time && <span style={{ fontSize: 12, color: T.textDim }}>⏱ {recipe.time}</span>}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 18, color: T.textDim,
                    transform: isExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s", lineHeight: 1,
                  }}>⌄</span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.border}` }}>
                    {recipe.desc && (
                      <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: "12px 0 14px" }}>
                        {recipe.desc}
                      </p>
                    )}

                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
                          Ingredients
                        </div>
                        <ul style={{ margin: 0, padding: "0 0 0 16px", color: T.textMid, fontSize: 13, lineHeight: 1.8 }}>
                          {recipe.ingredients.map((ing, j) => (
                            <li key={j}>
                              {typeof ing === "object"
                                ? <>{ing.qty && <span style={{ color: T.text }}>{ing.qty}</span>} {ing.name}</>
                                : ing
                              }
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recipe.tip && (
                      <div style={{
                        padding: "8px 12px", background: T.accent + "0d",
                        borderLeft: `2px solid ${T.accent}55`, borderRadius: "0 6px 6px 0",
                        fontSize: 12, color: T.textMid, fontStyle: "italic", lineHeight: 1.6, marginBottom: 12,
                      }}>💡 {recipe.tip}</div>
                    )}

                    {recipe.notes && (
                      <div style={{
                        padding: "8px 12px", background: T.blue + "0d",
                        borderLeft: `2px solid ${T.blue}55`, borderRadius: "0 6px 6px 0",
                        fontSize: 12, color: T.textMid, lineHeight: 1.6, marginBottom: 12,
                      }}>📝 {recipe.notes}</div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(recipe); }} style={{
                        flex: 1, padding: "10px 0", borderRadius: 8,
                        background: T.surfaceHigh, border: `1px solid ${T.border}`,
                        color: T.textMid, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                      }}>✏️ Edit</button>
                      {confirmDelete === recipe.id ? (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); recipeActions.deleteRecipe(recipe.id); setConfirmDelete(null); }} style={{
                            flex: 1, padding: "10px 0", borderRadius: 8,
                            background: "#e05252", border: "none",
                            color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                          }}>Confirm Delete</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }} style={{
                            padding: "10px 14px", borderRadius: 8,
                            background: T.surfaceHigh, border: `1px solid ${T.border}`,
                            color: T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                          }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(recipe.id); }} style={{
                          padding: "10px 14px", borderRadius: 8,
                          background: T.surfaceHigh, border: `1px solid ${T.border}`,
                          color: "#e05252", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                        }}>🗑</button>
                      )}
                    </div>
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
