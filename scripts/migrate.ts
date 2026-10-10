/**
 * 数据库建表 + 迁移示例数据
 *
 * 用法：npx tsx scripts/migrate.ts
 *
 * 需要配置好 POSTGRES_URL 环境变量（写 .env.local 或直接 export）
 */
import { sql } from "@vercel/postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "Food");

// ── 建表（逐条执行） ──

const SCHEMA_STMTS = [
  `CREATE TABLE IF NOT EXISTS ingredients (
    id          SERIAL PRIMARY KEY,
    category    VARCHAR(50)  NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    sort_order  INTEGER      DEFAULT 0,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS recipes (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    category      VARCHAR(100) DEFAULT '',
    last_practice VARCHAR(50)  DEFAULT '',
    steps         TEXT DEFAULT '',
    notes         TEXT DEFAULT '',
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id            SERIAL PRIMARY KEY,
    recipe_id     INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
    name          VARCHAR(50) NOT NULL,
    quantity      VARCHAR(100) DEFAULT '',
    sort_order    INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS recipe_images (
    id          SERIAL PRIMARY KEY,
    recipe_id   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    alt         TEXT DEFAULT '',
    sort_order  INTEGER DEFAULT 0
  )`,
];

// ── 解析 ingredients.md ──

function parseIngredients(md: string) {
  const lines = md.split("\n");
  const result: { category: string; name: string }[] = [];
  let category = "";
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      category = m[1];
      continue;
    }
    if (!category || !line.trim() || line.startsWith("#")) continue;
    // 食材行：用顿号或逗号分隔
    if (line.startsWith("-")) continue; // 跳过工具列表
    const items = line.split(/[、，,]/).map((s) => s.trim()).filter(Boolean);
    for (const name of items) {
      result.push({ category, name });
    }
  }
  return result;
}

// ── 解析 recipes.md 前 3 道菜 ──

type ParsedRecipe = {
  title: string;
  category: string;
  lastPractice: string;
  steps: string;
  notes: string;
  images: { src: string; alt: string }[];
};

function parseRecipes(md: string, count: number): ParsedRecipe[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const dishes: ParsedRecipe[] = [];
  let cur: ParsedRecipe | null = null;
  let secTitle = "";
  let secLines: string[] = [];

  const flushSec = () => {
    if (!cur || !secTitle) return;
    const body = secLines.join("\n").replace(/\s+$/, "");
    if (secTitle.includes("标准做法")) cur.steps = body;
    else if (secTitle.includes("我的做法")) cur.notes = body;
    secTitle = "";
    secLines = [];
  };

  for (const line of lines) {
    let m;
    if ((m = line.match(/^#\s+(.+?)\s*$/))) {
      flushSec();
      if (cur) dishes.push(cur);
      if (dishes.length >= count) break;
      cur = { title: m[1], category: "", lastPractice: "", steps: "", notes: "", images: [] };
      continue;
    }
    if (!cur) continue;

    if ((m = line.match(/^##\s+(.+?)\s*$/))) {
      flushSec();
      secTitle = m[1];
      continue;
    }

    if ((m = line.match(/^\*\*分类\*\*[：:]\s*(.+?)\s*$/))) {
      cur.category = m[1];
      continue;
    }
    if ((m = line.match(/^\*\*最近练\*\*[：:]\s*(.+?)\s*$/))) {
      cur.lastPractice = m[1];
      continue;
    }

    // 图片
    const imgRe = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
    let im;
    while ((im = imgRe.exec(line))) {
      const src = im[2].replace(/^\.\.\//, ""); // 去掉 ../
      cur.images.push({ src, alt: (im[1] || "").trim() });
    }

    if (secTitle) secLines.push(line);
  }
  flushSec();
  if (cur && dishes.length < count) dishes.push(cur);
  return dishes.slice(0, count);
}

// ── 主流程 ──

async function main() {
  console.log("📋 建表…");
  for (const stmt of SCHEMA_STMTS) {
    await sql.query(stmt);
  }
  console.log("   ✅ 表结构就绪");

  // 检查是否已有数据
  const { rows: existing } = await sql`SELECT count(*) as n FROM recipes`;
  if (Number(existing[0].n) > 0) {
    console.log(`⚠️  数据库已有 ${existing[0].n} 道菜，跳过数据导入`);
    console.log("   如需重新导入，请先手动清空表。");
    return;
  }

  // 导入食材
  console.log("🧺 导入食材…");
  const ingMd = fs.readFileSync(path.join(SRC_DIR, "ingredients.md"), "utf8");
  const ings = parseIngredients(ingMd);
  for (let i = 0; i < ings.length; i++) {
    await sql`
      INSERT INTO ingredients (category, name, sort_order)
      VALUES (${ings[i].category}, ${ings[i].name}, ${i})
    `;
  }
  console.log(`   ✅ ${ings.length} 个食材`);

  // 导入前 3 道菜
  console.log("🍳 导入菜谱…");
  const recipeMd = fs.readFileSync(path.join(SRC_DIR, "recipes.md"), "utf8");
  const recipes = parseRecipes(recipeMd, 3);

  // 复制图片到 public/images/
  const pubImgDir = path.join(ROOT, "public", "images");
  fs.mkdirSync(pubImgDir, { recursive: true });

  for (const r of recipes) {
    console.log(`   · ${r.title}`);

    // 复制图片
    const imageUrls: { url: string; alt: string }[] = [];
    for (const img of r.images) {
      const srcPath = path.join(ROOT, img.src);
      if (!fs.existsSync(srcPath)) {
        console.log(`     ⚠ 图片不存在: ${img.src}`);
        continue;
      }
      // data/week5day3/01.jpg → week5day3-01.jpg
      const flatName = img.src.replace(/\//g, "-").replace(/^data-/, "");
      const destPath = path.join(pubImgDir, flatName);
      fs.copyFileSync(srcPath, destPath);
      imageUrls.push({ url: `/images/${flatName}`, alt: img.alt });
    }

    // 插入菜谱
    const { rows } = await sql`
      INSERT INTO recipes (title, category, last_practice, steps, notes)
      VALUES (${r.title}, ${r.category}, ${r.lastPractice}, ${r.steps}, ${r.notes})
      RETURNING id
    `;
    const recipeId = rows[0].id;

    // 插入图片
    for (let i = 0; i < imageUrls.length; i++) {
      await sql`
        INSERT INTO recipe_images (recipe_id, url, alt, sort_order)
        VALUES (${recipeId}, ${imageUrls[i].url}, ${imageUrls[i].alt}, ${i})
      `;
    }
  }

  console.log(`   ✅ ${recipes.length} 道菜谱`);
  console.log("\n🎉 迁移完成！");
}

main().catch((e) => {
  console.error("❌ 迁移失败:", e);
  process.exit(1);
});
