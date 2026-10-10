"use client";

import { useState } from "react";
import type { Ingredient, RecipeIngredient } from "@/lib/types";

export function IngredientPicker({
  ingredients,
  selected,
  onChange,
}: {
  ingredients: Ingredient[];
  selected: RecipeIngredient[];
  onChange: (items: RecipeIngredient[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // 按分类分组
  const groups: Record<string, Ingredient[]> = {};
  for (const ing of ingredients) {
    (groups[ing.category] = groups[ing.category] || []).push(ing);
  }

  function addIngredient(ing: Ingredient) {
    onChange([
      ...selected,
      {
        ingredient_id: ing.id,
        name: ing.name,
        quantity: "",
        sort_order: selected.length,
      },
    ]);
    setPickerOpen(false);
  }

  function addCustom(name: string) {
    if (!name.trim()) return;
    onChange([
      ...selected,
      {
        ingredient_id: null,
        name: name.trim(),
        quantity: "",
        sort_order: selected.length,
      },
    ]);
    setPickerOpen(false);
  }

  function updateQuantity(idx: number, quantity: string) {
    const next = [...selected];
    next[idx] = { ...next[idx], quantity };
    onChange(next);
  }

  function remove(idx: number) {
    onChange(selected.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {/* 已选食材列表 */}
      <div className="mb-2 space-y-1.5">
        {selected.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="flex-none rounded-lg px-2.5 py-1 text-sm"
              style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
            >
              {item.name}
            </span>
            <input
              type="text"
              placeholder="用量（如 200g、1 个）"
              value={item.quantity}
              onChange={(e) => updateQuantity(idx, e.target.value)}
              className="min-w-0 flex-1 rounded-lg border px-3 py-1 text-sm outline-none"
              style={{
                borderColor: "var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="flex-none px-1 text-lg"
              style={{ color: "var(--muted)" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="rounded-lg border border-dashed px-3 py-1.5 text-sm"
        style={{
          borderColor: "var(--line)",
          color: "var(--muted)",
        }}
      >
        + 添加食材
      </button>

      {/* 食材选择弹层 */}
      {pickerOpen && (
        <PickerModal
          groups={groups}
          onPick={addIngredient}
          onCustom={addCustom}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function PickerModal({
  groups,
  onPick,
  onCustom,
  onClose,
}: {
  groups: Record<string, Ingredient[]>;
  onPick: (ing: Ingredient) => void;
  onCustom: (name: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const q = search.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl p-4"
        style={{
          maxWidth: "640px",
          background: "var(--card)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">选择食材</h3>
          <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        <input
          type="search"
          placeholder="搜索食材…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-xl border px-3.5 py-2 text-base outline-none"
          style={{
            borderColor: "var(--line)",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />

        {/* 食材列表 */}
        <div className="space-y-3">
          {Object.entries(groups).map(([cat, ings]) => {
            const filtered = q
              ? ings.filter((i) => i.name.toLowerCase().includes(q))
              : ings;
            if (!filtered.length) return null;
            return (
              <div key={cat}>
                <h4
                  className="mb-1.5 text-sm font-bold"
                  style={{ color: "var(--muted)" }}
                >
                  {cat}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {filtered.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => onPick(ing)}
                      className="rounded-lg px-2.5 py-1 text-sm"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--ink)",
                      }}
                    >
                      {ing.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 自定义食材 */}
        <div
          className="mt-4 flex gap-2 border-t pt-3"
          style={{ borderColor: "var(--line)" }}
        >
          <input
            type="text"
            placeholder="或输入新食材名"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCustom(customName);
                setCustomName("");
              }
            }}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
            }}
          />
          <button
            type="button"
            onClick={() => {
              onCustom(customName);
              setCustomName("");
            }}
            className="flex-none rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}
