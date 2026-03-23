import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function usePantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("pantry_items")
      .select("*")
      .order("category", { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (item) => {
    const { error } = await supabase.from("pantry_items").insert(item);
    if (!error) fetchItems();
    return !error;
  };

  const updateItem = async (id, updates) => {
    const { error } = await supabase.from("pantry_items").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) fetchItems();
    return !error;
  };

  const deleteItem = async (id) => {
    await supabase.from("pantry_items").delete().eq("id", id);
    fetchItems();
  };

  const deductForMeal = async (deductions) => {
    // deductions: [{ id, amount }]
    for (const d of deductions) {
      const item = items.find(i => i.id === d.id);
      if (item) {
        const newQty = Math.max(0, item.quantity - d.amount);
        await supabase.from("pantry_items").update({ quantity: newQty, updated_at: new Date().toISOString() }).eq("id", d.id);
      }
    }
    fetchItems();
  };

  return { items, loading, addItem, updateItem, deleteItem, deductForMeal, refetch: fetchItems };
}
