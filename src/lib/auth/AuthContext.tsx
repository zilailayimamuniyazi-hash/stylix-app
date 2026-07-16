"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, "name" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(value: SupabaseUser | null): User | null {
  if (!value?.email) return null;
  const metadata = value.user_metadata ?? {};
  return {
    id: value.id,
    email: value.email,
    name: typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : value.email.split("@")[0],
    avatar: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    createdAt: value.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = getSupabaseClient();
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(mapUser(data.session?.user ?? null));
      setIsLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "invalid_email" };
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    setUser(mapUser(data.user));
    return { ok: true };
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }> => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "invalid_email" };
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: true, requiresConfirmation: true };
    setUser(mapUser(data.session.user));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    void getSupabaseClient().auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<User, "name" | "avatar">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      void getSupabaseClient().auth.updateUser({ data: {
        full_name: updates.name ?? prev.name,
        avatar_url: updates.avatar ?? prev.avatar,
      } });
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile }),
    [user, isLoading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
