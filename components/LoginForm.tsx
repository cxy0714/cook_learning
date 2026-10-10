"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError("密码错误");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto mt-20 rounded-2xl p-6"
      style={{
        maxWidth: "360px",
        background: "var(--card)",
        boxShadow: "var(--shadow)",
      }}
    >
      <h1 className="mb-4 text-center text-xl font-bold">🔒 管理登录</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="输入管理密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mb-3 w-full rounded-xl border px-4 py-3 text-base outline-none"
          style={{
            borderColor: "var(--line)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
        {error && (
          <p className="mb-3 text-center text-sm" style={{ color: "var(--accent)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl py-3 text-base font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>
    </div>
  );
}
