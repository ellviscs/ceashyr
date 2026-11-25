"use client";

import { useCallback, useEffect, useState } from "react";
import { dataProvider } from "@/services";
import type { SessionState, UserRole } from "@/types";

export interface UseSessionOptions {
  fallbackRole?: UserRole;
  overrideRole?: UserRole;
}

export interface UseSessionResult {
  session: SessionState | null;
  role: UserRole;
  email: string | undefined;
  isLoading: boolean;
  refreshSession: () => Promise<SessionState | null>;
  switchRole: (nextRole: UserRole) => Promise<SessionState>;
  logout: () => Promise<void>;
}

/**
 * Hook bersama untuk membaca dan mengelola sesi pengguna serta peran aktif.
 */
export function useSession(options: UseSessionOptions = {}): UseSessionResult {
  const { fallbackRole = "pengelola", overrideRole } = options;
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const loaded = await dataProvider.auth.getSession();
    setSession(loaded);
    setIsLoading(false);
    return loaded;
  }, []);

  useEffect(() => {
    let active = true;
    dataProvider.auth.getSession().then((loaded) => {
      if (!active) return;
      setSession(loaded);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const switchRole = useCallback(async (nextRole: UserRole) => {
    const updated = await dataProvider.auth.switchRole(nextRole);
    setSession(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    await dataProvider.auth.logout();
    setSession(null);
  }, []);

  const role: UserRole = overrideRole ?? session?.role ?? fallbackRole;
  const email = role === session?.role ? session?.email : undefined;

  return {
    session,
    role,
    email,
    isLoading,
    refreshSession,
    switchRole,
    logout,
  };
}
