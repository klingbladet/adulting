import { createAuthClient } from "better-auth/react";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001/api/auth";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const demoSessionData = {
  data: {
    user: {
      id: "demo-user-1",
      name: "Demo Student",
      email: "demo@adulting.se",
      role: "admin",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    },
    session: {
      id: "demo-session-id",
      userId: "demo-user-1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      token: "demo-session-token",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  isPending: false,
  error: null,
};

export const useSession = isDemo
  ? () => demoSessionData
  : authClient.useSession;

export const { signIn, signUp, signOut } = authClient;
