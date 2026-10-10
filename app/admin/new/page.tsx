import { getIngredients, getRecipes } from "@/lib/db";
import { AdminRecipeForm } from "@/components/AdminRecipeForm";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  let ingredients: Awaited<ReturnType<typeof getIngredients>> = [];
  let categories: string[] = [];
  try {
    ingredients = await getIngredients();
    const recipes = await getRecipes();
    categories = [...new Set(recipes.map((r) => r.category).filter(Boolean))];
  } catch {}

  return <AdminRecipeForm ingredients={ingredients} categories={categories} />;
}
