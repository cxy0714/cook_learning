import { getRecipes } from "@/lib/db";
import type { Recipe } from "@/lib/types";
import { RecipeList } from "@/components/RecipeList";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recipes: Recipe[] = [];
  try {
    recipes = await getRecipes();
  } catch {
    // 数据库未初始化时显示空状态
  }

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
        <h1 className="text-lg font-bold">🍳 我的菜谱</h1>
      </header>

      <main
        className="mx-auto"
        style={{
          maxWidth: "640px",
          padding: "14px 14px calc(86px + env(safe-area-inset-bottom))",
        }}
      >
        <RecipeList recipes={recipes} />
      </main>

      <BottomNav />
    </>
  );
}
