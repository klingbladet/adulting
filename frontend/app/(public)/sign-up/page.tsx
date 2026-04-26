"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setErrorMsg("");
  setLoading(true);

  const result = await authClient.signUp.email({
  email,
  password,
  name,
} as any);

  if (result.error) {
    setErrorMsg(result.error.message || "Could not sign up");
    setLoading(false);
    return;
  }

  setLoading(false);
  router.push("/sign-in");
}

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold">Sign up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border px-4 py-3"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        {errorMsg ? (
          <p className="text-sm text-red-600">{errorMsg}</p>
        ) : null}
      </form>
    </main>
  );
}