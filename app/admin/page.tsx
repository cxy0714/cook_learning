import { getRecipes } from "@/lib/db";
import type { Recipe } from "@/lib/types";
import { AdminRecipeList } from "./_components/RecipeList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let recipes: Recipe[] = [];
  try {
    recipes = await getRecipes();
  } catch {}

  return <AdminRecipeList recipes={recipes} />;
}
