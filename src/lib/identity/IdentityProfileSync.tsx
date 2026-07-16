"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getStoredIdentityAnswers, storeIdentityAnswers, type IdentityAnswers } from "@/lib/identity/engine";

export function IdentityProfileSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let active = true;
    const client = getSupabaseClient();
    const local = getStoredIdentityAnswers();

    async function sync() {
      if (local) {
        await client.from("identity_profiles").upsert(
          { user_id: user!.id, answers_json: local, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
        return;
      }
      const { data, error } = await client
        .from("identity_profiles")
        .select("answers_json")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!active || error || !data?.answers_json) return;
      storeIdentityAnswers(data.answers_json as IdentityAnswers);
      window.dispatchEvent(new CustomEvent("stylix-identity-synced"));
    }

    void sync();
    return () => { active = false; };
  }, [user]);

  return null;
}
