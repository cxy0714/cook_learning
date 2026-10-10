import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "cb_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

function getPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error("ADMIN_PASSWORD 环境变量未设置");
  return pwd;
}

/** 生成 cookie 值：HMAC 签名，不含密码明文 */
function signToken(): string {
  return createHmac("sha256", getPassword()).update("authenticated").digest("hex");
}

/** 验证密码是否正确 */
export function verifyPassword(input: string): boolean {
  return input === getPassword();
}

/** 登录成功后设置 cookie */
export async function setAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

/** 清除 cookie（登出） */
export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** 检查当前请求是否已登录 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === signToken();
}
