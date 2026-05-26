import { createAuthClient } from "better-auth/react";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001/api/auth";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;