import { useState, useEffect, useRef } from "react";
import T from "../theme";
import Icon from "../components/Icon";
import { PREP_STEPS } from "../constants";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MealPrepPage({ setTab }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeTimer, setActiveTimer] = useState(null);
  const intervalRef = useRef(null);

  const sequentialSteps = PREP_STEPS.filter(s => !s.parallel);
  const parallelMax = Math.max(...PREP_STEPS.filter(s => s.parallel).map(s => s.time || 0), 0);
  const totalEstimate = sequentialSteps.reduce((sum, s) => sum + (s.time || 0), 0) + parallelMax;

  useEffect(() => {
    if (activeTimer && activeTimer.secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          const next = prev.secondsLeft - 1;
          if (next <= 0) {
            clearInterval(intervalRef.current);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Timer done: ${prev.label}`);
            }
            return null;
          }
          return { ...prev, secondsLeft: next };
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTimer?.stepId]);

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(stepId) ? next.delete(stepId) : next.add(stepId);
      return next;
    });
  };

  const startTimer = (step) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveTimer({ stepId: step.id, secondsLeft: step.time * 60, label: step.label });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button onClick={() => setTab("more")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Meal Prep</div>
      </div>

      <div style={{ padding: "0 20px 8px", fontSize: 12, color: T.textDim }}>
        Estimated total: ~{totalEstimate} min (parallel steps overlap)
      </div>

      {/* Timeline */}
      <div style={{ padding: "0 20px", paddingBottom: activeTimer ? 80 : 20 }}>
        {PREP_STEPS.map((step, idx) => {
          const done = completedSteps.has(step.id);
          const isTimerActive = activeTimer?.stepId === step.id;
          return (
            <div key={step.id} style={{ display: "flex", opacity: done ? 0.5 : 1 }}>
              {/* Left line + circle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                {idx > 0 && <div style={{ width: 2, height: 8, background: T.border }} />}
                <div style={{
                  width: 28, height: 28, borderRadius: 14,
                  background: done ? T.green : isTimerActive ? T.accent : "transparent",
                  border: done || isTimerActive ? "none" : `2px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {done ? (
                    <Icon name="check" size={14} color="#fff" />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: "bold", color: isTimerActive ? "#fff" : T.textDim }}>{idx + 1}</span>
                  )}
                </div>
                {idx < PREP_STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, minHeight: 16 }} />}
              </div>

              {/* Step content */}
              <div style={{ flex: 1, paddingLeft: 12, paddingBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span onClick={() => toggleStep(step.id)} style={{
                    fontSize: 14, color: T.text, cursor: "pointer",
                    textDecoration: done ? "line-through" : "none",
                  }}>
                    {step.label}
                  </span>
                  {step.parallel && (
                    <span style={{ fontSize: 10, color: "#fff", background: T.blue, borderRadius: 10, padding: "2px 8px", fontWeight: "bold" }}>
                      parallel
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{step.time} min</div>
                {!done && step.time > 0 && (
                  <button onClick={() => startTimer(step)} style={{
                    marginTop: 6, padding: "5px 10px", borderRadius: 6,
                    background: isTimerActive ? T.green : T.surfaceHigh,
                    border: `1px solid ${isTimerActive ? T.green : T.border}`,
                    color: isTimerActive ? "#fff" : T.accent,
                    fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {isTimerActive ? "Running..." : "Start Timer"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer Banner */}
      {activeTimer && (
        <div style={{
          position: "fixed", bottom: 60, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, background: T.surface,
          borderTop: `1px solid ${T.border}`, padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 20,
        }}>
          <div>
            <div style={{ fontSize: 12, color: T.textDim }}>{activeTimer.label}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: T.accent, fontVariantNumeric: "tabular-nums" }}>
              {formatTime(activeTimer.secondsLeft)}
            </div>
          </div>
          <button onClick={() => { clearInterval(intervalRef.current); setActiveTimer(null); }} style={{
            background: "#e05252", border: "none", borderRadius: 8,
            padding: "8px 14px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
