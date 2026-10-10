"use client";

import { useState, useMemo } from "react";
import type { Recipe } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Lightbox, type LightboxImage } from "./Lightbox";

const CAT_ORDER = [
  "🥚 蛋类",
  "🥩 肉类",
  "🦐 虾 · 海鲜",
  "🥬 素菜",
  "🍲 炖 · 一锅",
  "🍜 主食",
  "🍰 甜点",
];

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [allOpen, setAllOpen] = useState(true);
  const [lightbox, setLightbox] = useState<{
    images: LightboxImage[];
    index: number;
    title: string;
  } | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(recipes.map((r) => r.category).filter(Boolean))];
    cats.sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a);
      const ib = CAT_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return cats;
  }, [recipes]);

  const totalImages = useMemo(
    () => new Set(recipes.flatMap((r) => r.images.map((im) => im.url))).size,
    [recipes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const hay = (
        r.title +
        " " +
        r.category +
        " " +
        r.steps +
        " " +
        r.notes +
        " " +
        r.ingredients.map((i) => i.name + " " + i.quantity).join(" ")
      ).toLowerCase();
      return (!q || hay.includes(q)) && (!activeCat || r.category === activeCat);
    });
  }, [recipes, query, activeCat]);

  if (!recipes.length) {
    return (
      <div
        className="rounded-2xl p-4 text-center text-sm"
        style={{
          background: "var(--card)",
          color: "var(--muted)",
        }}
      >
        还没有菜谱。去「管理」页面添加第一道菜吧！
      </div>
    );
  }

  return (
    <>
      {/* 搜索栏 */}
      <div className="mb-3 flex gap-2">
        <input
          type="search"
          placeholder="搜菜名、食材、做法…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-base outline-none"
          style={{
            borderColor: "var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
          }}
        />
        <button
          onClick={() => setAllOpen((v) => !v)}
          className="flex-none rounded-xl border px-3 py-2.5 text-sm"
          style={{
            borderColor: "var(--line)",
            background: "var(--card)",
            color: "var(--muted)",
          }}
        >
          {allOpen ? "全部收起" : "全部展开"}
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto px-0.5 pb-2">
        <CatChip
          label="全部"
          active={activeCat === ""}
          onClick={() => setActiveCat("")}
        />
        {categories.map((c) => (
          <CatChip
            key={c}
            label={c}
            active={activeCat === c}
            onClick={() => setActiveCat(c)}
          />
        ))}
      </div>

      {/* 计数 */}
      <div className="mb-2.5 px-0.5 text-xs" style={{ color: "var(--muted)" }}>
        {query || activeCat
          ? `找到 ${filtered.length} / ${recipes.length} 道菜`
          : `${recipes.length} 道菜 · ${totalImages} 张成果图`}
      </div>

      {/* 菜谱列表 */}
      <div className="recipe-grid">
        {filtered.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            open={allOpen}
            onImageClick={(images, idx) =>
              setLightbox({ images, index: idx, title: r.title })
            }
          />
        ))}
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-sm"
      style={
        active
          ? {
              background: "var(--accent)",
              borderColor: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
            }
          : {
              borderColor: "var(--line)",
              background: "var(--card)",
              color: "var(--muted)",
            }
      }
    >
      {label}
    </button>
  );
}

function RecipeCard({
  recipe,
  open,
  onImageClick,
}: {
  recipe: Recipe;
  open: boolean;
  onImageClick: (images: LightboxImage[], idx: number) => void;
}) {
  const images: LightboxImage[] = recipe.images.map((im) => ({
    src: im.url,
    alt: im.alt,
  }));

  return (
    <article
      className="recipe-card mb-3.5 overflow-hidden rounded-2xl"
      style={{ background: "var(--card)", boxShadow: "var(--shadow)" }}
    >
      <details open={open}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5">
          <span className="min-w-0 flex-1 text-base font-bold">
            {recipe.title}
          </span>
          {recipe.category && (
            <span
              className="flex-none whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              {recipe.category}
            </span>
          )}
          <span
            className="flex-none rounded-full px-2.5 py-0.5 text-xs"
            style={{ background: "var(--accent-soft)", color: "var(--muted)" }}
          >
            {images.length ? `${images.length} 张图` : "待配图"}
          </span>
        </summary>

        <div className="px-4 pb-3.5 pt-0.5">
          {/* 图片画廊 */}
          {images.length > 0 && (
            <div
              className="my-2.5 grid gap-1.5"
              style={{
                gridTemplateColumns:
                  images.length === 1
                    ? "1fr"
                    : images.length === 2
                      ? "repeat(2,1fr)"
                      : "repeat(3,1fr)",
              }}
            >
              {images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => onImageClick(images, i)}
                  className="relative aspect-square overflow-hidden rounded-lg"
                  style={{ background: "var(--line)" }}
                >
                  <img
                    src={im.src}
                    alt={im.alt || `${recipe.title} 第 ${i + 1} 张`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* 食材清单 */}
          {recipe.ingredients.length > 0 && (
            <section className="mt-3.5">
              <h4
                className="mb-1 text-sm font-bold tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                🧺 食材
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="rounded-lg px-2.5 py-1 text-sm"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--ink)",
                    }}
                  >
                    {ing.name}
                    {ing.quantity && (
                      <span style={{ color: "var(--muted)" }}>
                        {" "}
                        {ing.quantity}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 标准做法 */}
          {recipe.steps?.trim() && (
            <section className="mt-3.5">
              <h4
                className="mb-1 text-sm font-bold tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                📝 标准做法
              </h4>
              <Markdown>{recipe.steps}</Markdown>
            </section>
          )}

          {/* 我的做法 */}
          {recipe.notes?.trim() && (
            <section
              className="mt-3.5 rounded-xl border p-3"
              style={{
                background: "var(--mine-bg)",
                borderColor: "var(--mine-line)",
              }}
            >
              <h4
                className="mb-1 text-sm font-bold tracking-wide"
                style={{ color: "var(--good)" }}
              >
                ✍️ 我的做法
              </h4>
              <Markdown>{recipe.notes}</Markdown>
            </section>
          )}
        </div>
      </details>
    </article>
  );
}
