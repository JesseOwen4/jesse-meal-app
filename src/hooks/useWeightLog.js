import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useWeightLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from("weight_log")
      .select("*")
      .order("date", { ascending: true });
    if (data) setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = async (weight, date) => {
    const { error } = await supabase
      .from("weight_log")
      .upsert({ weight, date }, { onConflict: "date" });
    if (!error) fetchEntries();
    return !error;
  };

  const deleteEntry = async (id) => {
    await supabase.from("weight_log").delete().eq("id", id);
    fetchEntries();
  };

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries };
}
