import { NextRequest, NextResponse } from "next/server";
import { getIngredients, addIngredient, deleteIngredient } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

/** GET /api/ingredients — 食材列表 */
export async function GET() {
  try {
    const ingredients = await getIngredients();
    return NextResponse.json(ingredients);
  } catch {
    return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
  }
}

/** POST /api/ingredients — 新增食材（需登录） */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { category, name } = await req.json();
  if (!category?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "分类和名称不能为空" }, { status: 400 });
  }
  try {
    const ing = await addIngredient(category.trim(), name.trim());
    return NextResponse.json(ing, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

/** DELETE /api/ingredients — 删除食材（需登录） */
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  try {
    await deleteIngredient(Number(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
