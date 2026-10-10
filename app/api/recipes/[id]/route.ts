import { NextRequest, NextResponse } from "next/server";
import { getRecipe, updateRecipe, deleteRecipe } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { RecipeFormData } from "@/lib/types";

/** GET /api/recipes/[id] — 单个菜谱 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const recipe = await getRecipe(Number(id));
  if (!recipe) return NextResponse.json({ error: "不存在" }, { status: 404 });
  return NextResponse.json(recipe);
}

/** PUT /api/recipes/[id] — 编辑菜谱（需登录） */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const data = (await req.json()) as RecipeFormData;
  if (!data.title?.trim()) {
    return NextResponse.json({ error: "菜名不能为空" }, { status: 400 });
  }
  try {
    await updateRecipe(Number(id), data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/** DELETE /api/recipes/[id] — 删除菜谱（需登录） */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteRecipe(Number(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
