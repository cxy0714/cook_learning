import { NextRequest, NextResponse } from "next/server";
import { getRecipes, createRecipe } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { RecipeFormData } from "@/lib/types";

/** GET /api/recipes — 菜谱列表 */
export async function GET() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json(recipes);
  } catch {
    return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
  }
}

/** POST /api/recipes — 新增菜谱（需登录） */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const data = (await req.json()) as RecipeFormData;
  if (!data.title?.trim()) {
    return NextResponse.json({ error: "菜名不能为空" }, { status: 400 });
  }
  try {
    const id = await createRecipe(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
