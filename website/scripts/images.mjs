// Image pipeline for the docs build (called from prepare.mjs).
//
// The sources reference full-size PNG screenshots (often 1-1.5 MB each). Images live
// in public/, so Astro never optimises them. Here every raster asset gets WebP copies
// at 800px and 1600px wide, and every <img> in the pages is rewritten to use them with
// srcset, intrinsic width/height (no layout shift), lazy loading and a non-empty alt.
//
// Encoded files are cached in website/.cache/images by content hash, so only new or
// changed screenshots are re-encoded (CI restores that folder with actions/cache).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTHS = [800, 1600];
const QUALITY = 80;
const RASTER = /\.(png|jpe?g)$/i;
// Bump to invalidate the cache when WIDTHS/QUALITY or the encoder settings change.
const CACHE_VERSION = 'v1';

// Width of the content column (Starlight caps it at 45rem).
const SIZES = '(min-width: 50rem) 720px, 100vw';

/**
 * Encodes every raster file under assetsDir into outDir/_w/<rel>-<width>.webp.
 * Returns Map<rel, { width, height, variants: [{ width, file }] }> (rel = path under assetsDir).
 */
export async function optimiseAssets(assetsDir, outDir, cacheDir) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const files = fs.readdirSync(assetsDir, { recursive: true }).filter((f) => RASTER.test(f));
  const meta = new Map();
  let encoded = 0;

  const work = async (rel) => {
    const buf = fs.readFileSync(path.join(assetsDir, rel));
    const hash = crypto.createHash('sha1').update(CACHE_VERSION).update(buf).digest('hex');
    const metaFile = path.join(cacheDir, `${hash}.json`);
    let info;
    if (fs.existsSync(metaFile)) {
      info = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    } else {
      const { width, height } = await sharp(buf).metadata();
      const targets = WIDTHS.filter((w) => w < width);
      if (targets.length < WIDTHS.length) targets.push(Math.min(width, WIDTHS.at(-1)));
      const variants = [];
      for (const w of [...new Set(targets)]) {
        await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(path.join(cacheDir, `${hash}-${w}.webp`));
        variants.push(w);
      }
      info = { width, height, variants };
      fs.writeFileSync(metaFile, JSON.stringify(info));
      encoded++;
    }
    const base = rel.replace(RASTER, '');
    const variants = info.variants.map((w) => {
      const file = path.posix.join('_w', `${base}-${w}.webp`);
      const dest = path.join(outDir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(cacheDir, `${hash}-${w}.webp`), dest);
      return { width: w, file };
    });
    meta.set(rel.split(path.sep).join('/'), { width: info.width, height: info.height, variants });
  };

  // Small worker pool: sharp is multi-threaded already, 4 files at a time keeps CI busy without thrashing.
  const queue = [...files];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await work(queue.shift()); }));
  console.log(`images: ${files.length} raster assets, ${encoded} encoded, ${files.length - encoded} from cache`);
  return meta;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = (s) =>
  s.replace(/<[^>]+>/g, ' ').replace(/[*_`#]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/&#x20;|&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// "trainingsPathwaysEditor.png" -> "Trainings pathways editor"; null for camera-roll names.
function altFromFilename(src) {
  const name = decodeURIComponent(path.posix.basename(src)).replace(/\.[a-z0-9]+$/i, '');
  if (/^(image|screenshot|img[_ -]?\d|untitled|photo|captura|pantallazo)|^[\d\s()_-]+$/i.test(name)) return null;
  const words = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  return words.length > 3 ? words[0].toUpperCase() + words.slice(1) : null;
}

function parseAttrs(tag) {
  const attrs = new Map();
  for (const m of tag.replace(/^<img\b|\/?>$/g, '').matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    attrs.set(m[1].toLowerCase(), value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
  }
  return attrs;
}

function renderImg(attrs, assetMeta) {
  const src = attrs.get('src') || '';
  const local = src.match(/^\/gitbook-assets\/(.+)$/);
  const info = local && assetMeta.get(decodeURIComponent(local[1]));
  if (info) {
    const largest = info.variants.at(-1);
    const url = (f) => '/gitbook-assets/' + f.split('/').map(encodeURIComponent).join('/');
    const fixedWidth = Number.parseInt(attrs.get('width'), 10);
    const width = fixedWidth > 0 ? fixedWidth : Math.min(info.width, largest.width);
    attrs.set('src', url(largest.file));
    if (info.variants.length > 1) attrs.set('srcset', info.variants.map((v) => `${url(v.file)} ${v.width}w`).join(', '));
    attrs.set('sizes', fixedWidth > 0 ? `${fixedWidth}px` : SIZES);
    attrs.set('width', String(width));
    attrs.set('height', String(Math.round((width * info.height) / info.width)));
  }
  if (!attrs.has('loading')) attrs.set('loading', 'lazy');
  if (!attrs.has('decoding')) attrs.set('decoding', 'async');
  return '<img ' + [...attrs].map(([k, v]) => `${k}="${esc(v)}"`).join(' ') + '>';
}

/**
 * Rewrites markdown and HTML images in a page body (already link-rewritten) into
 * optimised <img> tags with a meaningful alt. Fenced code blocks are left alone.
 */
export function rewriteImages(body, pageTitle, assetMeta) {
  let heading = null;
  const IMG = /^(#{1,6})\s+(.+)$|<img\b[^>]*>|!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(?:\s+"([^"]*)")?\)/gm;

  return body
    .split(/(^```[\s\S]*?^```$)/m)
    .map((part, i) => {
      if (i % 2) return part; // code fence
      return part.replace(IMG, (match, hashes, headingText, mdAlt, mdSrc, mdTitle, offset) => {
        if (hashes) {
          heading = plain(headingText);
          return match;
        }
        let attrs;
        if (match.startsWith('<img')) {
          attrs = parseAttrs(match);
          if (attrs.has('data-zoom-off')) return match; // decorative (video thumbnails)
        } else {
          attrs = new Map([['src', mdSrc.replace(/^<|>$/g, '')], ['alt', mdAlt]]);
          if (mdTitle) attrs.set('title', mdTitle);
        }
        if (!plain(attrs.get('alt') || '')) {
          const after = part.slice(offset + match.length, offset + match.length + 600);
          const caption = after.match(/^\s*<figcaption>([\s\S]*?)<\/figcaption>/);
          attrs.set(
            'alt',
            (caption && plain(caption[1])) || altFromFilename(attrs.get('src') || '') || `Screenshot: ${heading || pageTitle}`,
          );
        }
        return renderImg(attrs, assetMeta);
      });
    })
    .join('');
}
