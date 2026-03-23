import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const TABLE = "meal_app_state";

export function useSupabaseState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextRealtime = useRef(false);
  const saveTimer = useRef(null);

  // Load initial value
  useEffect(() => {
    supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .single()
      .then(({ data }) => {
        if (data?.value != null) {
          setValue(
            typeof defaultValue === "object" && !Array.isArray(defaultValue)
              ? { ...defaultValue, ...data.value }
              : data.value
          );
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, [key]);

  // Subscribe to Realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`state-${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE,
          filter: `key=eq.${key}`,
        },
        (payload) => {
          if (skipNextRealtime.current) {
            skipNextRealtime.current = false;
            return;
          }
          if (payload.new?.value != null) {
            setValue(payload.new.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [key]);

  // Debounced save to Supabase
  const persist = useCallback(
    (next) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        skipNextRealtime.current = true;
        supabase
          .from(TABLE)
          .upsert(
            { key, value: next, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          )
          .then();
      }, 500);
    },
    [key]
  );

  // Wrapped setter that also persists
  const setAndSave = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return [value, setAndSave, isLoaded];
}
