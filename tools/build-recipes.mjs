#!/usr/bin/env node
/**
 * 解析 Food/recipes.md → data/recipes.json
 *
 * 约定：每道菜用一个一级标题 `# 菜名` 分隔；
 * 菜名下面可以写任意个 `## 小节名` 小节（标准做法 / 我的做法 / 图片 …）。
 *
 * 图片写在任意小节里：![说明文字](路径)
 *   - 说明文字会变成图片的配文（点开大图时显示）
 *   - 同一张图可以被多道菜引用（原文件只存一份），脚本会自动算出「这张图还被谁用了」
 *
 * 用法：node tools/build-recipes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'Food', 'recipes.md');
const OUT = path.join(ROOT, 'data', 'recipes.json');
const SRC_DIR = path.dirname(SRC);
const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

/** 把 markdown 里的相对路径解析成站点根目录下的路径 */
function toSitePath(p) {
  if (/^https?:/i.test(p)) return p;               // 外链原样保留
  return path.relative(ROOT, path.resolve(SRC_DIR, p)).split(path.sep).join('/');
}

/** 简写：week1 05 / week5day1 02 / week5day 01 —— 直接写图在哪个帖子的第几张 */
const SHORTHAND_RE = /^\s*(?:[-*]\s*)?week\s*(\d+)(?:\s*day\s*(\d*))?\s+(\d{1,2})\s*$/i;

/** 简写路径要能对上真实的文件夹名，所以按目录兜底找一遍 */
function resolveShorthand(g1, g2, num) {
  const nn = String(num).padStart(2, '0');
  const dirs = fs.readdirSync(path.join(ROOT, 'data'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  const wanted = [];
  if (g2) wanted.push(`week${g1}day${g2}`);
  wanted.push(`week${g1}`);
  for (const w of wanted) {
    if (dirs.includes(w) && fs.existsSync(path.join(ROOT, 'data', w, nn + '.jpg'))) return `data/${w}/${nn}.jpg`;
  }
  for (const d of dirs) {                                   // 兜底：week 开头的目录里有这张就用
    if (d.startsWith(`week${g1}`) && fs.existsSync(path.join(ROOT, 'data', d, nn + '.jpg'))) return `data/${d}/${nn}.jpg`;
  }
  return null;
}

function parse(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const dishes = [];
  let cur = null, sec = null;

  const pushSec = () => {
    if (!cur || !sec) return;
    const body = sec.lines.join('\n').replace(/\s+$/, '');
    if (sec.images.length) cur.images.push(...sec.images);   // 图片抬到菜的层级
    if (body.trim() || sec.images.length) cur.sections.push({ title: sec.title, md: body });
    sec = null;
  };

  for (const line of lines) {
    let m;
    if ((m = line.match(/^#\s+(?!#)(.+?)\s*$/))) {
      pushSec();
      cur = { title: m[1], images: [], sections: [] };
      dishes.push(cur);
      continue;
    }
    if ((m = line.match(/^##\s+(?!#)(.+?)\s*$/))) {
      pushSec();
      if (cur) sec = { title: m[1], lines: [], images: [] };
      continue;
    }
    if (!cur) continue;                                    // 文件开头的说明，跳过

    let mm2;
    if ((mm2 = line.match(/^\*\*分类\*\*[：:]\s*(.+?)\s*$/))) { cur.category = mm2[1]; continue; }
    if ((mm2 = line.match(/^\*\*最近练\*\*[：:]\s*(.+?)\s*$/))) { cur.lastPractice = mm2[1]; continue; }

    if (!sec) sec = { title: '', lines: [], images: [] };

    const sh = line.match(SHORTHAND_RE);                   // 简写写法（week1 05）
    if (sh) {
      const p = resolveShorthand(sh[1], sh[2], sh[3]);
      if (p) { sec.images.push({ src: p, alt: '' }); continue; }
      console.warn(`   ⚠ 认不出图片位置，已忽略：${line.trim()}`);
    }

    IMG_RE.lastIndex = 0;
    if (IMG_RE.test(line)) {                               // 这一行有图片
      IMG_RE.lastIndex = 0;
      let mm;
      while ((mm = IMG_RE.exec(line))) {
        sec.images.push({ src: toSitePath(mm[2]), alt: (mm[1] || '').trim() });
      }
      const rest = line.replace(IMG_RE, '').trim();
      if (!rest) continue;                                 // 整行只有图，就不留在正文里
      sec.lines.push(rest);
      continue;
    }
    sec.lines.push(line);
  }
  pushSec();
  return dishes;
}

const dishes = parse(fs.readFileSync(SRC, 'utf8'));

/** week3 → 300；week5day1 → 501。数字越大越新 */
function practiceRank(w) {
  const m = String(w || '').match(/week\s*(\d+)(?:\s*day\s*(\d+))?/i);
  return m ? Number(m[1]) * 100 + Number(m[2] || 0) : -1;
}
// 最新的排最前；同一批练习的保持文件里的先后
dishes.sort((a, b) => practiceRank(b.lastPractice) - practiceRank(a.lastPractice));

// 统计每张图被哪些菜用到（用于「这张图也被 XX 用了」）
const imageUsage = {};
for (const d of dishes) {
  const seen = new Set();
  for (const im of d.images) {
    if (seen.has(im.src)) continue;                        // 同一道菜里重复引用只算一次
    seen.add(im.src);
    (imageUsage[im.src] = imageUsage[im.src] || []).push(d.title);
  }
}

for (const d of dishes) {
  d.id = d.title;
  d.category = d.category || '';
  d.lastPractice = d.lastPractice || '';
  d.imageCount = d.images.length;
  d.cover = d.images.length ? d.images[0].src : null;
  d.sections = d.sections.filter(s => s.md.trim() || !/^图片$/.test(s.title));
}

const payload = {
  generatedAt: new Date().toISOString(),
  total: dishes.length,
  imageCount: Object.keys(imageUsage).length,
  dishes,
  imageUsage,
};
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');

const shared = Object.entries(imageUsage).filter(([, v]) => v.length > 1);
console.log(`✅ ${path.relative(ROOT, OUT)}`);
console.log(`   ${payload.total} 道菜 / ${payload.imageCount} 张成果图`);
const byCat = {};
for (const d of dishes) byCat[d.category || '未分类'] = (byCat[d.category || '未分类'] || 0) + 1;
console.log('   分类：' + Object.entries(byCat).map(([k, v]) => `${k} ${v}`).join(' · '));
const noCat = dishes.filter(d => !d.lastPractice).length;
if (noCat) console.log(`   ⚠ ${noCat} 道菜没写「**最近练**」，会排在最后`);
const noImg = dishes.filter(d => !d.imageCount).length;
if (noImg) console.log(`   ⚠ ${noImg} 道菜还没配图（在菜谱里加 ## 图片 小节即可）`);
if (shared.length) {
  console.log(`   🔁 ${shared.length} 张图被多道菜复用：`);
  for (const [src, t] of shared) console.log(`      ${src} → ${t.join('、')}`);
}