// Turns the GitBook-format sources in the repo root into Starlight content.
//
// The markdown stays in GitBook syntax in the repo (neo's in-app help reads it
// raw from GitHub). This script writes the converted copy that Astro builds:
//   src/content/docs/**   pages ({% hint %} -> asides, mermaid -> diagrams, README -> index, links -> URLs)
//   src/sidebar.json      navigation, from SUMMARY.md
//   public/gitbook-assets images and files from .gitbook/assets
//   public/fcom/**, public/api-docs/**  redirects from the old GitBook URLs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { optimiseAssets, rewriteImages } from './images.mjs';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SITE, '..');
const OUT = path.join(SITE, 'src/content/docs');
const PUBLIC = path.join(SITE, 'public');

const SKIP = new Set(['.git', '.github', '.gitbook', '.worktrees', '.superpowers', 'superpowers', 'website', 'node_modules', 'build', 'tools']);

const ASIDES = { info: 'note', success: 'tip', warning: 'caution', danger: 'danger' };

// flights/README.md -> /flights/ ; API/Flights.md -> /api/flights/
function urlFor(rel) {
  const parts = rel.replace(/\.md$/i, '').split('/').map((p) => p.toLowerCase().replace(/\s+/g, '-'));
  if (parts.at(-1) === 'readme') parts.pop();
  return '/' + parts.join('/') + (parts.length ? '/' : '');
}

function outPathFor(rel) {
  return rel.replace(/(^|\/)README\.md$/i, '$1index.md');
}

function listMarkdown(dir = ROOT, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SKIP.has(e.name) || e.name.startsWith('.')) return [];
    const rel = prefix + e.name;
    if (e.isDirectory()) return listMarkdown(path.join(dir, e.name), rel + '/');
    return e.name.endsWith('.md') && e.name !== 'SUMMARY.md' ? [rel] : [];
  });
}

function rewriteTarget(target, fromRel) {
  if (/^([a-z]+:|#|\/|mailto:)/i.test(target)) return target;
  const asset = target.match(/^(?:\.\.\/)*\.gitbook\/assets\/(.+)$/);
  if (asset) return '/gitbook-assets/' + asset[1];
  const md = target.match(/^([^#?]+\.md)(#.*)?$/i);
  if (!md) return target;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), decodeURI(md[1])));
  return urlFor(resolved) + (md[2] || '');
}

// Last commit date per source file, from one `git log` walk (newest first, so the
// first date seen for a path wins). The generated copies under src/content/docs
// are gitignored, so Starlight's own lastUpdated lookup finds nothing; we pass the
// source file's date through frontmatter instead. Needs full history in CI
// (actions/checkout fetch-depth: 0), or every page gets the latest commit's date.
function commitDates() {
  const dates = new Map();
  const first = new Map();
  let out;
  try {
    out = execFileSync('git', ['-c', 'core.quotePath=false', 'log', '--format=@@%cI', '--name-only', '--', '.'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return { dates, first };
  }
  let date = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('@@')) date = line.slice(2);
    else if (line && date) {
      if (!dates.has(line)) dates.set(line, date);
      first.set(line, date); // keeps being overwritten until the oldest commit
    }
  }
  return { dates, first };
}

// Meta description for pages whose source has none: the first real paragraph, trimmed
// to ~160 characters. Skips headings, images, embeds, hints and short lines such as the
// "**November 2026** · Training courses" dateline of What's new posts.
function autoDescription(body) {
  for (const para of body.split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p || /^(#|<|\{%|!\[|\||```|:::|\*\*\*|[*-] |\d+\. )/.test(p)) continue;
    const text = p
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^>\s*/gm, '')
      .replace(/[*_`\\]/g, '')
      .replace(/&#x20;|&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length < 50) continue;
    if (text.length <= 160) return text;
    return text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
  }
  return null;
}

// Facade for YouTube embeds: a thumbnail link that only loads the player (about 500 KB
// of script per video) when clicked. MarkdownContent.astro swaps in the iframe; without
// JavaScript the link opens the video on YouTube.
function youtubeFacade(id, title) {
  const label = esc(`Play video: ${title}`);
  return `<a class="video-embed yt-facade" href="https://www.youtube.com/watch?v=${id}" data-yt="${id}" aria-label="${label}">` +
    `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async" data-zoom-off>` +
    `<span class="yt-play" aria-hidden="true"></span></a>`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function convert(src, rel, fallbackTitle, { lastUpdated, published }) {
  let front = {};
  let body = src;
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    front = YAML.parse(fm[1]) || {};
    body = body.slice(fm[0].length);
  }

  // Starlight renders the title itself, so lift the first H1 into frontmatter.
  let title = fallbackTitle;
  const h1 = body.match(/^\s*# (.+)\n/);
  if (h1) {
    title = h1[1].trim();
    body = body.slice(h1[0].length);
  }

  body = body
    // Starlight has no mermaid support: emit a raw <pre class="mermaid"> that
    // MarkdownContent.astro renders client-side. Escaped so the HTML parser keeps the source intact.
    .replace(/^```mermaid\n([\s\S]*?)\n```$/gm, (_, src) =>
      `<pre class="mermaid">${src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`)
    .replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/g, (_, url) => {
      const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
      return yt ? youtubeFacade(yt[1], title) : `<${url}>`;
    })
    .replace(/\{%\s*file\s+src="([^"]+)"\s*%\}(?:\n?([\s\S]*?)\{%\s*endfile\s*%\})?/g, (_, src, caption = '') => {
      caption = caption.trim();
      if (/\.(mp4|webm|mov)$/i.test(src)) {
        return `<video controls preload="metadata" src="${src}"></video>` + (caption ? `\n\n${caption}` : '');
      }
      return `[${caption || path.posix.basename(src)}](${src})`;
    })
    .replace(/\{%\s*hint\s+style="(\w+)"\s*%\}\n?([\s\S]*?)\{%\s*endhint\s*%\}/g, (_, style, inner) =>
      `:::${ASIDES[style] || 'note'}\n${inner.trim()}\n:::\n`)
    // markdown links/images: ](target) and ](<target>)
    .replace(/\]\(<([^>]+)>\)/g, (_, t) => `](<${rewriteTarget(t, rel)}>)`)
    .replace(/\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (_, t, titlePart) => `](${rewriteTarget(t, rel)}${titlePart})`)
    // raw HTML src/href
    .replace(/\b(src|href)="([^"]+)"/g, (_, attr, t) => `${attr}="${rewriteTarget(t, rel)}"`);

  body = rewriteImages(body, title, assetMeta);

  const data = { title };
  const description = front.description ? String(front.description).trim() : autoDescription(body);
  if (description) data.description = description;
  if (lastUpdated) data.lastUpdated = lastUpdated;
  // Badges under the title (components/PageTitle.astro): who the page is for and the
  // lowest plan that includes the feature. Set in the source frontmatter.
  if (front.audience) data.audience = [].concat(front.audience);
  if (front.plan) data.plan = String(front.plan);
  // What's new posts carry their publication date for the RSS feed.
  if (published && /^whats-new\/(?!README\.md$)/i.test(rel)) data.published = published;
  return `---\n${YAML.stringify(data)}---\n\n${body.trimStart()}`;
}

// SUMMARY.md -> Starlight sidebar. "## X" = group; nested bullets = sub-groups.
function sidebarFromSummary(file) {
  const top = [];
  let group = null;
  let stack = [];
  const titles = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('## ')) {
      group = { label: line.slice(3).trim(), items: [], collapsed: true };
      top.push(group);
      stack = [];
      continue;
    }
    const m = line.match(/^(\s*)[*-] \[(.+?)\]\((.+?)\)/);
    if (!m) continue;
    const depth = Math.floor(m[1].replace(/\t/g, '  ').length / 2);
    const rel = m[3].replace(/^<|>$/g, '');
    titles.set(rel, m[2]);
    const node = { label: m[2], link: urlFor(rel), children: [] };
    stack = stack.slice(0, depth);
    (stack.length ? stack.at(-1).children : group ? group.items : top).push(node);
    stack.push(node);
  }
  const toItem = (n) =>
    n.children.length
      ? { label: n.label, collapsed: true, items: [{ label: 'Overview', link: n.link }, ...n.children.map(toItem)] }
      : { label: n.label, link: n.link };
  const walk = (items) => items.map((i) => ('children' in i ? toItem(i) : { ...i, items: walk(i.items) }));
  return { sidebar: walk(top), titles };
}

function redirectHtml(to) {
  return `<!doctype html><meta charset="utf-8"><title>Redirecting…</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><a href="${to}">${to}</a>\n`;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

for (const dir of [OUT, path.join(PUBLIC, 'gitbook-assets'), path.join(PUBLIC, 'fcom'), path.join(PUBLIC, 'api-docs')]) {
  fs.rmSync(dir, { recursive: true, force: true });
}

const { sidebar, titles } = sidebarFromSummary(path.join(ROOT, 'SUMMARY.md'));
writeFile(path.join(SITE, 'src/sidebar.json'), JSON.stringify(sidebar, null, 2));

// Assets first: page conversion needs each image's size and WebP variants.
fs.cpSync(path.join(ROOT, '.gitbook/assets'), path.join(PUBLIC, 'gitbook-assets'), { recursive: true });
const assetMeta = await optimiseAssets(path.join(ROOT, '.gitbook/assets'), path.join(PUBLIC, 'gitbook-assets'), path.join(SITE, '.cache/images'));

const pages = listMarkdown();
const { dates: lastDates, first: firstDates } = commitDates();
for (const rel of pages) {
  const fallback = titles.get(rel) || path.posix.basename(rel, '.md').replace(/[-_]/g, ' ');
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  writeFile(path.join(OUT, outPathFor(rel)), convert(src, rel, fallback, { lastUpdated: lastDates.get(rel), published: firstDates.get(rel) }));

  // Old GitBook URLs: /fcom/flights/flight-types, /fcom/flights (folder README), and the
  // API space at /api-docs/flights. GitHub Pages serves x.html for /x and dir/index.html for /dir.
  const to = urlFor(rel);
  const old = rel.replace(/\.md$/i, '').replace(/(^|\/)README$/i, '');
  const isIndex = /(^|\/)README\.md$/i.test(rel);
  const olds = [path.join('fcom', old)];
  if (/^API\//.test(rel)) olds.push(path.join('api-docs', old.replace(/^API\/?/, '')));
  for (const o of olds) {
    for (const variant of new Set([o, o.toLowerCase()])) {
      writeFile(path.join(PUBLIC, isIndex ? path.join(variant, 'index.html') : `${variant}.html`), redirectHtml(to));
    }
  }
}

console.log(`prepared ${pages.length} pages, ${sidebar.length} sidebar groups`);
