import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, clearAuthCookie, isAuthenticated } from "@/lib/auth";

/** POST /api/auth — 登录或登出 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // 登出
  if (body.action === "logout") {
    await clearAuthCookie();
    return NextResponse.json({ ok: true });
  }

  // 登录
  const { password } = body;
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }
  await setAuthCookie();
  return NextResponse.json({ ok: true });
}

/** GET /api/auth — 检查登录状态 */
export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
