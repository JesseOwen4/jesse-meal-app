import { useState, useEffect } from "react";
import { useSupabaseState } from "./useSupabaseState";
import { supabase } from "./supabase";
import T from "./theme";
import { DEFAULT_MEALS, GROCERY_KEY, LOG_KEY, MEALS_KEY } from "./constants";
import { getTodayName, getTodayKey, DAYS, SCHEDULE } from "./utils/dateHelpers";

// Pages
import PlanTab from "./pages/PlanTab";
import RecipesTab from "./pages/RecipesTab";
import GroceryTab from "./pages/GroceryTab";
import LogTab from "./pages/LogTab";
import MorePage from "./pages/MorePage";
import ProgressPage from "./pages/ProgressPage";
import WeightLogPage from "./pages/WeightLogPage";
import PantryPage from "./pages/PantryPage";
import MealPrepPage from "./pages/MealPrepPage";
import PhotoLogPage from "./pages/PhotoLogPage";
import ReceiptScanPage from "./pages/ReceiptScanPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ScanRecipePage from "./pages/ScanRecipePage";

// Components
import BottomNav from "./components/BottomNav";
import EditMealModal from "./components/EditMealModal";
import SwapModal from "./components/SwapModal";

// Hooks
import { useWeightLog } from "./hooks/useWeightLog";
import { usePantry } from "./hooks/usePantry";
import { usePhotoLog } from "./hooks/usePhotoLog";
import { useNotifications } from "./hooks/useNotifications";
import { useAuth } from "./hooks/useAuth";
import { useRecipes } from "./hooks/useRecipes";
import EditRecipeModal from "./components/EditRecipeModal";

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth ──
  const auth = useAuth();

  // ── Navigation ──
  const [tab, setTab] = useState("plan");
  const [activeDay, setActiveDay] = useState(getTodayName);

  // ── Modals ──
  const [editingMeal, setEditingMeal] = useState(null);
  const [editContent, setEditContent] = useState({ items: [], cals: "", p: "", f: "", c: "" });
  const [swapMeal, setSwapMeal] = useState(null);
  const [expandedIdea, setExpandedIdea] = useState(null);

  const todayKey = getTodayKey();

  // ── Supabase-backed state (key-value) ──
  const [checkedItems, setCheckedItems, groceryReady] = useSupabaseState(GROCERY_KEY, {});
  const [loggedMeals, setLoggedMeals, logReady] = useSupabaseState(LOG_KEY + "-" + todayKey, {});
  const [meals, setMeals, mealsReady] = useSupabaseState(MEALS_KEY, DEFAULT_MEALS);
  const [waterData, setWaterData] = useSupabaseState("water-creatine-" + todayKey, { water: 0, creatine: false });
  const [notificationSettings, setNotificationSettings] = useSupabaseState("notification-settings", {
    enabled: false,
    reminders: [
      { label: "Breakfast", time: "07:30", enabled: true },
      { label: "Lunch", time: "11:30", enabled: true },
      { label: "Pre-Workout", time: "17:00", enabled: true },
      { label: "Post-Workout Shake", time: "21:00", enabled: true },
      { label: "Before Bed", time: "22:30", enabled: true },
    ],
  });
  const [viewMode, setViewMode] = useSupabaseState("view-mode", "jesse");
  const [weighInFrequency, setWeighInFrequency] = useSupabaseState("weigh-in-frequency", "weekly");
  const [goalWeight, setGoalWeight] = useSupabaseState("goal-weight", 182);

  const storageReady = groceryReady && logReady && mealsReady;

  // ── Relational data hooks ──
  const weightLog = useWeightLog();
  const pantry = usePantry();
  const photoLog = usePhotoLog();
  const recipeData = useRecipes();
  const [editingRecipe, setEditingRecipe] = useState(null); // null = closed, {} = new, {id,...} = edit

  // ── Notifications ──
  useNotifications(notificationSettings, loggedMeals, activeDay);

  // ── All log data for progress tracker ──
  const [allLogData, setAllLogData] = useState([]);
  useEffect(() => {
    async function fetchAllLogs() {
      const { data } = await supabase
        .from("meal_app_state")
        .select("key, value")
        .like("key", "jesse-log-v1-%");
      if (data) {
        setAllLogData(data.map(row => ({
          date: row.key.replace("jesse-log-v1-", ""),
          logged: typeof row.value === "string" ? JSON.parse(row.value) : row.value,
        })));
      }
    }
    if (storageReady) fetchAllLogs();
  }, [storageReady, loggedMeals]);

  // ── Quick-log from notification URL param ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quicklog = params.get("quicklog");
    if (quicklog && storageReady) {
      const [day, mealId] = quicklog.split("-");
      if (day && mealId) {
        const key = `${day}-${mealId}`;
        setLoggedMeals(prev => ({ ...prev, [key]: true }));
        setTab("log");
        window.history.replaceState({}, "", "/");
      }
    }
  }, [storageReady]);

  // ── Actions ──
  const toggleLog = (day, mealId) => {
    const key = `${day}-${mealId}`;
    setLoggedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openEdit = (day, meal) => {
    setEditingMeal({ day, id: meal.id });
    setEditContent({
      items: [...meal.items],
      cals: String(meal.cals),
      p: String(meal.p),
      f: String(meal.f),
      c: String(meal.c),
    });
  };

  const saveEdit = () => {
    if (!editingMeal) return;
    setMeals(prev => ({
      ...prev,
      [editingMeal.day]: prev[editingMeal.day].map(m =>
        m.id === editingMeal.id
          ? { ...m, items: editContent.items, cals: parseInt(editContent.cals) || m.cals, p: parseInt(editContent.p) || m.p, f: parseInt(editContent.f) || m.f, c: parseInt(editContent.c) || m.c }
          : m
      ),
    }));
    setEditingMeal(null);
  };

  const openSwap = (day, meal) => {
    setSwapMeal({ day, meal });
  };

  const handleSwap = (day, mealId, newMealData) => {
    setMeals(prev => ({
      ...prev,
      [day]: prev[day].map(m => m.id === mealId ? { ...m, ...newMealData } : m),
    }));
    setSwapMeal(null);
  };

  // ── AUTH GATES (after all hooks) ──
  if (auth.loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: T.textDim, fontFamily: "Georgia, serif", fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (!auth.user) return (
    <LoginPage
      onSignIn={auth.signIn}
      onSignUp={auth.signUp}
      onResetPassword={auth.resetPassword}
    />
  );

  if (!storageReady) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: T.textDim, fontFamily: "Georgia, serif", fontSize: 14 }}>Loading your plan...</div>
    </div>
  );

  // ── Render ──
  const vm = typeof viewMode === "string" ? viewMode : "jesse";

  return (
    <div style={{
      minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      background: T.bg, fontFamily: "Georgia, 'Palatino Linotype', serif",
      color: T.text, display: "flex", flexDirection: "column", position: "relative",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: "16px 20px 14px", paddingTop: "calc(16px + env(safe-area-inset-top, 0px))",
        flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: T.textDim, textTransform: "uppercase" }}>
              {vm === "prep" ? "Meal Prep Mode" : "Lean Bulk · Carnivore"}
            </div>
            <div style={{ fontSize: 22, color: T.text, marginTop: 2 }}>
              {vm === "prep" ? "Prep View" : "Jesse's Plan"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.textDim }}>Synced ✓</div>
          </div>
        </div>
        {/* Macro targets (hide in prep mode) */}
        {vm !== "prep" && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {[["3,400", "cal"], ["195g", "prot"], ["120g", "fat"], ["240g", "carb"]].map(([v, l]) => (
              <div key={l} style={{ flex: 1, background: T.surfaceHigh, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: T.text }}>{v}</div>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        {tab === "plan" && (
          <PlanTab
            activeDay={activeDay} setActiveDay={setActiveDay}
            meals={meals} loggedMeals={loggedMeals}
            toggleLog={toggleLog} openEdit={openEdit} openSwap={openSwap}
            viewMode={vm}
            waterData={waterData} setWaterData={setWaterData}
          />
        )}

        {tab === "ideas" && (
          <RecipesTab
            grouped={recipeData.grouped}
            recipeActions={recipeData}
            onScan={() => setTab("scan-recipe")}
            onEdit={(recipe) => setEditingRecipe(recipe === null ? {} : recipe)}
          />
        )}

        {tab === "scan-recipe" && (
          <ScanRecipePage
            setTab={setTab}
            onSaveRecipe={recipeData.addRecipe}
          />
        )}

        {tab === "grocery" && (
          <GroceryTab
            checkedItems={checkedItems} setCheckedItems={setCheckedItems}
            viewMode={vm} pantryItems={pantry.items}
          />
        )}

        {tab === "log" && (
          <LogTab
            meals={meals} loggedMeals={loggedMeals}
            toggleLog={toggleLog} activeDay={activeDay}
            viewMode={vm}
          />
        )}

        {tab === "more" && <MorePage setTab={setTab} />}

        {tab === "progress" && (
          <ProgressPage
            setTab={setTab} meals={meals}
            loggedMeals={loggedMeals} allLogData={allLogData}
          />
        )}

        {tab === "weight" && (
          <WeightLogPage setTab={setTab} goalWeight={goalWeight} />
        )}

        {tab === "pantry" && (
          <PantryPage
            setTab={setTab}
            pantryItems={pantry.items}
            pantryActions={{ addItem: pantry.addItem, updateItem: pantry.updateItem, deleteItem: pantry.deleteItem }}
          />
        )}

        {tab === "prep" && <MealPrepPage setTab={setTab} />}

        {tab === "photos" && (
          <PhotoLogPage
            setTab={setTab}
            photos={photoLog.photos}
            photoActions={{ uploadPhoto: photoLog.uploadPhoto, deletePhoto: photoLog.deletePhoto }}
          />
        )}

        {tab === "receipt" && (
          <ReceiptScanPage
            setTab={setTab}
            pantryActions={{ addItem: pantry.addItem, updateItem: pantry.updateItem }}
          />
        )}

        {tab === "settings" && (
          <SettingsPage
            setTab={setTab}
            notificationSettings={notificationSettings} setNotificationSettings={setNotificationSettings}
            viewMode={vm} setViewMode={setViewMode}
            weighInFrequency={weighInFrequency} setWeighInFrequency={setWeighInFrequency}
            goalWeight={goalWeight} setGoalWeight={setGoalWeight}
            onSignOut={auth.signOut}
          />
        )}
      </div>

      {/* ── MODALS ── */}
      {editingMeal && (
        <EditMealModal
          editContent={editContent} setEditContent={setEditContent}
          onSave={saveEdit} onClose={() => setEditingMeal(null)}
        />
      )}

      {swapMeal && (
        <SwapModal
          meal={swapMeal.meal} day={swapMeal.day}
          onSwap={handleSwap} onClose={() => setSwapMeal(null)}
        />
      )}

      {editingRecipe !== null && (
        <EditRecipeModal
          recipe={editingRecipe.id ? editingRecipe : null}
          onSave={async (data) => {
            if (editingRecipe.id) {
              await recipeData.updateRecipe(editingRecipe.id, data);
            } else {
              await recipeData.addRecipe(data);
            }
            setEditingRecipe(null);
          }}
          onClose={() => setEditingRecipe(null)}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav tab={tab} setTab={setTab} viewMode={vm} />
    </div>
  );
}
