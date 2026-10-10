"use client";

import { useEffect, useState, useCallback } from "react";

export type LightboxImage = { src: string; alt: string };

export function Lightbox({
  images,
  index,
  title,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  title: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(index);

  const step = useCallback(
    (d: number) => {
      if (images.length < 2) return;
      setI((prev) => (prev + d + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [step, onClose]);

  const img = images[i] || { src: "", alt: "" };
  const single = images.length < 2;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(12,10,8,0.94)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 顶部信息栏 */}
      <div
        className="absolute left-0 right-0 top-0 z-[2] flex items-center justify-between px-3.5"
        style={{
          paddingTop: "calc(10px + env(safe-area-inset-top))",
          color: "#fff",
        }}
      >
        <div className="flex min-w-0 flex-col gap-0.5 pr-3 text-sm">
          <span>
            {i + 1} / {images.length}
          </span>
          <span className="text-xs opacity-85">{img.alt || title}</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
        >
          ✕
        </button>
      </div>

      {/* 左右导航 */}
      {!single && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-3xl"
            style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-3xl"
            style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
          >
            ›
          </button>
        </>
      )}

      <img
        src={img.src}
        alt={img.alt || title}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
