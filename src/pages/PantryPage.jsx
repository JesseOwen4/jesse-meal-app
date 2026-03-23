import { useState } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import BarcodeScanner from "../components/BarcodeScanner";
import { lookupBarcode } from "../utils/nutritionLookup";

const CATEGORIES = [
  { key: "Meat", color: T.accent },
  { key: "Dairy", color: T.blue },
  { key: "Produce", color: T.green },
  { key: "Pantry", color: "#a06c30" },
  { key: "Supplements", color: T.purple },
  { key: "Other", color: T.textDim },
];
const UNITS = ["lbs", "oz", "bags", "cans", "dozen", "units"];

function getStockColor(qty, threshold) {
  if (qty <= threshold) return "#e05252";
  if (qty <= threshold * 2) return T.accent;
  return T.green;
}

export default function PantryPage({ setTab, pantryItems, pantryActions }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "lbs", category: "Pantry", low_threshold: "2" });
  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  const handleBarcode = async (barcode) => {
    setScanning(false);
    setLookingUp(true);
    const result = await lookupBarcode(barcode);
    setLookingUp(false);
    if (result.found) {
      setScannedProduct(result);
    } else {
      setScannedProduct({ found: false, barcode });
    }
  };

  const saveScannedProduct = async () => {
    if (!scannedProduct?.found) return;
    const ok = await pantryActions.addItem({
      name: scannedProduct.name + (scannedProduct.brand ? ` (${scannedProduct.brand})` : ""),
      quantity: 1,
      unit: "units",
      category: "Pantry",
      low_threshold: 1,
      calories: scannedProduct.macros.calories,
      protein: scannedProduct.macros.protein,
      fat: scannedProduct.macros.fat,
      carbs: scannedProduct.macros.carbs,
      serving_size: scannedProduct.servingSize,
      barcode: scannedProduct.barcode,
    });
    if (ok) setScannedProduct(null);
  };

  const grouped = {};
  CATEGORIES.forEach(c => { grouped[c.key] = []; });
  (pantryItems || []).forEach(item => {
    const cat = grouped[item.category] ? item.category : "Other";
    grouped[cat].push(item);
  });

  const handleAdd = async () => {
    if (!newItem.name || !newItem.quantity) return;
    const ok = await pantryActions.addItem({
      name: newItem.name, quantity: parseFloat(newItem.quantity),
      unit: newItem.unit, category: newItem.category,
      low_threshold: parseFloat(newItem.low_threshold) || 2,
    });
    if (ok) { setNewItem({ name: "", quantity: "", unit: "lbs", category: "Pantry", low_threshold: "2" }); setShowAdd(false); }
  };

  const handleEditSave = async (id) => {
    const val = parseFloat(editQty);
    if (!isNaN(val)) await pantryActions.updateItem(id, { quantity: val });
    setEditingId(null);
  };

  const isEmpty = (pantryItems || []).length === 0;

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setTab("more")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
            <Icon name="back" size={20} color={T.textDim} />
          </button>
          <div style={{ fontSize: 18, color: T.text }}>Pantry</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setScanning(true)} style={{
            background: T.surface, border: `1px solid ${T.green}`, borderRadius: 8,
            padding: "7px 12px", color: T.green, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>📷 Scan</button>
          <button onClick={() => setShowAdd(true)} style={{
            background: T.accent, border: "none", borderRadius: 8,
            padding: "7px 14px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>+ Add</button>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ textAlign: "center", color: T.textDim, fontSize: 14, marginTop: 60, padding: "0 20px" }}>
          Your pantry is empty. Add items to start tracking inventory.
        </div>
      ) : (
        <div style={{ padding: "0 20px" }}>
          {CATEGORIES.map(cat => {
            const items = grouped[cat.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat.key} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: cat.color, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{cat.key}</div>
                {items.map(item => {
                  const stockColor = getStockColor(item.quantity, item.low_threshold || 2);
                  const barWidth = Math.min(item.quantity / 10, 1) * 100;
                  return (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 10, marginBottom: 6,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: T.text }}>{item.name}</div>
                        {item.calories > 0 && (
                          <div style={{ fontSize: 11, color: T.accent, marginTop: 1 }}>
                            {item.calories} cal · {item.protein}g P · {item.fat}g F · {item.carbs}g C
                            {item.serving_size ? ` (per ${item.serving_size})` : ""}
                          </div>
                        )}
                        {editingId === item.id ? (
                          <input value={editQty} onChange={e => setEditQty(e.target.value)}
                            onBlur={() => handleEditSave(item.id)}
                            onKeyDown={e => e.key === "Enter" && handleEditSave(item.id)}
                            autoFocus type="number"
                            style={{ fontSize: 13, color: T.text, background: T.surfaceHigh, border: `1px solid ${T.accent}`, borderRadius: 4, padding: "2px 6px", width: 60, outline: "none", fontFamily: "inherit" }}
                          />
                        ) : (
                          <div onClick={() => { setEditingId(item.id); setEditQty(String(item.quantity)); }}
                            style={{ fontSize: 12, color: T.textDim, cursor: "pointer", marginTop: 2 }}>
                            {item.quantity} {item.unit}
                          </div>
                        )}
                        <div style={{ height: 4, width: 80, background: T.border, borderRadius: 2, marginTop: 4 }}>
                          <div style={{ height: 4, width: `${barWidth}%`, background: stockColor, borderRadius: 2, transition: "width 0.3s" }} />
                        </div>
                      </div>
                      <button onClick={() => pantryActions.deleteItem(item.id)} style={{
                        background: "none", border: "none", color: "#e05252", cursor: "pointer", padding: 8,
                      }}>✕</button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Barcode Scanner */}
      {scanning && (
        <BarcodeScanner
          onDetected={handleBarcode}
          onClose={() => setScanning(false)}
        />
      )}

      {/* Looking up barcode */}
      {lookingUp && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: T.text, fontSize: 16 }}>Looking up product...</div>
        </div>
      )}

      {/* Scanned Product Review */}
      {scannedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={e => { if (e.target === e.currentTarget) setScannedProduct(null); }}>
          <div style={{
            background: T.surface, borderRadius: "16px 16px 0 0",
            width: "100%", maxWidth: 480, margin: "0 auto", padding: 20,
          }}>
            {scannedProduct.found ? (
              <>
                <div style={{ fontSize: 16, color: T.text, marginBottom: 4 }}>{scannedProduct.name}</div>
                {scannedProduct.brand && <div style={{ fontSize: 12, color: T.textDim, marginBottom: 12 }}>{scannedProduct.brand}</div>}
                {scannedProduct.image && (
                  <img src={scannedProduct.image} alt="" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, marginBottom: 12 }} />
                )}
                <div style={{
                  background: T.surfaceHigh, borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                }}>
                  <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 8 }}>
                    NUTRITION {scannedProduct.per === "serving" ? `(per serving${scannedProduct.servingSize ? ` — ${scannedProduct.servingSize}` : ""})` : "(per 100g)"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {[
                      ["Calories", scannedProduct.macros.calories, T.accent],
                      ["Protein", scannedProduct.macros.protein + "g", T.green],
                      ["Fat", scannedProduct.macros.fat + "g", T.blue],
                      ["Carbs", scannedProduct.macros.carbs + "g", T.purple],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: "bold", color }}>{val}</div>
                        <div style={{ fontSize: 9, color: T.textDim }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setScannedProduct(null)} style={{
                    flex: 1, padding: 12, borderRadius: 8, background: T.surfaceHigh,
                    border: `1px solid ${T.border}`, color: T.textDim, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Cancel</button>
                  <button onClick={saveScannedProduct} style={{
                    flex: 2, padding: 12, borderRadius: 8, background: T.accent,
                    border: "none", color: "#fff", fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Add to Pantry</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, color: T.text, marginBottom: 8 }}>Product Not Found</div>
                <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16 }}>
                  Barcode {scannedProduct.barcode} wasn't found in the database. You can add it manually.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setScannedProduct(null)} style={{
                    flex: 1, padding: 12, borderRadius: 8, background: T.surfaceHigh,
                    border: `1px solid ${T.border}`, color: T.textDim, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Close</button>
                  <button onClick={() => { setScannedProduct(null); setShowAdd(true); }} style={{
                    flex: 1, padding: 12, borderRadius: 8, background: T.accent,
                    border: "none", color: "#fff", fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Add Manually</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: T.surface, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: 20 }}>
            <div style={{ fontSize: 16, color: T.text, marginBottom: 16 }}>Add Pantry Item</div>

            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 4 }}>NAME</div>
            <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Chicken breast" style={{
                width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 14,
                fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 12,
              }} />

            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 4 }}>QUANTITY</div>
            <input value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
              type="number" placeholder="0" style={{
                width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 14,
                fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 12,
              }} />

            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>UNIT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {UNITS.map(u => (
                <button key={u} onClick={() => setNewItem(p => ({ ...p, unit: u }))} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  background: newItem.unit === u ? T.accent : T.surfaceHigh,
                  border: `1px solid ${newItem.unit === u ? T.accent : T.border}`,
                  color: newItem.unit === u ? "#fff" : T.textDim,
                }}>{u}</button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>CATEGORY</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {CATEGORIES.filter(c => c.key !== "Other").map(c => (
                <button key={c.key} onClick={() => setNewItem(p => ({ ...p, category: c.key }))} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  background: newItem.category === c.key ? c.color : T.surfaceHigh,
                  border: `1px solid ${newItem.category === c.key ? c.color : T.border}`,
                  color: newItem.category === c.key ? "#fff" : T.textDim,
                }}>{c.key}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1, padding: 12, borderRadius: 8, background: T.surfaceHigh,
                border: `1px solid ${T.border}`, color: T.textDim, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={handleAdd} style={{
                flex: 1, padding: 12, borderRadius: 8, background: T.accent,
                border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
