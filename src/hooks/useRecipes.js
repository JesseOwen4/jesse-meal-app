import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { MEAL_IDEAS } from "../constants";

// Convert old string ingredients to {name, qty} format
function normalizeIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  return ingredients.map(ing => {
    if (typeof ing === "object" && ing.name) return ing;
    // Parse string like "4 strips thick-cut bacon" → { qty: "4 strips", name: "thick-cut bacon" }
    const str = String(ing);
    const match = str.match(/^([\d½⅓¼¾⅔⅛]+\s*(?:oz|lbs?|cups?|tbsp|tsp|scoops?|strips?|slices?|large|small|dozen|bags?|cans?|bunche?s?|pints?|gallons?|bottles?|tubs?|boxes?|packets?|handfuls?)?)\s+(.+)$/i);
    if (match) return { qty: match[1].trim(), name: match[2].trim() };
    return { qty: "", name: str };
  });
}

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (data && data.length > 0) {
      // Normalize ingredients format
      setRecipes(data.map(r => ({
        ...r,
        ingredients: normalizeIngredients(r.ingredients),
      })));
    } else if (data && data.length === 0) {
      await seedDefaults();
    }
    setLoading(false);
  }, []);

  const seedDefaults = async () => {
    const rows = [];
    for (const cat of MEAL_IDEAS) {
      for (const item of cat.items) {
        rows.push({
          name: item.name,
          category: cat.cat,
          macros: item.macros,
          time: item.time,
          desc: item.desc,
          ingredients: normalizeIngredients(item.ingredients),
          tip: item.tip || null,
          notes: null,
        });
      }
    }
    const { data } = await supabase.from("recipes").insert(rows).select();
    if (data) setRecipes(data.map(r => ({ ...r, ingredients: normalizeIngredients(r.ingredients) })));
  };

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const addRecipe = async (recipe) => {
    const { error } = await supabase.from("recipes").insert({
      ...recipe,
      ingredients: recipe.ingredients || [],
    });
    if (!error) fetchRecipes();
    return !error;
  };

  const updateRecipe = async (id, updates) => {
    const { error } = await supabase
      .from("recipes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) fetchRecipes();
    return !error;
  };

  const deleteRecipe = async (id) => {
    await supabase.from("recipes").delete().eq("id", id);
    fetchRecipes();
  };

  // Group by category
  const grouped = {};
  for (const r of recipes) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  return { recipes, grouped, loading, addRecipe, updateRecipe, deleteRecipe, refetch: fetchRecipes };
}

// Estimate macros using Grok AI
export async function estimateMacros(ingredients) {
  const apiKey = import.meta.env.VITE_XAI_API_KEY;
  if (!apiKey || !ingredients.length) return null;

  const ingredientList = ingredients
    .filter(i => i.name)
    .map(i => i.qty ? `${i.qty} ${i.name}` : i.name)
    .join("\n");

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{
          role: "user",
          content: `Estimate the total nutritional macros for this recipe with these ingredients:\n${ingredientList}\n\nReturn ONLY a short string in this exact format: "XXX cal · XXg P" (calories and protein). Example: "680 cal · 52g P". No other text.`
        }],
      }),
    });
    const data = await res.json();
    const macros = data.choices?.[0]?.message?.content?.trim() || "";
    // Validate it looks like macros
    if (macros.match(/\d+\s*cal/i)) return macros;
    return null;
  } catch {
    return null;
  }
}
