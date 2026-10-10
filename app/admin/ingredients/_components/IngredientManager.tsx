"use client";

import { useState } from "react";
import type { Ingredient } from "@/lib/types";

export function IngredientManager({
  initialIngredients,
}: {
  initialIngredients: Ingredient[];
}) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [newCat, setNewCat] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  // 按分类分组
  const groups: Record<string, Ingredient[]> = {};
  for (const ing of ingredients) {
    (groups[ing.category] = groups[ing.category] || []).push(ing);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim() || !newName.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCat.trim(), name: newName.trim() }),
      });
      if (res.ok) {
        const ing = await res.json();
        setIngredients([...ingredients, ing]);
        setNewName("");
      } else {
        const data = await res.json();
        setError(data.error || "添加失败");
      }
    } catch {
      setError("网络错误");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确定删除食材「${name}」？`)) return;
    try {
      const res = await fetch("/api/ingredients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setIngredients(ingredients.filter((i) => i.id !== id));
      }
    } catch {}
  }

  return (
    <>
      {/* 添加表单 */}
      <form
        onSubmit={handleAdd}
        className="mb-4 rounded-2xl p-4"
        style={{ background: "var(--card)", boxShadow: "var(--shadow)" }}
      >
        <h2 className="mb-3 text-base font-bold">添加食材</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="分类（如：蔬菜）"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            list="ing-cats"
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
          <datalist id="ing-cats">
            {Object.keys(groups).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input
            type="text"
            placeholder="名称（如：西兰花）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
          <button
            type="submit"
            className="flex-none rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            添加
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--accent)" }}>
            {error}
          </p>
        )}
      </form>

      {/* 食材列表 */}
      {Object.entries(groups).map(([cat, ings]) => (
        <div
          key={cat}
          className="mb-3.5 rounded-2xl p-3.5"
          style={{ background: "var(--card)", boxShadow: "var(--shadow)" }}
        >
          <h3
            className="mb-2 text-base font-bold"
            style={{ color: "var(--accent)" }}
          >
            {cat}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {ings.map((ing) => (
              <span
                key={ing.id}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm"
                style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
              >
                {ing.name}
                <button
                  onClick={() => handleDelete(ing.id, ing.name)}
                  className="text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
