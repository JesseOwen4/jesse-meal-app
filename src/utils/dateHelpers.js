export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export const SCHEDULE = {
  Monday: { type: "upper", label: "Upper Body" },
  Tuesday: { type: "rest", label: "Rest Day" },
  Wednesday: { type: "lower", label: "Lower Body" },
  Thursday: { type: "upper", label: "Upper Body" },
  Friday: { type: "rest", label: "Rest Day" },
  Saturday: { type: "lower", label: "Lower Body" },
  Sunday: { type: "run", label: "Run Day" },
};

export function getTodayName() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return DAYS.includes(today) ? today : "Monday";
}

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export function isSunday() {
  return new Date().getDay() === 0;
}

export function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
