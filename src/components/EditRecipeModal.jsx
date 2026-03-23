import { useState } from "react";
import T from "../theme";
import { estimateMacros } from "../hooks/useRecipes";

const CATEGORIES = ["🍳 Breakfast", "🎒 Portable Meals", "⚡ Snacks & Sides", "🥩 Dinner", "🥗 Other"];

export default function EditRecipeModal({ recipe, onSave, onClose }) {
  const [form, setForm] = useState({
    name: recipe?.name || "",
    category: recipe?.category || CATEGORIES[0],
    macros: recipe?.macros || "",
    time: recipe?.time || "",
    desc: recipe?.desc || "",
    ingredients: recipe?.ingredients?.length ? recipe.ingredients : [{ name: "", qty: "" }],
    tip: recipe?.tip || "",
    notes: recipe?.notes || "",
  });
  const [estimating, setEstimating] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const updateIngredient = (i, field, val) => {
    const next = [...form.ingredients];
    next[i] = { ...next[i], [field]: val };
    set("ingredients", next);
  };
  const removeIngredient = (i) => set("ingredients", form.ingredients.filter((_, idx) => idx !== i));
  const addIngredient = () => set("ingredients", [...form.ingredients, { name: "", qty: "" }]);

  const handleEstimate = async () => {
    const validIngs = form.ingredients.filter(i => i.name.trim());
    if (validIngs.length === 0) return;
    setEstimating(true);
    const result = await estimateMacros(validIngs);
    if (result) set("macros", result);
    setEstimating(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = {
      ...form,
      ingredients: form.ingredients.filter(i => i.name.trim()),
    };
    onSave(data);
  };

  const inputStyle = {
    width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 13,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 10, color: T.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, margin: "0 auto",
        padding: 20, maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, color: T.text }}>{recipe ? "Edit Recipe" : "New Recipe"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        {/* Name */}
        <div style={labelStyle}>Name</div>
        <input value={form.name} onChange={e => set("name", e.target.value)}
          placeholder="Recipe name" style={{ ...inputStyle, marginBottom: 12 }} />

        {/* Category */}
        <div style={labelStyle}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => set("category", c)} style={{
              padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              background: form.category === c ? T.accent : T.surfaceHigh,
              border: `1px solid ${form.category === c ? T.accent : T.border}`,
              color: form.category === c ? "#fff" : T.textDim,
            }}>{c}</button>
          ))}
        </div>

        {/* Ingredients — name + qty */}
        <div style={labelStyle}>Ingredients</div>
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input value={ing.qty} onChange={e => updateIngredient(i, "qty", e.target.value)}
              placeholder="Qty" style={{ ...inputStyle, width: 80, flex: "none" }} />
            <input value={ing.name} onChange={e => updateIngredient(i, "name", e.target.value)}
              placeholder="Ingredient name" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => removeIngredient(i)} style={{
              padding: "8px 10px", background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, color: T.textDim, cursor: "pointer", fontSize: 16, flexShrink: 0,
            }}>✕</button>
          </div>
        ))}
        <button onClick={addIngredient} style={{
          width: "100%", padding: "10px 0", background: "none",
          border: `1px dashed ${T.border}`, borderRadius: 8,
          color: T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
        }}>+ Add ingredient</button>

        {/* Macros + estimate button */}
        <div style={labelStyle}>Macros</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={form.macros} onChange={e => set("macros", e.target.value)}
            placeholder="680 cal · 52g P" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleEstimate} disabled={estimating} style={{
            padding: "10px 12px", borderRadius: 8, flexShrink: 0,
            background: T.green, border: "none",
            color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            opacity: estimating ? 0.6 : 1,
          }}>{estimating ? "..." : "⚡ Estimate"}</button>
        </div>

        {/* Cook time */}
        <div style={labelStyle}>Cook Time</div>
        <input value={form.time} onChange={e => set("time", e.target.value)}
          placeholder="10 min" style={{ ...inputStyle, marginBottom: 12 }} />

        {/* Description */}
        <div style={labelStyle}>Description</div>
        <textarea value={form.desc} onChange={e => set("desc", e.target.value)}
          placeholder="How to make it..." rows={3}
          style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />

        {/* Tip */}
        <div style={labelStyle}>Tip (optional)</div>
        <input value={form.tip} onChange={e => set("tip", e.target.value)}
          placeholder="Cooking tip..." style={{ ...inputStyle, marginBottom: 12 }} />

        {/* Notes */}
        <div style={labelStyle}>Notes (optional)</div>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
          placeholder="Personal notes..." rows={2}
          style={{ ...inputStyle, resize: "vertical", marginBottom: 16 }} />

        <button onClick={handleSave} style={{
          width: "100%", padding: "14px 0", background: T.accent,
          border: "none", borderRadius: 10, color: "#fff",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit",
        }}>Save Recipe</button>
      </div>
    </div>
  );
}
