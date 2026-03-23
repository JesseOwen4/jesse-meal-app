import T from "../theme";

export default function EditMealModal({ editContent, setEditContent, onSave, onClose }) {
  const updateItem = (i, val) => {
    const next = [...editContent.items];
    next[i] = val;
    setEditContent(p => ({ ...p, items: next }));
  };
  const removeItem = (i) => setEditContent(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const addItem = () => setEditContent(p => ({ ...p, items: [...p.items, ""] }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, margin: "0 auto",
        padding: "20px", maxHeight: "80vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, color: T.text }}>Edit Meal</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Items</div>
        {editContent.items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={item} onChange={e => updateItem(i, e.target.value)} style={{
              flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 13,
              fontFamily: "inherit", outline: "none",
            }} />
            <button onClick={() => removeItem(i)} style={{
              padding: "8px 12px", background: T.surfaceHigh, border: `1px solid ${T.border}`,
              borderRadius: 8, color: T.textDim, cursor: "pointer", fontSize: 16,
            }}>✕</button>
          </div>
        ))}
        <button onClick={addItem} style={{
          width: "100%", padding: "10px 0", background: "none",
          border: `1px dashed ${T.border}`, borderRadius: 8,
          color: T.textDim, fontSize: 12, cursor: "pointer",
          fontFamily: "inherit", marginBottom: 16,
        }}>+ Add item</button>

        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Macros</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[["Calories", "cals"], ["Protein (g)", "p"], ["Fat (g)", "f"], ["Carbs (g)", "c"]].map(([l, k]) => (
            <div key={k}>
              <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4, letterSpacing: 1 }}>{l}</div>
              <input value={editContent[k]} onChange={e => setEditContent(p => ({ ...p, [k]: e.target.value }))}
                type="number" style={{
                  width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "8px 6px", color: T.text, fontSize: 13,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }} />
            </div>
          ))}
        </div>
        <button onClick={onSave} style={{
          width: "100%", padding: "14px 0", background: T.accent,
          border: "none", borderRadius: 10, color: "#fff",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit",
        }}>Save Changes</button>
      </div>
    </div>
  );
}
