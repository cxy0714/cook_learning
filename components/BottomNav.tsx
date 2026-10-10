"use client";

import { useRouter, usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "菜谱", icon: "🍳" },
  { href: "/ingredients", label: "食材", icon: "🧺" },
  { href: "/admin", label: "管理", icon: "✏️" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 flex border-t bg-[var(--card)]"
      style={{
        borderColor: "var(--line)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className="flex flex-1 flex-col items-center gap-px py-2 text-xs"
            style={{
              color: active ? "var(--accent)" : "var(--muted)",
              fontWeight: active ? 700 : 400,
            }}
          >
            <span className="text-base leading-tight">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
