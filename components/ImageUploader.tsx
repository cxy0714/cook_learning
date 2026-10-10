"use client";

import { useState, useRef } from "react";
import type { RecipeImage } from "@/lib/types";

export function ImageUploader({
  images,
  onChange,
}: {
  images: RecipeImage[];
  onChange: (images: RecipeImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setError("");
    const newImages = [...images];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} 超过 8MB，已跳过`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        newImages.push({
          url,
          alt: "",
          sort_order: newImages.length,
        });
      } catch {
        setError(`${file.name} 上传失败`);
      }
    }
    onChange(newImages);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateAlt(idx: number, alt: string) {
    const next = [...images];
    next[idx] = { ...next[idx], alt };
    onChange(next);
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div>
      {/* 已上传图片预览 */}
      <div className="mb-2 space-y-2">
        {images.map((img, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <img
              src={img.url}
              alt={img.alt}
              className="h-16 w-16 flex-none rounded-lg object-cover"
              style={{ background: "var(--line)" }}
            />
            <input
              type="text"
              placeholder="说明文字（可选）"
              value={img.alt}
              onChange={(e) => updateAlt(idx, e.target.value)}
              className="min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{
                borderColor: "var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
            <div className="flex flex-none flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                className="text-xs"
                style={{ color: "var(--muted)" }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                className="text-xs"
                style={{ color: "var(--muted)" }}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="flex-none text-lg"
              style={{ color: "var(--muted)" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 上传按钮 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-dashed px-3 py-1.5 text-sm disabled:opacity-50"
        style={{
          borderColor: "var(--line)",
          color: "var(--muted)",
        }}
      >
        {uploading ? "上传中…" : "+ 添加图片"}
      </button>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--accent)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
