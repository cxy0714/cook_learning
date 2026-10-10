# 🍳 我的菜谱

老婆的专属菜谱本：在线记录每道菜的**标准做法**、**我的做法**、**食材**和**成果图**。
移动端优先，支持 Vercel 一键部署，数据存 Postgres。

## ✨ 功能

- **🍳 菜谱页**：浏览所有菜品，搜索菜名/食材/做法，按分类筛选，图片点开看大图
- **🧺 食材页**：按分类展示所有食材
- **✏️ 管理页**：在线新增/编辑/删除菜品，支持食材选择、图片上传、Markdown 做法

## 🛠 技术栈

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) — 菜谱/食材数据
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — 图片存储
- [Tailwind CSS v4](https://tailwindcss.com/) — 样式

## 🚀 部署到 Vercel

### 1. 创建 Vercel 项目

在 [Vercel](https://vercel.com) 导入本 GitHub 仓库，框架自动识别为 Next.js。

### 2. 创建存储

在 Vercel 控制台：

1. **Storage → Create → Postgres** — 创建数据库，自动注入 `POSTGRES_URL` 等环境变量
2. **Storage → Create → Blob** — 创建 Blob 存储，自动注入 `BLOB_READ_WRITE_TOKEN`

### 3. 设置管理密码

在 Vercel 项目 **Settings → Environment Variables** 添加：

```
ADMIN_PASSWORD=你的密码
```

### 4. 部署 + 迁移

1. 点 Deploy，等部署完成
2. 本地配置 `.env.local`（从 Vercel 控制台复制 Postgres 和 Blob 的环境变量）
3. 运行迁移脚本建表 + 导入 3 道示例菜谱：

```bash
npm install
npx tsx scripts/migrate.ts
```

4. 访问 `/admin` 输入密码，开始管理菜谱

## 💻 本地开发

```bash
npm install
cp .env.example .env.local  # 填入 Vercel Postgres 和 Blob 的连接信息
npm run dev
```

打开 [localhost:3000](http://localhost:3000)。

## 📂 目录结构

```
app/                    Next.js App Router
  page.tsx              菜谱列表（公开）
  ingredients/          食材页（公开）
  admin/                管理界面（需密码）
  api/                  API 路由（recipes/ingredients/upload/auth）
components/             React 组件
lib/                   数据库、认证、Markdown 工具
scripts/migrate.ts     建表 + 导入示例数据
public/                静态资源（图标、示例图片）
Food/                  旧 markdown 源文件（迁移用，可删）
data/                  旧图片（迁移用，可删）
```

## 📝 关于 Markdown

标准做法和我的做法支持 Markdown 格式：`**粗体**`、`1. 有序列表`、`- 无序列表`、`> 引用` 等。
