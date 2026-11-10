#!/usr/bin/env python3
"""Build the GitBook-format docs as a static MkDocs site for GitHub Pages.

The markdown sources stay in GitBook syntax (neo's in-app help reads them raw
from GitHub). This script copies them into build/docs/, converts the GitBook-only
bits ({% hint %}, {% embed %}, {% file %}, .gitbook/assets, SUMMARY.md nav) and
writes build/mkdocs.yml. Then: mkdocs build -f build/mkdocs.yml
"""
import re
import shutil
import sys
from pathlib import Path

import yaml

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
BUILD = ROOT / "build"
DOCS = BUILD / "docs"
SKIP = {".git", ".github", ".worktrees", ".superpowers", "superpowers", "tools", "build", ".gitbook"}
ASSETS = "gitbook-assets"  # MkDocs ignores dot-dirs, so .gitbook/assets is renamed

HINT_RE = re.compile(r'\{%\s*hint\s+style="(\w+)"\s*%\}\n?(.*?)\{%\s*endhint\s*%\}', re.S)
EMBED_RE = re.compile(r'\{%\s*embed\s+url="([^"]+)"\s*%\}')
FILE_RE = re.compile(r'\{%\s*file\s+src="([^"]+)"\s*%\}(?:\n?(.*?)\{%\s*endfile\s*%\})?', re.S)
YT_RE = re.compile(r'(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/))([\w-]{11})')


def embed(m):
    url = m.group(1)
    yt = YT_RE.search(url)
    if yt:
        return (f'<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/{yt.group(1)}" '
                f'allowfullscreen loading="lazy"></iframe></div>')
    return f"<{url}>"


def file_tag(m):
    src, caption = m.group(1), (m.group(2) or "").strip()
    if src.lower().endswith((".mp4", ".webm", ".mov")):
        out = f'<video controls preload="metadata" src="{src}"></video>'
        return out + (f"\n\n{caption}" if caption else "")
    return f"[{caption or Path(src).name}]({src})"


def hint(m):
    style, body = m.group(1), m.group(2).strip("\n")
    style = {"info": "info", "warning": "warning", "danger": "danger", "success": "success"}.get(style, "note")
    indented = "\n".join(("    " + line) if line.strip() else "" for line in body.split("\n"))
    return f'!!! {style} ""\n\n{indented}\n'


def convert(text):
    text = text.replace(".gitbook/assets/", f"{ASSETS}/")
    text = EMBED_RE.sub(embed, text)
    text = FILE_RE.sub(file_tag, text)
    return HINT_RE.sub(hint, text)


def nav_from_summary(path):
    """GitBook SUMMARY.md -> MkDocs nav. '## X' = section, nested '*' = children."""
    sections, current, stack = [], None, []
    root = []
    for line in path.read_text().splitlines():
        if line.startswith("## "):
            current = {"title": line[3:].strip(), "children": []}
            sections.append(current)
            stack = []
            continue
        m = re.match(r"^(\s*)[*-] \[(.+?)\]\((.+?)\)", line)
        if not m:
            continue
        depth = len(m.group(1).replace("\t", "  ")) // 2
        node = {"title": m.group(2), "file": m.group(3).strip("<>"), "children": []}
        stack = stack[:depth]
        parent = stack[-1]["children"] if stack else (current["children"] if current else root)
        parent.append(node)
        stack.append(node)

    def to_nav(n):
        if not n["children"]:
            return {n["title"]: n["file"]}
        return {n["title"]: [n["file"]] + [to_nav(c) for c in n["children"]]}

    return [to_nav(n) for n in root] + [{s["title"]: [to_nav(c) for c in s["children"]]} for s in sections]


def main():
    shutil.rmtree(BUILD, ignore_errors=True)
    DOCS.mkdir(parents=True)
    for src in ROOT.rglob("*"):
        rel = src.relative_to(ROOT)
        if rel.parts[0] in SKIP or src.name in (".DS_Store", "SUMMARY.md") or src.is_dir():
            continue
        if rel.name in ("mkdocs.base.yml", ".gitignore"):
            continue
        dst = DOCS / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix == ".md":
            dst.write_text(convert(src.read_text()))
        else:
            shutil.copy2(src, dst)
    shutil.copytree(ROOT / ".gitbook" / "assets", DOCS / ASSETS)
    (DOCS / "gitbook-compat.css").write_text(
        ".video-embed{position:relative;aspect-ratio:16/9;margin:1em 0}"
        ".video-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}"
        ".md-typeset video{max-width:100%}"
        ".md-typeset figure img{max-width:100%;height:auto}\n"
    )

    config = yaml.safe_load((ROOT / "mkdocs.base.yml").read_text())
    config["docs_dir"] = "docs"
    config["site_dir"] = "site/fcom"
    config["nav"] = nav_from_summary(ROOT / "SUMMARY.md")
    (BUILD / "mkdocs.yml").write_text(yaml.safe_dump(config, sort_keys=False, allow_unicode=True))

    # docs.flylogs.com/ -> /fcom/ (what GitBook did)
    site = BUILD / "site"
    site.mkdir(exist_ok=True)
    (site / "index.html").write_text(
        '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/fcom/">'
        '<link rel="canonical" href="/fcom/"><a href="/fcom/">Flylogs docs</a>\n'
    )
    (site / ".nojekyll").write_text("")


if __name__ == "__main__":
    main()
