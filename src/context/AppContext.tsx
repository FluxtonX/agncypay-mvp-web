"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogout } from "../lib/api/auth";
import { apiGetMe } from "../lib/api/users";

export type WebAccountType = "brand" | "agency";

interface SessionUser {
  uid: string;
  agncyId: string;
  fullName: string;
  email: string;
  accountType: WebAccountType;
  kybStatus?: string;
}

interface AppState {
  user: SessionUser | null;
}

interface AppContextValue {
  state: AppState;
  sessionReady: boolean;
  loginUser: (
    email: string,
    fullName: string,
    accountType: WebAccountType,
    options?: { uid?: string; agencyId?: string; kybStatus?: string },
  ) => void;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function mapProfile(profile: Awaited<ReturnType<typeof apiGetMe>>): SessionUser | null {
  if (profile.accountType !== "brand" && profile.accountType !== "agency") return null;
  return {
    uid: profile.id,
    agncyId: profile.agncyId,
    fullName: profile.fullName,
    email: profile.email,
    accountType: profile.accountType,
    kybStatus: profile.kybStatus,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ user: null });
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;
    const hasSession =
      typeof window !== "undefined" &&
      Boolean(
        localStorage.getItem("agncypay_token") ||
          localStorage.getItem("agncypay_refresh_token"),
      );
    if (!hasSession) {
      queueMicrotask(() => {
        if (active) setSessionReady(true);
      });
      return () => {
        active = false;
      };
    }
    apiGetMe()
      .then((profile) => {
        if (!active) return;
        const user = mapProfile(profile);
        if (!user) {
          localStorage.removeItem("agncypay_token");
          localStorage.removeItem("agncypay_refresh_token");
        }
        setState({ user });
      })
      .catch(() => {
        if (active) setState({ user: null });
      })
      .finally(() => {
        if (active) setSessionReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function loginUser(
    email: string,
    fullName: string,
    accountType: WebAccountType,
    options?: { uid?: string; agencyId?: string; kybStatus?: string },
  ) {
    setState({
      user: {
        uid: options?.uid || "",
        agncyId: options?.agencyId || "",
        fullName,
        email,
        accountType,
        kybStatus: options?.kybStatus,
      },
    });
    setSessionReady(true);
  }

  async function logoutUser() {
    await apiLogout();
    setState({ user: null });
    window.location.assign("/auth/login");
  }

  const value = useMemo(
    () => ({ state, sessionReady, loginUser, logoutUser }),
    [state, sessionReady],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
