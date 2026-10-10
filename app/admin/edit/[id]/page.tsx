import { getRecipe, getIngredients, getRecipes } from "@/lib/db";
import { AdminRecipeForm } from "@/components/AdminRecipeForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(Number(id));
  if (!recipe) notFound();

  let ingredients: Awaited<ReturnType<typeof getIngredients>> = [];
  let categories: string[] = [];
  try {
    ingredients = await getIngredients();
    const recipes = await getRecipes();
    categories = [...new Set(recipes.map((r) => r.category).filter(Boolean))];
  } catch {}

  return (
    <AdminRecipeForm
      recipe={recipe}
      ingredients={ingredients}
      categories={categories}
    />
  );
}
