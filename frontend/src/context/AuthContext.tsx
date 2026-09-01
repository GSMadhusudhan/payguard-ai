import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
} from "../lib/api";

interface RegisterAccount {
  fullName: string;
  merchantName: string;
  merchantSlug: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  authenticated: boolean;

  login: (
    merchantSlug: string,
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    account: RegisterAccount,
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        "payguard_access_token",
      ),
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        authenticated:
          Boolean(token),

        async login(
          merchantSlug,
          email,
          password,
        ) {
          const accessToken =
            await loginRequest(
              merchantSlug,
              email,
              password,
            );

          localStorage.setItem(
            "payguard_access_token",
            accessToken,
          );

          setToken(accessToken);
        },

        async register(account) {
          const accessToken =
            await registerRequest(
              account,
            );

          localStorage.setItem(
            "payguard_access_token",
            accessToken,
          );

          setToken(accessToken);
        },

        logout() {
          localStorage.removeItem(
            "payguard_access_token",
          );

          setToken(null);
        },
      }),
      [token],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
