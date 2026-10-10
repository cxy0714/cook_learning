"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, RecipeFormData, Ingredient } from "@/lib/types";
import { IngredientPicker } from "./IngredientPicker";
import { ImageUploader } from "./ImageUploader";

const EMPTY_FORM: RecipeFormData = {
  title: "",
  category: "",
  last_practice: "",
  steps: "",
  notes: "",
  ingredients: [],
  images: [],
};

export function AdminRecipeForm({
  recipe,
  ingredients,
  categories,
}: {
  recipe?: Recipe;
  ingredients: Ingredient[];
  categories: string[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<RecipeFormData>(
    recipe
      ? {
          title: recipe.title,
          category: recipe.category,
          last_practice: recipe.last_practice,
          steps: recipe.steps,
          notes: recipe.notes,
          ingredients: recipe.ingredients.map((i) => ({
            ingredient_id: i.ingredient_id,
            name: i.name,
            quantity: i.quantity,
            sort_order: i.sort_order,
          })),
          images: recipe.images.map((im) => ({
            url: im.url,
            alt: im.alt,
            sort_order: im.sort_order,
          })),
        }
      : EMPTY_FORM,
  );

  function set<K extends keyof RecipeFormData>(
    key: K,
    value: RecipeFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("菜名不能为空");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = recipe ? `/api/recipes/${recipe.id}` : "/api/recipes";
      const method = recipe ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!recipe) return;
    if (!confirm(`确定删除「${recipe.title}」？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 菜名 */}
      <Field label="菜名">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="如：白灼虾"
          className={inputCls}
        />
      </Field>

      {/* 分类 */}
      <Field label="分类">
        <input
          type="text"
          list="cat-list"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="如：🦐 虾 · 海鲜"
          className={inputCls}
        />
        <datalist id="cat-list">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      {/* 最近练 */}
      <Field label="最近练（可选）">
        <input
          type="text"
          value={form.last_practice}
          onChange={(e) => set("last_practice", e.target.value)}
          placeholder="如：week5day3"
          className={inputCls}
        />
      </Field>

      {/* 食材 */}
      <Field label="食材">
        <IngredientPicker
          ingredients={ingredients}
          selected={form.ingredients}
          onChange={(items) => set("ingredients", items)}
        />
      </Field>

      {/* 标准做法 */}
      <Field label="标准做法（支持 Markdown）">
        <textarea
          value={form.steps}
          onChange={(e) => set("steps", e.target.value)}
          rows={8}
          placeholder={"**食材**：...\n1. 第一步\n2. 第二步"}
          className={`${inputCls} resize-y font-mono text-sm`}
        />
      </Field>

      {/* 我的做法 */}
      <Field label="我的做法（支持 Markdown）">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={5}
          placeholder={"- 这次做得...\n- 下次注意..."}
          className={`${inputCls} resize-y font-mono text-sm`}
        />
      </Field>

      {/* 图片 */}
      <Field label="图片">
        <ImageUploader
          images={form.images}
          onChange={(imgs) => set("images", imgs)}
        />
      </Field>

      {error && (
        <p className="text-center text-sm" style={{ color: "var(--accent)" }}>
          {error}
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl py-3 text-base font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "保存中…" : recipe ? "保存修改" : "添加菜谱"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="flex-none rounded-xl border px-5 py-3 text-base"
          style={{
            borderColor: "var(--line)",
            color: "var(--muted)",
          }}
        >
          取消
        </button>
        {recipe && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-none rounded-xl border px-5 py-3 text-base disabled:opacity-50"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            {deleting ? "删除中…" : "删除"}
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border px-3.5 py-2.5 text-base outline-none focus:border-[var(--accent)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-bold"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
