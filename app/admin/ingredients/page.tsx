import { getIngredients } from "@/lib/db";
import { IngredientManager } from "./_components/IngredientManager";

export const dynamic = "force-dynamic";

export default async function AdminIngredientsPage() {
  let ingredients: Awaited<ReturnType<typeof getIngredients>> = [];
  try {
    ingredients = await getIngredients();
  } catch {}

  return <IngredientManager initialIngredients={ingredients} />;
}
