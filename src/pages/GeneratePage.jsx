import { useState } from "react";
import T from "../theme";
import Icon from "../components/Icon";

const GOALS = [
  "Hit my macros (3,400 cal / 195g P)",
  "Maximize protein",
  "Prioritize taste & comfort",
  "Quick & easy (under 15 min)",
  "High volume / filling",
  "Balanced (macros + taste)",
];

const GENRES = [
  "American / Southern",
  "Mexican",
  "Italian",
  "Asian",
  "Mediterranean",
  "BBQ / Grilled",
  "Breakfast style",
  "No preference",
];

const MEAL_TYPES = [
  "Any",
  "Breakfast",
  "Lunch / On-the-go",
  "Dinner",
  "Snack",
  "Post-workout",
  "Pre-workout",
];

const EFFORTS = [
  "Any",
  "No cook / cold",
  "Quick (under 15 min)",
  "Medium (15-30 min)",
  "Full cook (30+ min)",
  "Meal prep friendly",
];

const MOODS = [
  "No preference",
  "I'm starving — make it big",
  "Something light",
  "Comfort food",
  "Something new / adventurous",
  "Keep it simple",
  "Impress someone",
];

export default function GeneratePage({ setTab, pantryItems, onAddRecipe }) {
  // Ingredient selection
  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    const set = {};
    (pantryItems || []).forEach(item => { set[item.name] = true; });
    return set;
  });
  const [extraIngredient, setExtraIngredient] = useState("");
  const [extras, setExtras] = useState([]);

  // Preferences
  const [goal, setGoal] = useState(GOALS[0]);
  const [genre, setGenre] = useState(GENRES[0]);
  const [mealType, setMealType] = useState(MEAL_TYPES[0]);
  const [effort, setEffort] = useState(EFFORTS[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [customRequest, setCustomRequest] = useState("");

  // Results
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [error, setError] = useState("");

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleIngredient = (name) => {
    setSelectedIngredients(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const addExtra = () => {
    if (!extraIngredient.trim()) return;
    setExtras(prev => [...prev, extraIngredient.trim()]);
    setSelectedIngredients(prev => ({ ...prev, [extraIngredient.trim()]: true }));
    setExtraIngredient("");
  };

  const getSelectedList = () => {
    const pantrySelected = (pantryItems || [])
      .filter(item => selectedIngredients[item.name])
      .map(item => item.quantity ? `${item.quantity} ${item.unit} ${item.name}` : item.name);
    const extrasSelected = extras.filter(e => selectedIngredients[e]);
    return [...pantrySelected, ...extrasSelected];
  };

  const generate = async () => {
    const ingredientList = getSelectedList();
    if (ingredientList.length === 0) { setError("Select at least one ingredient"); return; }

    setGenerating(true);
    setError("");
    setResults(null);

    const apiKey = import.meta.env.VITE_XAI_API_KEY;
    if (!apiKey) { setError("XAI API key not configured"); setGenerating(false); return; }

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-3-mini",
          messages: [{
            role: "user",
            content: `You are a meal planning assistant for a 28yo male, 6'0", 172 lbs building lean muscle.

Available ingredients:
${ingredientList.join("\n")}

Generate 5 meal recipes with these preferences:
- Goal: ${goal}
- Cuisine: ${genre}
- Meal type: ${mealType}
- Cooking effort: ${effort}
- Mood: ${mood}
- Daily macro targets: 3,400 cal, 195g protein, 120g fat, 240g carbs
${customRequest ? `- Special request: ${customRequest}` : ""}

IMPORTANT: Primarily use the ingredients listed above. You may include basic pantry staples (salt, pepper, oil, butter) even if not listed.

Return ONLY a valid JSON array, no other text:
[{
  "name": "recipe name",
  "category": "${genre === "No preference" ? "🥗 Other" : genre}",
  "macros": "XXX cal · XXg P",
  "time": "cook time estimate",
  "desc": "2-3 sentence description with brief cooking instructions",
  "ingredients": [{"qty": "amount", "name": "ingredient name"}],
  "tip": "one helpful cooking tip"
}]`
          }],
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setResults(parsed);
      } else {
        setError("Unexpected response format. Try again.");
      }
    } catch (err) {
      setError("Failed to generate recipes. Try again.");
    }
    setGenerating(false);
  };

  const saveRecipe = async (recipe, idx) => {
    const ok = await onAddRecipe({
      name: recipe.name,
      category: recipe.category || "🥗 Other",
      macros: recipe.macros || "",
      time: recipe.time || "",
      desc: recipe.desc || "",
      ingredients: recipe.ingredients || [],
      tip: recipe.tip || "",
      notes: "Generated by AI meal planner",
    });
    if (ok) setSavedIds(prev => new Set([...prev, idx]));
  };

  const ingredientNames = new Set(getSelectedList().map(i => i.toLowerCase()));

  const labelStyle = { fontSize: 10, color: T.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 };

  const DropdownSelect = ({ label, options, value, onChange, id }) => {
    const isOpen = openDropdown === id;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>{label}</div>
        <button onClick={() => setOpenDropdown(isOpen ? null : id)} style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          background: T.surface, border: `1px solid ${isOpen ? T.accent : T.border}`,
          color: T.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{value}</span>
          <span style={{ color: T.textDim, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>⌄</span>
        </button>
        {isOpen && (
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
            marginTop: 4, overflow: "hidden",
          }}>
            {options.map(opt => (
              <div key={opt} onClick={() => { onChange(opt); setOpenDropdown(null); }} style={{
                padding: "12px 14px", cursor: "pointer",
                background: value === opt ? T.accent + "22" : "transparent",
                color: value === opt ? T.accent : T.text,
                fontSize: 14, borderBottom: `1px solid ${T.border}`,
              }}>{opt}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setTab("ideas")} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", padding: 4 }}>
          <Icon name="back" size={20} color={T.textDim} />
        </button>
        <div style={{ fontSize: 18, color: T.text }}>Generate Meals</div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Show results if we have them */}
        {results ? (
          <>
            <div style={{ fontSize: 12, color: T.green, marginBottom: 16 }}>
              ✓ {results.length} recipes generated! Add the ones you like.
            </div>

            {results.map((recipe, idx) => (
              <div key={idx} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: 16, marginBottom: 12,
              }}>
                <div style={{ fontSize: 16, color: T.text, marginBottom: 4 }}>{recipe.name}</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  {recipe.macros && <span style={{ fontSize: 12, color: T.accent }}>{recipe.macros}</span>}
                  {recipe.time && <span style={{ fontSize: 12, color: T.textDim }}>⏱ {recipe.time}</span>}
                </div>

                {recipe.desc && (
                  <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6, marginBottom: 10 }}>{recipe.desc}</p>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 4 }}>INGREDIENTS</div>
                    {recipe.ingredients.map((ing, j) => {
                      const name = typeof ing === "object" ? ing.name : ing;
                      const qty = typeof ing === "object" ? ing.qty : "";
                      const hasIt = ingredientNames.has(name?.toLowerCase());
                      return (
                        <div key={j} style={{ fontSize: 13, color: T.textMid, lineHeight: 1.8, display: "flex", gap: 6 }}>
                          <span style={{ color: hasIt ? T.green : T.textDim }}>{hasIt ? "✓" : "○"}</span>
                          {qty && <span style={{ color: T.text }}>{qty}</span>}
                          <span>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {recipe.tip && (
                  <div style={{
                    padding: "6px 10px", background: T.accent + "0d",
                    borderLeft: `2px solid ${T.accent}55`, borderRadius: "0 6px 6px 0",
                    fontSize: 12, color: T.textMid, fontStyle: "italic", marginBottom: 10,
                  }}>💡 {recipe.tip}</div>
                )}

                {savedIds.has(idx) ? (
                  <div style={{
                    padding: "10px 0", borderRadius: 8, textAlign: "center",
                    background: T.green + "22", border: `1px solid ${T.green}`,
                    color: T.green, fontSize: 13,
                  }}>✓ Saved to Recipes</div>
                ) : (
                  <button onClick={() => saveRecipe(recipe, idx)} style={{
                    width: "100%", padding: "10px 0", borderRadius: 8,
                    background: T.accent, border: "none",
                    color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}>➕ Add to Recipes</button>
                )}
              </div>
            ))}

            <button onClick={() => { setResults(null); setSavedIds(new Set()); }} style={{
              width: "100%", padding: "14px 0", borderRadius: 10, marginBottom: 20,
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>← Generate More</button>
          </>
        ) : (
          <>
            {/* INGREDIENTS */}
            <div style={labelStyle}>What do you have to work with?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {(pantryItems || []).map(item => (
                <button key={item.id} onClick={() => toggleIngredient(item.name)} style={{
                  padding: "8px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  background: selectedIngredients[item.name] ? T.green + "22" : T.surface,
                  border: `1px solid ${selectedIngredients[item.name] ? T.green : T.border}`,
                  color: selectedIngredients[item.name] ? T.green : T.textDim,
                }}>
                  {selectedIngredients[item.name] ? "✓ " : ""}{item.name}
                </button>
              ))}
              {extras.map(name => (
                <button key={name} onClick={() => toggleIngredient(name)} style={{
                  padding: "8px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  background: selectedIngredients[name] ? T.blue + "22" : T.surface,
                  border: `1px solid ${selectedIngredients[name] ? T.blue : T.border}`,
                  color: selectedIngredients[name] ? T.blue : T.textDim,
                }}>
                  {selectedIngredients[name] ? "✓ " : ""}{name}
                </button>
              ))}
            </div>

            {/* Add extra */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input value={extraIngredient} onChange={e => setExtraIngredient(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addExtra()}
                placeholder="Add extra ingredient..."
                style={{
                  flex: 1, background: T.surfaceHigh, border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 13,
                  fontFamily: "inherit", outline: "none",
                }} />
              <button onClick={addExtra} style={{
                padding: "10px 16px", borderRadius: 8,
                background: T.surface, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>+</button>
            </div>

            {/* PREFERENCES */}
            <DropdownSelect id="goal" label="Meal Goal" options={GOALS} value={goal} onChange={setGoal} />
            <DropdownSelect id="genre" label="Food Genre" options={GENRES} value={genre} onChange={setGenre} />
            <DropdownSelect id="type" label="Meal Type (optional)" options={MEAL_TYPES} value={mealType} onChange={setMealType} />
            <DropdownSelect id="effort" label="Cooking Effort (optional)" options={EFFORTS} value={effort} onChange={setEffort} />
            <DropdownSelect id="mood" label="Mood / Vibe (optional)" options={MOODS} value={mood} onChange={setMood} />

            {/* Custom request */}
            <div style={labelStyle}>Custom Request (optional)</div>
            <textarea value={customRequest} onChange={e => setCustomRequest(e.target.value)}
              placeholder="e.g. 'No dairy', 'Make it spicy', 'Something I can eat with one hand', 'Wife doesn't like onions'..."
              rows={3}
              style={{
                width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 13,
                fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                resize: "vertical", marginBottom: 16,
              }} />

            {error && (
              <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>
            )}

            <button onClick={generate} disabled={generating} style={{
              width: "100%", padding: "16px 0", borderRadius: 10, marginBottom: 20,
              background: T.accent, border: "none",
              color: "#fff", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              opacity: generating ? 0.6 : 1,
            }}>
              {generating ? "Generating..." : "🤖 Generate Meals"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
