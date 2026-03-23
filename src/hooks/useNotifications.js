import { useEffect, useRef } from "react";

export function useNotifications(settings, loggedMeals, activeDay) {
  const firedRef = useRef(new Set());

  useEffect(() => {
    if (!settings?.enabled || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const today = now.toISOString().split("T")[0];

      for (const reminder of (settings.reminders || [])) {
        if (!reminder.enabled) continue;
        if (reminder.time !== currentTime) continue;
        const fireKey = `${today}-${reminder.label}`;
        if (firedRef.current.has(fireKey)) continue;
        firedRef.current.add(fireKey);

        new Notification(`Time for: ${reminder.label}`, {
          body: "Tap to open your meal plan",
          icon: "/icon-192.png",
          tag: fireKey,
          data: { day: activeDay, label: reminder.label },
        });
      }
    };

    const interval = setInterval(check, 60000);
    check(); // check immediately
    return () => clearInterval(interval);
  }, [settings, activeDay]);
}
