#!/usr/bin/env node
/**
 * update-docs-index.mjs
 *
 * Scans docs/ for Markdown (.md) and standalone HTML (.html) files,
 * extracts titles, determines creation time via Git first-commit date,
 * and updates docs/timeline.md and docs/index.md accordingly.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');

// ---------------------------------------------------------------------------
// 1. Walk the docs directory
// ---------------------------------------------------------------------------

/**
 * Recursively collect all .md and .html files under `dir`.
 * Skips the .vitepress/ directory.
 */
function walkDocs(dir) {
  /** @type {string[]} */
  const files = [];

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return; // permission errors, etc.
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.vitepress') continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.md' || ext === '.html') {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

// ---------------------------------------------------------------------------
// 2. Title extraction
// ---------------------------------------------------------------------------

/**
 * Extract a human-readable title from a doc file.
 * - Markdown: first `# Title` line.
 * - HTML: `<title>` tag, then first `<h1>`, then fallback to filename stem.
 * - Fallback: filename without extension.
 */
function extractTitle(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.md') {
    const content = readFileUtf8(filePath);
    // Match the first ATX heading level 1
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
  }

  if (ext === '.html') {
    const content = readFileUtf8(filePath);
    // Prefer <title>
    let match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (match) {
      const title = match[1].replace(/\s+/g, ' ').trim();
      if (title) return title;
    }
    // Fallback: first <h1>
    match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (match) {
      const h1 = match[1].replace(/\s+/g, ' ').trim();
      if (h1) return h1;
    }
  }

  // Final fallback: filename without extension
  return path.basename(filePath, ext);
}

// ---------------------------------------------------------------------------
// 3. Creation time via Git
// ---------------------------------------------------------------------------

/**
 * Determine the creation time of a file.
 * 1. `git log --follow --diff-filter=A --format=%aI` (oldest commit).
 * 2. Fallback: filesystem birthtime > ctime > mtime.
 */
function getCreationTime(filePath, repoRoot) {
  const relPath = path.relative(repoRoot, filePath);

  try {
    const output = execSync(
      `git log --follow --diff-filter=A --format=%aI -- "${relPath}"`,
      { cwd: repoRoot, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    ).trim();

    if (output) {
      const lines = output.split('\n').filter(Boolean);
      // The oldest commit (file creation) is the last line.
      const dateStr = lines[lines.length - 1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
    }
  } catch {
    // git failed — fall through to filesystem stats
  }

  try {
    const stats = fs.statSync(filePath);
    return stats.birthtime || stats.ctime || stats.mtime;
  } catch {
    return new Date();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFileUtf8(fp) {
  return fs.readFileSync(fp, 'utf-8');
}

function writeFileUtf8(fp, data) {
  fs.writeFileSync(fp, data, 'utf-8');
}

// ---------------------------------------------------------------------------
// 4. Generate timeline.md
// ---------------------------------------------------------------------------

/**
 * Build the content of docs/timeline.md.
 *
 * Entries are grouped by YYYY-MM (most recent first) and within each month
 * sorted by creation date descending.
 */
function generateTimeline(entries, docsDir) {
  const timelinePath = path.join(docsDir, 'timeline.md');

  // Group by YYYY-MM
  /** @type {Map<string, Array<{ title: string; path: string; date: Date }>>} */
  const groups = new Map();

  for (const entry of entries) {
    const d = entry.date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  // Sort group keys descending (most recent month first)
  const sortedGroupKeys = [...groups.keys()].sort().reverse();

  // Within each group, sort entries descending by date
  for (const [, list] of groups) {
    list.sort((a, b) => b.date - a.date);
  }

  const timelineDir = path.dirname(timelinePath);
  const lines = [];

  lines.push('# 文档时间线\n');
  lines.push('> 按 Git 首次加入时间排序，最近创建的文档在前。\n');

  for (const groupKey of sortedGroupKeys) {
    lines.push(`## ${groupKey}\n`);
    for (const entry of groups.get(groupKey)) {
      let relPath = path.relative(timelineDir, entry.path).split(path.sep).join('/');
      if (relPath.endsWith('/index.html')) {
        relPath = relPath.slice(0, -'index.html'.length);
      }
      const formatTag = path.extname(entry.path).toLowerCase() === '.html' ? ' `HTML`' : '';
      lines.push(`- [${entry.title}](${relPath})${formatTag}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 5. Update docs/index.md
// ---------------------------------------------------------------------------

/**
 * Update docs/index.md in-place:
 * - Remove "（草稿）" from the "Top 20 AI 开源项目 — 2026 年 4 月" entry.
 * - Fix the link if it references the .draft.md variant.
 * - Insert a timeline link into the intro.
 */
function updateIndex(docsDir) {
  const indexPath = path.join(docsDir, 'index.md');
  let content = readFileUtf8(indexPath);

  // a) Strip "（草稿）" from the heading text
  const draftBreadcrumb = 'Top 20 AI 开源项目 — 2026 年 4 月（草稿）';
  const cleanBreadcrumb = 'Top 20 AI 开源项目 — 2026 年 4 月';
  content = content.replace(draftBreadcrumb, cleanBreadcrumb);

  // b) Fix the link: .draft.md → .md (the actual file on disk)
  content = content.replace(
    '[Top 20 AI 开源项目 — 2026 年 4 月](ai-monthly/2026-04_top20.draft.md)',
    '[Top 20 AI 开源项目 — 2026 年 4 月](ai-monthly/2026-04_top20.md)'
  );

  // c) Keep standalone HTML links at their clean directory URLs.
  content = content
    .replace('](agent-design-patterns/index.html)', '](agent-design-patterns/)')
    .replace('](claude-code-harness-engineering/index.html)', '](claude-code-harness-engineering/)');

  content = content
    .replace(
      '[Agent 设计模式互动教学稿](agent-design-patterns/) —',
      '[Agent 设计模式互动教学稿](agent-design-patterns/) `HTML` —'
    )
    .replace(
      '[Claude Code 实战：Harness 工程之道教学扩展稿](claude-code-harness-engineering/) —',
      '[Claude Code 实战：Harness 工程之道教学扩展稿](claude-code-harness-engineering/) `HTML` —'
    );

  // d) Add timeline link — append to the intro sentence (exact match)
  const introEnd = '再按需查阅完整参考和对比分析。';
  if (content.includes(introEnd)) {
    content = content.replace(
      introEnd + '\n\n## 工具操作指南',
      introEnd + ' 按时间浏览：[文档创建时间线](timeline.md)\n\n## 工具操作指南'
    );
  }

  writeFileUtf8(indexPath, content);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('🔍 Scanning docs directory...');

  const allFiles = walkDocs(DOCS_DIR);

  console.log(`   Found ${allFiles.length} files (.md + .html)`);

  /** @type {Array<{ title: string; path: string; date: Date }>} */
  const entries = [];

  for (const filePath of allFiles) {
    // Exclude timeline.md from its own timeline (but keep other .md files)
    const rel = path.relative(DOCS_DIR, filePath);
    if (rel === 'timeline.md' || rel === 'index.md') continue; // don't list index in timeline either? No, requirement says don't list timeline.md. I'll also skip index.md for cleanliness.

    const title = extractTitle(filePath);
    const date = getCreationTime(filePath, ROOT);

    entries.push({ title, path: filePath, date });

    const dateLabel = date.toISOString().slice(0, 10);
    console.log(`   ${dateLabel}  ${title}`);
  }

  // Generate timeline.md
  console.log('\n📄 Writing docs/timeline.md...');
  const timelineContent = generateTimeline(entries, DOCS_DIR);
  writeFileUtf8(path.join(DOCS_DIR, 'timeline.md'), timelineContent);
  console.log('   Done.');

  // Update docs/index.md
  console.log('\n📄 Updating docs/index.md...');
  updateIndex(DOCS_DIR);
  console.log('   Done.');

  console.log('\n✅ All done.');
}

main();
