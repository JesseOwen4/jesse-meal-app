import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { MEAL_IDEAS } from "../constants";

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
      setRecipes(data);
    } else if (data && data.length === 0) {
      // Seed from defaults on first load
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
          ingredients: item.ingredients,
          tip: item.tip || null,
          notes: null,
        });
      }
    }
    const { data } = await supabase.from("recipes").insert(rows).select();
    if (data) setRecipes(data);
  };

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const addRecipe = async (recipe) => {
    const { error } = await supabase.from("recipes").insert(recipe);
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
