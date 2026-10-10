import { sql } from "@vercel/postgres";
import type { Recipe, RecipeFormData, Ingredient } from "./types";

// ── 食材 ──

export async function getIngredients(): Promise<Ingredient[]> {
  const { rows } = await sql`
    SELECT id, category, name, sort_order
    FROM ingredients
    ORDER BY sort_order, id
  `;
  return rows as Ingredient[];
}

export async function addIngredient(
  category: string,
  name: string,
): Promise<Ingredient> {
  const { rows } = await sql`
    INSERT INTO ingredients (category, name, sort_order)
    VALUES (${category}, ${name}, 0)
    RETURNING id, category, name, sort_order
  `;
  return rows[0] as Ingredient;
}

export async function deleteIngredient(id: number): Promise<void> {
  await sql`DELETE FROM ingredients WHERE id = ${id}`;
}

// ── 菜谱 ──

export async function getRecipes(): Promise<Recipe[]> {
  const { rows: recipes } = await sql`
    SELECT id, title, category, last_practice, steps, notes, created_at, updated_at
    FROM recipes
    ORDER BY created_at DESC, id DESC
  `;

  const result: Recipe[] = [];
  for (const r of recipes) {
    const { rows: ings } = await sql`
      SELECT id, recipe_id, ingredient_id, name, quantity, sort_order
      FROM recipe_ingredients WHERE recipe_id = ${r.id}
      ORDER BY sort_order, id
    `;
    const { rows: imgs } = await sql`
      SELECT id, recipe_id, url, alt, sort_order
      FROM recipe_images WHERE recipe_id = ${r.id}
      ORDER BY sort_order, id
    `;
    result.push({ ...r, ingredients: ings, images: imgs } as Recipe);
  }
  return result;
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const { rows } = await sql`
    SELECT id, title, category, last_practice, steps, notes, created_at, updated_at
    FROM recipes WHERE id = ${id}
  `;
  if (!rows.length) return null;
  const r = rows[0];

  const { rows: ings } = await sql`
    SELECT id, recipe_id, ingredient_id, name, quantity, sort_order
    FROM recipe_ingredients WHERE recipe_id = ${id}
    ORDER BY sort_order, id
  `;

  const { rows: imgs } = await sql`
    SELECT id, recipe_id, url, alt, sort_order
    FROM recipe_images WHERE recipe_id = ${id}
    ORDER BY sort_order, id
  `;

  return { ...r, ingredients: ings, images: imgs } as Recipe;
}

export async function createRecipe(data: RecipeFormData): Promise<number> {
  const { rows } = await sql`
    INSERT INTO recipes (title, category, last_practice, steps, notes)
    VALUES (${data.title}, ${data.category}, ${data.last_practice}, ${data.steps}, ${data.notes})
    RETURNING id
  `;
  const id = rows[0].id;

  await saveRecipeRelations(id, data);
  return id;
}

export async function updateRecipe(
  id: number,
  data: RecipeFormData,
): Promise<void> {
  await sql`
    UPDATE recipes
    SET title = ${data.title},
        category = ${data.category},
        last_practice = ${data.last_practice},
        steps = ${data.steps},
        notes = ${data.notes},
        updated_at = NOW()
    WHERE id = ${id}
  `;

  // 清掉旧关联再重写
  await sql`DELETE FROM recipe_ingredients WHERE recipe_id = ${id}`;
  await sql`DELETE FROM recipe_images WHERE recipe_id = ${id}`;
  await saveRecipeRelations(id, data);
}

export async function deleteRecipe(id: number): Promise<void> {
  await sql`DELETE FROM recipes WHERE id = ${id}`;
}

async function saveRecipeRelations(id: number, data: RecipeFormData): Promise<void> {
  for (let i = 0; i < data.ingredients.length; i++) {
    const ing = data.ingredients[i];
    if (!ing.name.trim()) continue;
    await sql`
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, name, quantity, sort_order)
      VALUES (${id}, ${ing.ingredient_id}, ${ing.name}, ${ing.quantity}, ${i})
    `;
  }

  for (let i = 0; i < data.images.length; i++) {
    const img = data.images[i];
    if (!img.url) continue;
    await sql`
      INSERT INTO recipe_images (recipe_id, url, alt, sort_order)
      VALUES (${id}, ${img.url}, ${img.alt}, ${i})
    `;
  }
}
