import { getIngredients } from "@/lib/db";
import type { Ingredient } from "@/lib/types";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  let ingredients: Ingredient[] = [];
  try {
    ingredients = await getIngredients();
  } catch {
    // 数据库未初始化
  }

  // 按分类分组
  const groups: Record<string, string[]> = {};
  for (const ing of ingredients) {
    (groups[ing.category] = groups[ing.category] || []).push(ing.name);
  }
  const cats = Object.keys(groups);

  return (
    <>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4"
        style={{
          background: "var(--bg)",
          borderColor: "var(--line)",
          paddingTop: "calc(8px + env(safe-area-inset-top))",
          paddingBottom: "8px",
        }}
      >
        <h1 className="text-lg font-bold">🧺 食材</h1>
      </header>

      <main
        className="mx-auto"
        style={{
          maxWidth: "640px",
          padding: "14px 14px calc(86px + env(safe-area-inset-bottom))",
        }}
      >
        {cats.length === 0 ? (
          <div
            className="rounded-2xl p-4 text-center text-sm"
            style={{
              background: "var(--card)",
              color: "var(--muted)",
            }}
          >
            还没有食材。去「管理 → 食材管理」添加吧！
          </div>
        ) : (
          cats.map((cat) => (
            <div
              key={cat}
              className="mb-3.5 rounded-2xl p-3.5"
              style={{ background: "var(--card)", boxShadow: "var(--shadow" }}
            >
              <h2
                className="mb-2 text-base font-bold"
                style={{ color: "var(--accent)" }}
              >
                {cat}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {groups[cat].map((name) => (
                  <span
                    key={name}
                    className="rounded-lg px-2.5 py-1 text-sm"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--ink)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </>
  );
}
