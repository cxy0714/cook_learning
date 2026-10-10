/**
 * 简易 markdown → HTML 渲染器
 * 从原 index.html 移植，支持：标题、有序/无序列表、粗体、行内代码、
 * 图片、链接、引用块、水平线、段落
 */

const esc = (s: string) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function inline(s: string): string {
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

const SPECIAL = /^(#{1,6}\s|>|-{3,}\s*$|\d+[.、]\s|[-*]\s)/;

export function mdToHtml(md: string): string {
  const lines = String(md).replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      const lv = m[1].length;
      out.push(`<h${lv}>${inline(m[2])}</h${lv}>`);
      i++;
      continue;
    }
    if (/^-{3,}\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }
    if (/^>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        buf.push(lines[i].replace(/^> ?/, ""));
        i++;
      }
      out.push("<blockquote>" + mdToHtml(buf.join("\n")) + "</blockquote>");
      continue;
    }
    if (/^\d+[.、]\s/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+[.、]\s/.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+[.、]\s+/, ""));
        i++;
      }
      out.push("<ol>" + buf.map((x) => "<li>" + inline(x) + "</li>").join("") + "</ol>");
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        buf.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push("<ul>" + buf.map((x) => "<li>" + inline(x) + "</li>").join("") + "</ul>");
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !SPECIAL.test(lines[i])) {
      const t = lines[i].trim();
      buf.push(
        /^https?:\/\/\S+$/.test(t)
          ? `<a href="${esc(t)}" target="_blank" rel="noopener">📎 查看附件</a>`
          : inline(lines[i]),
      );
      i++;
    }
    out.push("<p>" + buf.join("<br>") + "</p>");
  }
  return out.join("\n");
}
