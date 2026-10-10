"use client";

import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";

export function AdminRecipeList({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push("/admin/new")}
        className="mb-3.5 w-full rounded-xl py-3 text-base font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        + 新增菜品
      </button>

      {recipes.length === 0 ? (
        <div
          className="rounded-2xl p-4 text-center text-sm"
          style={{ background: "var(--card)", color: "var(--muted)" }}
        >
          还没有菜谱，点击上方按钮添加第一道菜吧！
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-2xl px-4 py-3"
              style={{ background: "var(--card)", boxShadow: "var(--shadow)" }}
            >
              {r.images[0]?.url && (
                <img
                  src={r.images[0].url}
                  alt={r.title}
                  className="h-10 w-10 flex-none rounded-lg object-cover"
                />
              )}
              <span className="min-w-0 flex-1 truncate font-bold">
                {r.title}
              </span>
              {r.category && (
                <span
                  className="flex-none text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  {r.category}
                </span>
              )}
              <button
                onClick={() => router.push(`/admin/edit/${r.id}`)}
                className="flex-none rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                编辑
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
