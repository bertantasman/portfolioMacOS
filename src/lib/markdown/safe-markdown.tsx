import type { ReactNode } from "react";
import { CodeBlock, MarkdownImage } from "./markdown-client";

/**
 * A small Markdown renderer that builds React elements directly. It never uses innerHTML or a raw-HTML
 * path: any HTML in the source is reduced to its text, links are limited to http(s)/mailto, and images to a few
 * GitHub-owned hosts, so a README cannot run script or load arbitrary content.
 */
export interface MarkdownRepo {
  fullName: string;
  defaultBranch: string;
  htmlUrl: string;
}

const IMAGE_HOSTS = new Set(["raw.githubusercontent.com", "user-images.githubusercontent.com", "github.com", "private-user-images.githubusercontent.com"]);

const stripPath = (p: string) => p.replace(/^\.?\//, "");

/** Absolute http(s)/mailto links as they are; relative ones resolved against the repository on GitHub; anything else dropped. */
export function resolveLink(url: string, repo: MarkdownRepo): string | null {
  const u = url.trim();
  if (!u || u.startsWith("#")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) {
    try {
      const parsed = new URL(u);
      return ["https:", "http:", "mailto:"].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  }
  return `${repo.htmlUrl}/blob/${encodeURIComponent(repo.defaultBranch)}/${stripPath(u).split("/").map(encodeURIComponent).join("/")}`;
}

/** Images: relative paths come from the repository's raw files; absolute ones only from allow-listed GitHub hosts. */
export function resolveImage(url: string, repo: MarkdownRepo): string | null {
  const u = url.trim();
  if (!u) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "https:" && IMAGE_HOSTS.has(parsed.hostname) ? parsed.href : null;
    } catch {
      return null;
    }
  }
  return `https://raw.githubusercontent.com/${repo.fullName}/${encodeURIComponent(repo.defaultBranch)}/${stripPath(u).split("/").map(encodeURIComponent).join("/")}`;
}

const stripHtml = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "");

const INLINE = /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[((?:[^\]\\]|\\.|!\[[^\]]*\]\([^)]*\))*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_)/g;

function inline(text: string, repo: MarkdownRepo, key: string): ReactNode[] {
  const source = stripHtml(text);
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of source.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(source.slice(last, at));
    const k = `${key}-${n++}`;
    if (m[3] !== undefined) {
      const src = resolveImage(m[3], repo);
      out.push(src ? <MarkdownImage key={k} src={src} alt={m[2]} /> : m[2] || "");
    } else if (m[5] !== undefined) {
      const href = resolveLink(m[5], repo);
      const label = inline(m[4], repo, k);
      out.push(
        href ? (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-(--link-color) underline-offset-2 hover:underline">
            {label}
          </a>
        ) : (
          <span key={k}>{label}</span>
        ),
      );
    } else if (m[6] !== undefined) out.push(<code key={k} className="rounded bg-black/[0.07] px-1 py-0.5 font-mono text-[0.92em]">{m[6]}</code>);
    else if (m[7] !== undefined || m[8] !== undefined) out.push(<strong key={k}>{inline((m[7] ?? m[8])!, repo, k)}</strong>);
    else out.push(<em key={k}>{inline((m[9] ?? m[10])!, repo, k)}</em>);
    last = at + m[0].length;
  }
  if (last < source.length) out.push(source.slice(last));
  return out;
}

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "rule" }
  | { kind: "table"; rows: string[] };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = line.match(/^\s*(```|~~~)/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ kind: "rule" });
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ kind: "quote", text: body.join(" ") });
      continue;
    }
    const bullet = line.match(/^\s*([-*+]|\d+[.)])\s+/);
    if (bullet) {
      const ordered = /\d/.test(bullet[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
        if (m) items.push(m[2]);
        else if (/^\s{2,}\S/.test(lines[i]) && items.length > 0) items[items.length - 1] += ` ${lines[i].trim()}`;
        else break;
        i++;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(lines[i++]);
      blocks.push({ kind: "table", rows: rows.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r)) });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|\s*(```|~~~)|\s*>|\s*([-*+]|\d+[.)])\s)/.test(lines[i])) para.push(lines[i++].trim());
    if (para.length === 0) {
      para.push(lines[i++].trim());
    }
    const text = stripHtml(para.join(" ")).trim();
    // A block that was only HTML (a <div>, an HTML comment) has no text left, and is skipped.
    if (text || /!\[/.test(para.join(" "))) blocks.push({ kind: "paragraph", text: para.join(" ") });
  }
  return blocks;
}

const headingClass = ["", "text-[20px]", "text-[17px]", "text-[15px]", "text-[14px]", "text-[13px]", "text-[13px]"];

export function SafeMarkdown({ source, repo }: { source: string; repo: MarkdownRepo }) {
  const blocks = parseBlocks(source);
  return (
    <div className="space-y-3 text-[13px] leading-[20px] break-words text-black/80">
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.kind) {
          case "heading": {
            const Tag = `h${Math.min(6, b.level + 1)}` as "h2";
            return (
              <Tag key={key} className={`pt-1 font-semibold text-black/90 ${headingClass[b.level]}`}>
                {inline(b.text, repo, key)}
              </Tag>
            );
          }
          case "paragraph":
            return <p key={key}>{inline(b.text, repo, key)}</p>;
          case "code":
            return <CodeBlock key={key} text={b.text} />;
          case "quote":
            return (
              <blockquote key={key} className="border-l-2 border-black/15 pl-3 text-black/60">
                {inline(b.text, repo, key)}
              </blockquote>
            );
          case "rule":
            return <hr key={key} className="border-black/10" />;
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={key} className={`space-y-1 pl-5 marker:text-black/35 ${b.ordered ? "list-decimal" : "list-disc"}`}>
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item, repo, `${key}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          case "table": {
            const cells = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
            const [head, ...body] = b.rows.map(cells);
            return (
              <div key={key} className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr>
                      {head.map((c, j) => (
                        <th key={j} className="border border-black/10 bg-black/[0.04] px-2 py-1 text-left font-semibold">
                          {inline(c, repo, `${key}-h${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {body.map((row, r) => (
                      <tr key={r}>
                        {row.map((c, j) => (
                          <td key={j} className="border border-black/10 px-2 py-1 align-top">
                            {inline(c, repo, `${key}-${r}-${j}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
