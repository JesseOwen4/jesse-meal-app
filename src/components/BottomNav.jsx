import T from "../theme";
import Icon from "./Icon";

const JESSE_TABS = [
  { id: "plan", icon: "plan", label: "Plan" },
  { id: "ideas", icon: "ideas", label: "Recipes" },
  { id: "grocery", icon: "grocery", label: "Grocery" },
  { id: "log", icon: "log", label: "Log" },
  { id: "more", icon: "more", label: "More" },
];

const PREP_TABS = [
  { id: "plan", icon: "plan", label: "Plan" },
  { id: "grocery", icon: "grocery", label: "Grocery" },
  { id: "prep", icon: "clock", label: "Prep" },
  { id: "photos", icon: "camera", label: "Photos" },
];

export default function BottomNav({ tab, setTab, viewMode }) {
  const tabs = viewMode === "prep" ? PREP_TABS : JESSE_TABS;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: T.surface,
      borderTop: `1px solid ${T.border}`, zIndex: 10,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ display: "flex", maxWidth: 480, margin: "0 auto" }}>
        {tabs.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            flex: 1, padding: "14px 4px 10px",
            background: "none", border: "none",
            color: tab === item.id ? T.accent : T.textDim,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            transition: "color 0.15s",
          }}>
            <Icon name={item.icon} size={26} color={tab === item.id ? T.accent : T.textDim} />
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</div>
            {tab === item.id && <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
