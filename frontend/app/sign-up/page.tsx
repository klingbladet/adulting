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

    const { error } = await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setErrorMsg(ctx.error.message || "Could not sign up");
        },
      }
    );

    if (error) {
      setErrorMsg(error.message || "Could not sign up");
    }

    setLoading(false);
  }

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Sign up</h1>

      <form onSubmit={handleSubmit} className="grid max-w-md gap-3">
        <input
          className="rounded border p-2"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="rounded border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="rounded border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="rounded border p-2" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>

        {errorMsg ? <p className="text-red-500">{errorMsg}</p> : null}
      </form>
    </main>
  );
}