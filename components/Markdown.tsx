import { mdToHtml } from "@/lib/markdown";

/** Markdown 渲染组件 */
export function Markdown({ children }: { children: string }) {
  return (
    <div
      className="md"
      dangerouslySetInnerHTML={{ __html: mdToHtml(children || "") }}
    />
  );
}
