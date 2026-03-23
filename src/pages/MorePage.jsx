import React, { useState } from "react";
import T from "../theme";
import Icon from "../components/Icon";

const ITEMS = [
  { id: "progress", icon: "chart", label: "Progress", desc: "Weekly stats & streaks", color: T.accent },
  { id: "weight", icon: "scale", label: "Weight", desc: "Body weight log", color: T.green },
  { id: "pantry", icon: "shelf", label: "Pantry", desc: "Ingredient inventory", color: T.blue },
  { id: "prep", icon: "clock", label: "Meal Prep", desc: "Sunday prep guide", color: T.purple },
  { id: "photos", icon: "camera", label: "Photos", desc: "Meal & progress pics", color: T.accent },
  { id: "receipt", icon: "receipt", label: "Receipts", desc: "Scan & track prices", color: T.green },
  { id: "settings", icon: "gear", label: "Settings", desc: "Reminders & preferences", color: T.textMid },
];

export default function MorePage({ setTab }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 20px" }}>
      {ITEMS.map((item) => (
        <div
          key={item.id}
          onClick={() => setTab(item.id)}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            background: T.surface,
            border: `1px solid ${hoveredId === item.id ? item.color : T.border}`,
            borderRadius: 14,
            padding: 16,
            cursor: "pointer",
            transition: "border-color 0.15s ease",
          }}
        >
          <Icon name={item.icon} size={24} color={item.color} />
          <div style={{ fontSize: 14, color: T.text, marginTop: 10 }}>{item.label}</div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
