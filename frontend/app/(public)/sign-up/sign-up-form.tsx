"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
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

    try {
      const { error } = await authClient.signUp.email(
        {
          name,
          email,
          password,
        },
        {
          onSuccess: () => {
            router.push("/sign-in");
            router.refresh();
          },
          onError: (ctx) => {
            setErrorMsg(ctx.error.message || "Could not sign up");
          },
        }
      );

      if (error) {
        setErrorMsg(error.message || "Could not sign up");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-3">
      <input
        className="rounded-md border border-border bg-background p-2 text-foreground"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="rounded-md border border-border bg-background p-2 text-foreground"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="rounded-md border border-border bg-background p-2 text-foreground"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      {errorMsg ? <p className="text-sm text-red-500">{errorMsg}</p> : null}
    </form>
  );
}