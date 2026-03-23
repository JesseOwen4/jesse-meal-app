import React from "react";
import T from "../theme";
import Icon from "../components/Icon";

const DEFAULT_REMINDERS = [
  { label: "Breakfast", time: "07:30", enabled: true },
  { label: "Lunch", time: "11:30", enabled: true },
  { label: "Pre-Workout", time: "17:00", enabled: true },
  { label: "Post-Workout Shake", time: "21:00", enabled: true },
  { label: "Before Bed", time: "22:30", enabled: true },
];

const sectionHeader = {
  fontSize: 10,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: T.textDim,
  marginBottom: 10,
};

const card = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: "14px 16px",
};

const inputStyle = {
  background: T.surfaceHigh,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.text,
  fontSize: 14,
  padding: "8px 12px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function pillStyle(active) {
  return {
    background: active ? T.accent + "22" : T.surface,
    border: `1px solid ${active ? T.accent : T.border}`,
    color: active ? T.accent : T.textDim,
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s ease",
  };
}

function toggleStyle(active) {
  return {
    width: 44,
    height: 24,
    borderRadius: 12,
    background: active ? T.accent : T.border,
    position: "relative",
    cursor: "pointer",
    border: "none",
    padding: 0,
    flexShrink: 0,
    transition: "background 0.2s ease",
  };
}

function toggleKnob(active) {
  return {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: 3,
    left: active ? 23 : 3,
    transition: "left 0.2s ease",
  };
}

export default function SettingsPage({
  setTab,
  notificationSettings,
  setNotificationSettings,
  viewMode,
  setViewMode,
  weighInFrequency,
  setWeighInFrequency,
  goalWeight,
  setGoalWeight,
}) {
  const notifEnabled = notificationSettings?.enabled ?? false;
  const reminders = notificationSettings?.reminders?.length
    ? notificationSettings.reminders
    : DEFAULT_REMINDERS;

  const updateReminder = (index, updates) => {
    const updated = reminders.map((r, i) => (i === index ? { ...r, ...updates } : r));
    setNotificationSettings({ ...notificationSettings, enabled: notifEnabled, reminders: updated });
  };

  return (
    <div>
      {/* Back header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setTab("more")}
          style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}
        >
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Settings</div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* View Mode */}
        <div>
          <div style={sectionHeader}>View Mode</div>
          <div style={{ ...card, display: "flex", gap: 8 }}>
            <button
              onClick={() => setViewMode("jesse")}
              style={pillStyle(viewMode === "jesse")}
            >
              Jesse's View
            </button>
            <button
              onClick={() => setViewMode("prep")}
              style={pillStyle(viewMode === "prep")}
            >
              Prep Mode (Wife)
            </button>
          </div>
        </div>

        {/* Goal Weight */}
        <div>
          <div style={sectionHeader}>Goal Weight</div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                value={goalWeight ?? ""}
                onChange={(e) => setGoalWeight(e.target.value ? Number(e.target.value) : "")}
                placeholder="Target weight"
                style={{ ...inputStyle, width: 120 }}
              />
              <span style={{ fontSize: 13, color: T.textDim }}>lbs</span>
            </div>
          </div>
        </div>

        {/* Weigh-in Frequency */}
        <div>
          <div style={sectionHeader}>Weigh-in Frequency</div>
          <div style={{ ...card, display: "flex", gap: 8 }}>
            {["Daily", "Weekly", "Bi-weekly"].map((opt) => (
              <button
                key={opt}
                onClick={() => setWeighInFrequency(opt.toLowerCase())}
                style={pillStyle(weighInFrequency === opt.toLowerCase())}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Reminders */}
        <div>
          <div style={sectionHeader}>Meal Reminders</div>
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Master toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: T.text }}>Enable Notifications</span>
              <button
                onClick={() =>
                  setNotificationSettings({ ...notificationSettings, enabled: !notifEnabled, reminders })
                }
                style={toggleStyle(notifEnabled)}
              >
                <div style={toggleKnob(notifEnabled)} />
              </button>
            </div>

            {/* Individual reminders */}
            {notifEnabled &&
              reminders.map((rem, i) => (
                <div
                  key={rem.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    paddingTop: i === 0 ? 10 : 0,
                    borderTop: i === 0 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{rem.label}</span>
                  <input
                    type="time"
                    value={rem.time}
                    onChange={(e) => updateReminder(i, { time: e.target.value })}
                    style={{ ...inputStyle, width: 110, textAlign: "center", padding: "6px 8px", fontSize: 13 }}
                  />
                  <button
                    onClick={() => updateReminder(i, { enabled: !rem.enabled })}
                    style={toggleStyle(rem.enabled)}
                  >
                    <div style={toggleKnob(rem.enabled)} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
