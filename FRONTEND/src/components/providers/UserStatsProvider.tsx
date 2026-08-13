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
import { meApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { UserStatsResponse } from "@/lib/api/types";

type UserStatsContextValue = {
  stats: UserStatsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStats: (stats: UserStatsResponse) => void;
};

const UserStatsContext = createContext<UserStatsContextValue | null>(null);

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await meApi.getStats();
      setStats(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      stats,
      loading,
      error,
      refresh,
      updateStats: setStats,
    }),
    [stats, loading, error, refresh],
  );

  return (
    <UserStatsContext.Provider value={value}>{children}</UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error("useUserStats must be used within UserStatsProvider");
  }
  return context;
}

export function useOptionalUserStats() {
  return useContext(UserStatsContext);
}
