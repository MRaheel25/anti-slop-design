#!/usr/bin/env node
/**
 * anti-slop-design-mcp — free, research-first, anti-AI-slop design reference MCP server.
 *
 * Based ONLY on the research report at
 * ~/workspace/research_notes/anti-slop-design-research-20261122-1420/report.md
 * (research date 2026-11-22) and the live artifact `anti-slop-design-research`.
 *
 * - stdio by default (no port, no auth, nothing to deploy).
 * - Streamable HTTP as an optional mode: `node dist/server.js --http`
 *   (or MCP_TRANSPORT=http), PORT env, default 3000, endpoint /mcp.
 * - No paid dependencies, no API keys required. Keyless sources first
 *   (Iconify, Openverse, Wikimedia, Google Fonts); Pexels/Unsplash only when
 *   the user supplies their own free key via env var.
 * - Local corpus only: text principles, tokens and patterns written in our own
 *   words. No scraped screenshots, no paywalled content, no copied layouts,
 *   logos, photos or copy. Every result names its source + licence.
 * - Logs only to stderr on stdio (stdout is the protocol).
 */
import { createServer as createHttpServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const VERSION = "0.1.0";
const RESEARCH_DATE = "2026-11-22";

function log(...args: unknown[]): void {
  // stderr only — stdout belongs to the MCP protocol on stdio.
  console.error("[anti-slop-design]", ...args);
}

/* ------------------------------------------------------------------ */
/* Corpus loading                                                      */
/* ------------------------------------------------------------------ */

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_CANDIDATES = [
  process.env.ANTI_SLOP_DATA_DIR,
  join(HERE, "..", "data"),
  join(HERE, "..", "..", "data"),
  join(process.cwd(), "data"),
].filter(Boolean) as string[];

function findDataDir(): string {
  for (const dir of DATA_CANDIDATES) {
    if (existsSync(join(dir, "meta.json"))) return dir;
  }
  throw new Error(
    `Corpus data directory not found. Looked in: ${DATA_CANDIDATES.join(", ")}. ` +
      `Set ANTI_SLOP_DATA_DIR to the data/ folder.`,
  );
}

const DATA_DIR = findDataDir();

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, name), "utf8")) as T;
}

function loadText(rel: string, fallback: string): string {
  const p = join(DATA_DIR, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : fallback;
}

interface Meta { version: string; corpus_version: string; research_date: string; corpus_freshness_date: string; name: string; description: string; licence: string; honesty_note: string; copyright_rule: string; sources: { name: string; url: string; note: string }[]; free_galleries_to_link_out: { name: string; url: string; note: string }[] }
interface BannedRule { id: string; pattern: string; severity: string; why: string }
interface BannedList { version: string; reminder: string; two_order_test: string; source_note: string; categories: { id: string; name: string; rules: BannedRule[] }[] }
interface Principle { id: string; principle: string; mechanism: string; source: string; type?: string }
interface Principles { principles: Principle[]; types: Record<string, Principle[]>; source_note: string }
interface Direction { id: string; name: string; feel: string; hero: string; layout: string; motion: string; palette: string[]; type: { display: string; body: string; reason: string }; best_for: string[]; avoid: string }
interface Reference { id: string; title?: string; niche: string; design_types: string[]; principle: string; pattern: string; why_it_works: string; source_name: string; url: string; licence: string; not_to_copy: string }
interface Designer { name: string; role: string; known_for: string; url: string }
interface Intake { universal: { id: string; question: string; required: boolean }[]; types: Record<string, { title: string; questions: { id: string; question: string; required: boolean }[] }> }
interface DesignSystem { id: string; name: string; colours: Record<string, string>; type: { display: string; body: string; reason: string }; spacing: string; radius: string; components: Record<string, string>; do: string[]; dont: string[] }
interface FontEntry { family: string; category: string; feel: string; best_for: string[]; licence: string; load: string; warning?: string }

const META = loadJson<Meta>("meta.json");
const BANNED = loadJson<BannedList>("banned-list.json");
const PRINCIPLES = loadJson<Principles>("principles.json");
const DIRECTIONS = loadJson<{ directions: Direction[]; note: string; source: string }>("directions.json").directions;
const REFERENCES = loadJson<{ entries: Reference[] }>("references.json").entries;
const DESIGNERS = loadJson<{ niches: Record<string, Designer[]>; note: string; source: string }>("designers.json").niches;
const INTAKE = loadJson<Intake>("intake.json");
const SYSTEMS = loadJson<{ systems: DesignSystem[]; note: string }>("design-systems.json").systems;
const FONTS = loadJson<{ fonts: FontEntry[]; note: string }>("fonts.json").fonts;

const TYPES = ["logo", "brand", "social", "ad", "web", "ui"] as const;
type DesignType = (typeof TYPES)[number];

const TYPE_ALIASES: Record<string, DesignType> = {
  logo: "logo", logotype: "logo", mark: "logo",
  brand: "brand", branding: "brand", graphic: "brand", graphics: "brand", identity: "brand",
  social: "social", instagram: "social", post: "social", carousel: "social",
  ad: "ad", ads: "ad", advertising: "ad", creative: "ad",
  web: "web", website: "web", landing: "web", "landing-page": "web", site: "web",
  ui: "ui", app: "ui", ux: "ui", interface: "ui", dashboard: "ui", mobile: "ui",
};

function normalizeType(raw?: string): DesignType | undefined {
  if (!raw) return undefined;
  const key = raw.trim().toLowerCase();
  return TYPE_ALIASES[key];
}

function allBannedRules(): BannedRule[] {
  return BANNED.categories.flatMap((c) => c.rules.map((r) => ({ ...r, category: c.name }) as BannedRule & { category: string }));
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function tokens(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9+#-]+/).filter((t) => t.length > 1);
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function footer(): string {
  return `\n\n---\nSource: local anti-slop-design corpus v${META.corpus_version} (research ${META.research_date}). ${META.copyright_rule}`;
}

function noResult(what: string, available: string[]): string {
  return (
    `No result found for ${what}.\n\n` +
    `This server does not invent results. What does exist:\n` +
    available.map((a) => `- ${a}`).join("\n") +
    `\n\nFree galleries to check live (link out, do not scrape):\n` +
    META.free_galleries_to_link_out.map((g) => `- ${g.name} — ${g.url} (${g.note})`).join("\n") +
    footer()
  );
}

/* ------------------------------------------------------------------ */
/* Keyless HTTP with cache + rate limit (never invents results)        */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();
const callLog = new Map<string, number[]>(); // host -> timestamps of calls
const RATE_LIMIT_PER_MIN = 10;

function rateLimited(host: string): boolean {
  const now = Date.now();
  const calls = (callLog.get(host) ?? []).filter((t) => now - t < 60_000);
  callLog.set(host, calls);
  if (calls.length >= RATE_LIMIT_PER_MIN) return true;
  calls.push(now);
  return false;
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const host = new URL(url).host;
  if (rateLimited(host)) throw new Error(`Rate limit reached for ${host} (${RATE_LIMIT_PER_MIN}/min). Try again shortly.`);
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `anti-slop-design-mcp/${VERSION} (free, keyless)`, Accept: "application/json", ...headers },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${host}`);
    const value: unknown = await res.json();
    cache.set(url, { at: Date.now(), value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string): Promise<string> {
  const host = new URL(url).host;
  if (rateLimited(host)) throw new Error(`Rate limit reached for ${host} (${RATE_LIMIT_PER_MIN}/min). Try again shortly.`);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `anti-slop-design-mcp/${VERSION} (free, keyless)` },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${host}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Deterministic audit engine (pattern scan, never a vibe score)       */
/* ------------------------------------------------------------------ */

interface AuditCheck { id: string; name: string; severity: "fail" | "warning"; passed: boolean; detail: string }

function hexLuminance(hex: string): number {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = hexLuminance(fg);
  const l2 = hexLuminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function auditHtml(html: string, designType?: string): { checks: AuditCheck[]; score50: number; verdict: string } {
  const checks: AuditCheck[] = [];
  const add = (id: string, name: string, severity: "fail" | "warning", passed: boolean, detail: string) =>
    checks.push({ id, name, severity, passed, detail });

  const lower = html.toLowerCase();
  const hasGradient = /linear-gradient|radial-gradient|conic-gradient/.test(lower);
  const hasPurple = /purple|violet|magenta|#8b5cf6|#a855f7|#6366f1|#7c3aed|#9333ea|#6d28d9/.test(lower);
  add("A01", "Purple-to-blue gradient (C01)", "fail", !(hasGradient && hasPurple),
    hasGradient && hasPurple ? "A gradient and a purple/violet/magenta tone are both present. Remove the gradient; commit to a solid palette with roles." : "No purple gradient found.");
  add("A02", "Gradient text (C03)", "fail", !/background-clip\s*:\s*text/.test(lower),
    /background-clip\s*:\s*text/.test(lower) ? "Gradient text found (background-clip: text). Use solid colour text only." : "No gradient text found.");
  add("A03", "Neon glow (C02)", "fail", !/(text-shadow|box-shadow)\s*:[^;}]*0\s+0\s+([2-9]\d|[1-9]\d\d)/.test(lower),
    /(text-shadow|box-shadow)\s*:[^;}]*0\s+0\s+([2-9]\d|[1-9]\d\d)/.test(lower) ? "A large-blur glow shadow was found. Remove it; colour belongs in whole fields, not glows." : "No neon glow shadow found.");
  const fontFamilies = [...html.matchAll(/font-family\s*:\s*([^;}]+)/gi)].map((m) => m[1]);
  const joinedFonts = fontFamilies.join(" ").toLowerCase();
  const defaultFonts = ["inter", "roboto", "arial", "open sans"].filter((f) => joinedFonts.includes(f));
  const distinctive = ["fraunces", "space grotesk", "archivo", "newsreader", "libre caslon", "plex", "manrope", "sora", "bricolage", "instrument serif", "playfair", "lora", "garamond", "jetbrains"].some((f) => joinedFonts.includes(f));
  add("A04", "Default font used with no stated reason (T01)", defaultFonts.length > 0 && !distinctive ? "fail" : "warning",
    defaultFonts.length === 0 || distinctive,
    defaultFonts.length > 0 ? `Default font(s) found: ${defaultFonts.join(", ")}${distinctive ? " — but a distinctive pairing is also present, so state the reason for the default." : " with no distinctive pairing. Choose a pairing for the subject and state why."}` : "No default-only font stack found.");
  add("A05", "Pure black #000 / pure white #fff (C05)", "fail", !/(?<![0-9a-f])#(?:000|fff|000000|ffffff)\b/.test(lower),
    /(?<![0-9a-f])#(?:000|fff|000000|ffffff)\b/.test(lower) ? "Pure #000 or #fff found. Tint neutrals toward the brand hue." : "No pure #000/#fff found.");
  add("A06", "Lorem ipsum placeholder (N01)", "fail", !/lorem ipsum/i.test(html),
    /lorem ipsum/i.test(html) ? "Lorem ipsum found. Replace with real copy, or mark a proof gap." : "No lorem ipsum found.");
  const trusted = /trusted by\s+[\d,]+\+?/i.test(html) || /10,?000\+?\s*(teams|users|customers|companies)/i.test(html);
  add("A07", "Invented stats / testimonials (N02)", "fail", !trusted,
    trusted ? "An unverified 'Trusted by 10,000+' style claim was found. Every number must trace to intake or research." : "No invented-stat pattern found.");
  add("A08", "\"Not just X, it's Y\" copy (W01)", "fail", !/not just [^,.;]{1,60},?\s*(it'?s|it is)/i.test(html) && !/not only [^,.;]{1,60} but/i.test(html),
    /not just [^,.;]{1,60},?\s*(it'?s|it is)/i.test(html) ? "A 'not just X, it's Y' construction was found. Say what it is, directly." : "No negative-parallelism pattern found.");
  const cardCount = (html.match(/class="[^"]*\bcard\b[^"]*"/gi) ?? []).length;
  const centredHero = /text-center|text-align\s*:\s*center/.test(html.slice(0, 3000).toLowerCase());
  add("A09", "Centred hero + 3 identical cards (L01)", "fail", !(cardCount >= 3 && centredHero),
    cardCount >= 3 && centredHero ? `${cardCount} card elements and a centred hero were found. Vary section compositions; design from the subject.` : `${cardCount} card element(s) found; no centred-hero + 3-card pattern.`);
  const eyebrowCount = (html.match(/eyebrow/gi) ?? []).length;
  add("A10", "ALL-CAPS eyebrow overuse (L04)", "fail", eyebrowCount <= 1,
    eyebrowCount > 1 ? `${eyebrowCount} eyebrow markers found. Ration ornaments: at most 1 eyebrow per 3 sections.` : `${eyebrowCount} eyebrow marker(s) found.`);
  add("A11", "Single accented word in a headline (T04)", "fail", !/<h1[^>]*>[\s\S]{0,400}<span[^>]*>/i.test(html),
    /<h1[^>]*>[\s\S]{0,400}<span[^>]*>/i.test(html) ? "A <span> inside the H1 suggests a single accented word. If one word needs colour to be interesting, the headline is weak." : "No accented-word span inside the H1 found.");
  const dashCount = (html.match(/—/g) ?? []).length;
  const dashDensity = dashCount / Math.max(1, html.length / 1000);
  add("A12", "Em-dash overuse (W03)", "warning", dashDensity <= 3,
    `${dashCount} em dash(es) in ~${Math.round(html.length / 1000)}k characters (${dashDensity.toFixed(1)} per 1k chars). Keep to at most 1 per passage.`);
  add("A13", "Fake form with no destination (N03)", "fail", !/<form(?![^>]*action=)/i.test(html),
    /<form(?![^>]*action=)/i.test(html) ? "A <form> without an action was found. A form destination must be real." : "No fake form found.");
  add("A14", "h-screen hero that overflows on mobile (L06)", "fail", !/\bh-screen\b/.test(html),
    /\bh-screen\b/.test(html) ? "h-screen found. Use min-h-100dvh so the hero fits its screen with CTAs visible." : "No h-screen found.");
  add("A15", "Grey text on colour (C06)", "warning", !/color\s*:\s*#(888|999|aaa|bbb)\b/i.test(lower),
    /color\s*:\s*#(888|999|aaa|bbb)\b/i.test(lower) ? "Grey text (#888/#999/#aaa) found. Use a shade of the background colour instead." : "No grey-on-colour text found.");
  // A16: contrast spot-check on inline style color/background-color pairs.
  const stylePairs = [...html.matchAll(/style="[^"]*color\s*:\s*(#[0-9a-f]{3,6})[^"]*background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})[^"]*"/gi)];
  const stylePairs2 = [...html.matchAll(/style="[^"]*background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})[^"]*color\s*:\s*(#[0-9a-f]{3,6})[^"]*"/gi)];
  const pairs: [string, string][] = [
    ...stylePairs.map((m) => [m[1], m[2]] as [string, string]),
    ...stylePairs2.map((m) => [m[2], m[1]] as [string, string]),
  ];
  const badPairs = pairs.filter(([fg, bg]) => contrastRatio(fg, bg) < 4.5);
  add("A16", "Contrast spot-check (AA 4.5:1, inline styles)", "fail", badPairs.length === 0,
    pairs.length === 0 ? "No inline color/background pairs found to check — verify contrast in a real browser (AA 4.5:1 text, 3:1 large)." : badPairs.length > 0 ? `${badPairs.length} of ${pairs.length} inline colour pair(s) fail AA 4.5:1: ${badPairs.map(([fg, bg]) => `${fg} on ${bg} (${contrastRatio(fg, bg).toFixed(2)}:1)`).join("; ")}` : `All ${pairs.length} inline colour pair(s) pass AA 4.5:1.`);
  add("A17", "Inflated language: serves as / stands as / boasts (W04)", "warning", !/\bserves as\b|\bstands as\b|\bboasts\b/i.test(html),
    /\bserves as\b|\bstands as\b|\bboasts\b/i.test(html) ? "Inflated phrasing found ('serves as' / 'stands as' / 'boasts'). Use is/has with a real subject." : "No inflated-language pattern found.");

  const points = checks.reduce((sum, c) => sum + (c.passed ? 1 : c.severity === "warning" ? 0.5 : 0), 0);
  const score50 = Math.round((50 * points) / checks.length);
  const verdict = score50 >= 35
    ? `PASS (${score50}/50) — deterministic checks only. Still run the Gate B judgment checklist (one idea, named references, two-order test, fresh eyes) before shipping.`
    : `REWRITE — DO NOT SHIP (${score50}/50, below the 35/50 bar). Fix the failed checks above, then re-audit.`;
  void designType; // reserved: per-type rules are the same deterministic set for v0.1.0
  return { checks, score50, verdict };
}

/* ------------------------------------------------------------------ */
/* Tool implementations                                                */
/* ------------------------------------------------------------------ */

function searchReferencesText(query: string, designType?: string, niche?: string, limit = 5): string {
  const q = tokens(`${query} ${niche ?? ""} ${designType ?? ""}`);
  const type = normalizeType(designType);
  const scored = REFERENCES.map((ref) => {
    let score = 0;
    const hay = `${ref.niche} ${ref.design_types.join(" ")} ${ref.principle} ${ref.pattern} ${ref.source_name} ${ref.id}`.toLowerCase();
    for (const t of q) if (hay.includes(t)) score += 1;
    if (type && ref.design_types.includes(type)) score += 2;
    if (niche && ref.niche.toLowerCase().includes(niche.toLowerCase())) score += 2;
    if (query && ref.niche.toLowerCase() === query.toLowerCase()) score += 2;
    return { ref, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, Math.min(Math.max(limit, 1), 10));

  if (scored.length === 0) {
    return noResult(`references for "${query}"${designType ? ` (${designType})` : ""}${niche ? ` in niche "${niche}"` : ""}`, [
      ...TYPES.map((t) => `design_type: ${t}`),
      `niches in this corpus: ${[...new Set(REFERENCES.map((r) => r.niche))].join(", ")}`,
      `12 directions via get_design_principles (ask for a direction deal instead of a single look)`,
    ]);
  }
  const lines = scored.map(({ ref, score }, i) => {
    return [
      `${i + 1}. ${ref.source_name} — relevance ${score}`,
      `   Niche: ${ref.niche} | Types: ${ref.design_types.join(", ")}`,
      `   Principle: ${ref.principle}`,
      `   Pattern: ${ref.pattern}`,
      `   Why it works: ${ref.why_it_works}`,
      `   Do NOT copy: ${ref.not_to_copy}`,
      `   Source: ${ref.url} — Licence: ${ref.licence}`,
    ].join("\n");
  });
  return (
    `Top ${scored.length} reference(s) for "${query}"${type ? ` (${type})` : ""}${niche ? ` in ${niche}` : ""} — principles, not pictures. Take the principle, never the layout, copy, logo or imagery.\n\n` +
    lines.join("\n\n") +
    `\n\nFree galleries to check live for more, in this order: Awwwards Sites of the Day (jury list), SiteInspire, One Page Love, Design Details, Recent, Mobbin free tier. Search templates: site:awwwards.com [niche], "[niche] landing page design awwwards 2026", "[niche] brand identity behance case study".` +
    footer()
  );
}

function topDesignersText(niche: string, limit = 5): string {
  const key = niche.trim().toLowerCase();
  const alias: Record<string, string> = { branding: "brand", graphic: "brand", identity: "brand", advertising: "ad", ads: "ad", landing: "web", website: "web", app: "ui", ux: "ui", socialmedia: "social", instagram: "social" };
  const resolved = DESIGNERS[key] ? key : alias[key];
  if (!resolved || !DESIGNERS[resolved]) {
    return noResult(`designers in niche "${niche}"`, [
      ...Object.keys(DESIGNERS).map((n) => `niche: ${n} (${DESIGNERS[n].length} named studios/designers)`),
      `Also search live: "best [niche] designers" site:awwwards.com, "[niche] designer" behance, Awwwards jury + conference speaker lists.`,
    ]);
  }
  const list = DESIGNERS[resolved].slice(0, Math.min(Math.max(limit, 1), 10));
  const lines = list.map((d, i) => `${i + 1}. ${d.name} — ${d.role}\n   Known for: ${d.known_for}\n   Portfolio: ${d.url}`);
  return (
    `Top designers / studios for "${resolved}" (curated from public portfolios and award listings — verify a URL before citing it in client work; studios rebrand and merge):\n\n` +
    lines.join("\n\n") +
    `\n\nHow to use this list: pick 2-3, read their case studies for the reasoning (not the thumbnails), and extract one principle per studio. Then search the live award lists for current winners in this niche: Awwwards Sites of the Day, FWA, CSS Design Awards.` +
    footer()
  );
}

function designPrinciplesText(designType?: string, niche?: string): string {
  const type = normalizeType(designType);
  const banned = allBannedRules();
  const bannedText = BANNED.categories.map((c) => `**${c.name}**\n${c.rules.map((r) => `- ${r.id} [${r.severity}] ${r.pattern} — ${r.why}`).join("\n")}`).join("\n\n");
  const universal = PRINCIPLES.principles.map((p) => `- ${p.id} ${p.principle} (${p.mechanism}) [${p.source}]`).join("\n");
  const perType = type && PRINCIPLES.types[type]
    ? `\n\n## Principles for ${type}${niche ? ` in ${niche}` : ""}\n${PRINCIPLES.types[type].map((p) => `- ${p.id} ${p.principle} (${p.mechanism}) [${p.source}]`).join("\n")}`
    : `\n\nNo design_type was given, so only the universal principles are listed. Call again with design_type (logo, brand, social, ad, web, ui) for per-type principles.`;
  const directions = DIRECTIONS.filter((d) => !type || d.best_for.includes(type)).slice(0, 4);
  const dirText = directions.length > 0
    ? `\n\n## Directions that fit${type ? ` ${type}` : ""} (deal 3, pick 1 — do not invent a look)\n${directions.map((d) => `- ${d.name}: ${d.feel} Palette: ${d.palette.join(", ")}. Type: ${d.type.display} / ${d.type.body}. Best for: ${d.best_for.join(", ")}.`).join("\n")}`
    : "";
  return (
    `# Design principles${type ? ` — ${type}` : ""}${niche ? ` — ${niche}` : ""}\n\n${BANNED.reminder}\n\n## Positive principles (universal)\n${universal}${perType}${dirText}\n\n## Banned list (full — ${banned.length} rules)\n${bannedText}\n\n## Two-order test\n${BANNED.two_order_test}` +
    footer()
  );
}

function designSystemText(brandOrReference: string): string {
  const q = brandOrReference.trim().toLowerCase();
  const qTokens = tokens(q);
  const scored = SYSTEMS.map((s) => {
    const hay = `${s.id} ${s.name} ${s.type.display} ${s.type.body} ${s.colours.accent}`.toLowerCase();
    let score = 0;
    for (const t of qTokens) if (hay.includes(t)) score += 1;
    if (s.id === q || s.name.toLowerCase() === q) score += 5;
    return { s, score };
  }).sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score === 0) {
    return noResult(`a design system for "${brandOrReference}"`, [
      ...SYSTEMS.map((s) => `${s.id} — ${s.name} (colours ${Object.values(s.colours).slice(0, 3).join(", ")}…) — call get_design_system with one of these names`),
      `Note: this server does not copy any real brand's system. It returns original token sets, or the closest feel — never a brand's official tokens.`,
    ]);
  }
  const s = best.s;
  const dir = DIRECTIONS.find((d) => d.id === s.id);
  return (
    `# DESIGN.md — ${s.name}\n\n> Original token set written for this corpus. Inspired by public design-system patterns, not copied from any brand. If you adapt a real brand's system, write your own analysis and attribute the source.\n> Matched from "${brandOrReference}" by keyword (score ${best.score}).\n\n## 1. Colours\n${Object.entries(s.colours).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n## 2. Typography\n- Display: ${s.type.display}\n- Body: ${s.type.body}\n- Reason: ${s.type.reason}\n\n## 3. Spacing\n${s.spacing}\n\n## 4. Radius\n${s.radius}\n\n## 5. Components\n${Object.entries(s.components).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n## 6. Do\n${s.do.map((d) => `- ${d}`).join("\n")}\n\n## 7. Don't\n${s.dont.map((d) => `- ${d}`).join("\n")}\n\n## 8. Direction\n${dir ? `${dir.name}: ${dir.feel}\nHero: ${dir.hero}\nLayout: ${dir.layout}\nMotion: ${dir.motion}\nWatch out: ${dir.avoid}` : "See get_design_principles for matching directions."}\n\n## 9. Licence and honesty\nAll tokens are original to this corpus. Fonts are Google Fonts (OFL). Check the banned list before building: no purple gradients, no default-only fonts, no invented content.` +
    footer()
  );
}

async function getAssetsText(query: string, kind: string): Promise<string> {
  const k = (kind || "photo").toLowerCase();
  const sections: string[] = [];
  const failures: string[] = [];

  if (k === "font" || k === "all") {
    const q = tokens(query);
    const matched = FONTS.filter((f) => {
      const hay = `${f.family} ${f.category} ${f.feel} ${f.best_for.join(" ")}`.toLowerCase();
      return q.length === 0 || q.some((t) => hay.includes(t));
    }).slice(0, 8);
    if (matched.length === 0) {
      sections.push(`Fonts: no match for "${query}" in the local Google Fonts list. Available families: ${FONTS.map((f) => f.family).join(", ")}.`);
    } else {
      sections.push(`Fonts (Google Fonts, OFL, keyless to load):\n${matched.map((f) => `- ${f.family} (${f.category}) — ${f.feel}. Best for: ${f.best_for.join(", ")}. Load: ${f.load}${f.warning ? ` WARNING: ${f.warning}` : ""}`).join("\n")}`);
    }
  }

  if (k === "icon" || k === "all") {
    try {
      const data = await fetchJson(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=8`) as { icons?: string[] };
      const icons = data.icons ?? [];
      sections.push(icons.length === 0
        ? `Icons (Iconify, keyless): no icons found for "${query}". Try a broader word, or browse https://iconify.design — check each icon set's licence before shipping.`
        : `Icons (Iconify API, keyless — check each set's licence before shipping):\n${icons.map((name) => `- ${name} — https://api.iconify.design/${name.split(":")[0]}.svg?color=currentColor (set: ${name.split(":")[0]})`).join("\n")}`);
    } catch (e) {
      failures.push(`Iconify search failed: ${e instanceof Error ? e.message : String(e)}. Open https://iconify.design and search "${query}" manually.`);
    }
  }

  if (k === "photo" || k === "all") {
    try {
      const data = await fetchJson(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5&license_type=commercial`) as { results?: { title?: string; url?: string; foreign_landing_url?: string; license?: string; creator?: string }[] };
      const results = data.results ?? [];
      sections.push(results.length === 0
        ? `Photos (Openverse, keyless, openly licensed): no openly licensed photos found for "${query}". Try Wikimedia Commons or a broader word.`
        : `Photos (Openverse API, keyless — licence returned per result, check it before use):\n${results.map((r) => `- ${r.title || "Untitled"} — ${r.url} (landing page: ${r.foreign_landing_url || "n/a"}; licence: ${r.license || "unknown"}; creator: ${r.creator || "unknown"})`).join("\n")}`);
    } catch (e) {
      failures.push(`Openverse search failed: ${e instanceof Error ? e.message : String(e)}. Try Wikimedia Commons: https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(query)}`);
    }
    try {
      const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}%20filetype:bitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=800`) as { query?: { pages?: Record<string, { title?: string; imageinfo?: { url?: string; extmetadata?: { LicenseShortName?: { value?: string } } }[] }> } };
      const pages = Object.values(data.query?.pages ?? {});
      if (pages.length > 0) {
        sections.push(`Photos (Wikimedia Commons, keyless — licence per result):\n${pages.map((p) => `- ${p.title} — ${p.imageinfo?.[0]?.url ?? "no direct URL"} (licence: ${p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value ?? "check the file page"})`).join("\n")}`);
      }
    } catch (e) {
      failures.push(`Wikimedia Commons search failed: ${e instanceof Error ? e.message : String(e)}.`);
    }
    // Optional free-key providers: only called when the user supplied their own key.
    if (process.env.PEXELS_API_KEY) {
      try {
        const data = await fetchJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, { Authorization: process.env.PEXELS_API_KEY }) as { photos?: { photographer?: string; url?: string; src?: { large?: string } }[] };
        const photos = data.photos ?? [];
        sections.push(`Photos (Pexels, your own free key — 200 req/hr, 20k/mo):\n${photos.map((p) => `- ${p.url} (photographer: ${p.photographer || "unknown"}; file: ${p.src?.large || "n/a"})`).join("\n") || "No results."}`);
      } catch (e) {
        failures.push(`Pexels search failed: ${e instanceof Error ? e.message : String(e)}.`);
      }
    } else {
      sections.push(`Pexels: not configured. It is free (200 req/hr, 20k/mo) with your own key — set PEXELS_API_KEY and restart the server. Sign up free at https://www.pexels.com/api/ — no key is ever sent anywhere unless you set it.`);
    }
    if (process.env.UNSPLASH_ACCESS_KEY) {
      try {
        const data = await fetchJson(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5`, { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }) as { results?: { user?: { name?: string }; links?: { html?: string }; urls?: { regular?: string } }[] };
        const results = data.results ?? [];
        sections.push(`Photos (Unsplash, your own free key — 50 req/hr demo):\n${results.map((r) => `- ${r.links?.html} (by ${r.user?.name || "unknown"}; file: ${r.urls?.regular || "n/a"})`).join("\n") || "No results."}`);
      } catch (e) {
        failures.push(`Unsplash search failed: ${e instanceof Error ? e.message : String(e)}.`);
      }
    } else {
      sections.push(`Unsplash: not configured. Demo tier is free (50 req/hr) with your own key — set UNSPLASH_ACCESS_KEY and restart the server. Sign up free at https://unsplash.com/developers — no key is ever sent anywhere unless you set it.`);
    }
  }

  if (k !== "photo" && k !== "icon" && k !== "font" && k !== "all") {
    return noResult(`assets of kind "${kind}"`, ["kind: photo (Openverse, Wikimedia, optional Pexels/Unsplash with your own free key)", "kind: icon (Iconify, keyless)", "kind: font (Google Fonts, OFL, keyless)", "kind: all"]);
  }
  const out = [`Assets for "${query}" (kind: ${k}) — keyless first. Check every licence before shipping.\n`, ...sections];
  if (failures.length > 0) out.push(`\nLive lookups that failed (results above are what actually returned — nothing was invented):\n${failures.map((f) => `- ${f}`).join("\n")}`);
  out.push(footer());
  return out.join("\n\n");
}

function corpusStatsText(): string {
  const counts = {
    banned_rules: allBannedRules().length,
    banned_categories: BANNED.categories.length,
    universal_principles: PRINCIPLES.principles.length,
    per_type_principles: Object.values(PRINCIPLES.types).flat().length,
    directions: DIRECTIONS.length,
    references: REFERENCES.length,
    designers: Object.values(DESIGNERS).flat().length,
    designer_niches: Object.keys(DESIGNERS).length,
    intake_questions: INTAKE.universal.length + Object.values(INTAKE.types).flatMap((t) => t.questions).length,
    design_systems: SYSTEMS.length,
    fonts: FONTS.length,
  };
  return (
    `# Corpus stats — measured from the library this server serves, not projections\n\n` +
    Object.entries(counts).map(([k, v]) => `- ${k}: ${v}`).join("\n") +
    `\n\n- Corpus version: ${META.corpus_version}\n- Research date: ${META.research_date} (freshness: ${META.corpus_freshness_date})\n- Licence: ${META.licence}\n- Data directory: ${DATA_DIR}\n\n## Sources\n${META.sources.map((s) => `- ${s.name} — ${s.url} (${s.note})`).join("\n")}\n\n## Honesty note\n${META.honesty_note}` +
    footer()
  );
}

/* ------------------------------------------------------------------ */
/* Resource text (generated from the corpus)                           */
/* ------------------------------------------------------------------ */

function principlesResource(type: string): string {
  return designPrinciplesText(type);
}

function intakeResource(type: string): string {
  const t = normalizeType(type);
  if (!t) {
    return noResult(`intake for type "${type}"`, TYPES.map((x) => `type: ${x} — ${INTAKE.types[x].title}`));
  }
  const spec = INTAKE.types[t];
  return (
    `# Intake — ${spec.title}\n\nAsk ALL of these in one message. Do not design with gaps: if the user cannot answer, record the gap as an explicit assumption and confirm it — never silently invent.\n\n## Universal (every type)\n${INTAKE.universal.map((q) => `- [${q.required ? "REQUIRED" : "optional"}] ${q.question}`).join("\n")}\n\n## ${spec.title}\n${spec.questions.map((q) => `- [${q.required ? "REQUIRED" : "optional"}] ${q.question}`).join("\n")}` +
    footer()
  );
}

function referencesResource(niche: string): string {
  return searchReferencesText(niche, undefined, niche, 10);
}

/* ------------------------------------------------------------------ */
/* Server factory                                                      */
/* ------------------------------------------------------------------ */

function createServer(): McpServer {
  const server = new McpServer(
    { name: "anti-slop-design", version: VERSION },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );

  server.registerTool("search_references", {
    title: "Search design references",
    description: "Search the local curated design-reference corpus (principles, patterns, shipped-product examples) by query, design type and niche. Returns ranked text digests: principle, pattern, why it works, source name + URL, licence note. Text only — no re-hosted images. Returns 'no result + what exists' instead of inventing.",
    inputSchema: {
      query: z.string().describe("What to search for, e.g. 'fintech onboarding', 'editorial landing page', 'playful social post'."),
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui."),
      niche: z.string().optional().describe("Niche, e.g. fintech, skincare, education, travel."),
      limit: z.number().int().min(1).max(10).optional().describe("Max results (default 5, max 10)."),
    },
  }, async ({ query, design_type, niche, limit }) => textResult(searchReferencesText(query, design_type, niche, limit ?? 5)));

  server.registerTool("get_top_designers", {
    title: "Get top designers",
    description: "Named designers, studios and agencies for a niche (logo, brand, social, ad, web, ui), with what each is known for and a portfolio URL. From the curated local corpus — verify URLs before citing in client work. Returns 'no result + what exists' for unknown niches.",
    inputSchema: {
      niche: z.string().describe("Niche: logo, brand, social, ad, web or ui (aliases accepted: branding, advertising, landing, app, ux)."),
      limit: z.number().int().min(1).max(10).optional().describe("Max results (default 5, max 10)."),
    },
  }, async ({ niche, limit }) => textResult(topDesignersText(niche, limit ?? 5)));

  server.registerTool("get_design_principles", {
    title: "Get design principles",
    description: "The banned list (all rules with IDs) plus positive principles — universal and per design type — with the 'intentionally not copied' reminder and matching directions. Use before designing anything.",
    inputSchema: {
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui."),
      niche: z.string().optional().describe("Niche, e.g. fintech, skincare, education."),
    },
  }, async ({ design_type, niche }) => textResult(designPrinciplesText(design_type, niche)));

  server.registerTool("get_design_system", {
    title: "Get design system",
    description: "A DESIGN.md-shaped token set (colours, type, spacing, radius, components, do/don't) for a named direction or reference, e.g. 'swiss industrial', 'warm workshop', 'quiet luxury'. Original token sets written for this corpus — never a real brand's copied system. Returns the available systems if the name does not match.",
    inputSchema: {
      brand_or_reference: z.string().describe("Direction or reference name, e.g. 'swiss industrial', 'night laboratory', 'editorial broadsheet'."),
    },
  }, async ({ brand_or_reference }) => textResult(designSystemText(brand_or_reference)));

  server.registerTool("get_assets", {
    title: "Get assets",
    description: "Find assets keyless-first: photos via Openverse and Wikimedia Commons (open licences, returned per result), icons via Iconify (keyless, check each set's licence), fonts via Google Fonts (OFL, keyless). Pexels/Unsplash are only used when the user supplies their own free key via PEXELS_API_KEY / UNSPLASH_ACCESS_KEY env vars. Live lookups are cached (10 min) and rate-limited (10/min per host); failures are reported honestly, never papered over with invented results.",
    inputSchema: {
      query: z.string().describe("What to find, e.g. 'coffee shop interior', 'arrow icon', 'editorial serif'."),
      kind: z.string().optional().describe("One of: photo, icon, font, all (default: photo)."),
    },
  }, async ({ query, kind }) => textResult(await getAssetsText(query, kind ?? "photo")));

  server.registerTool("audit_design", {
    title: "Audit design",
    description: "Deterministic audit of HTML (or a fetched URL) against the banned list: purple gradients, gradient text, neon glow, default-only fonts, pure #000/#fff, lorem ipsum, invented stats, 'not just X, it's Y', centred hero + 3 cards, eyebrow overuse, accented headline word, em-dash overuse, fake forms, h-screen, grey-on-colour text, contrast spot-checks, inflated language. Returns a pass/fail list and a score out of 50 (below 35/50 = rewrite, do not ship). Deterministic pattern scan only — never a vibe score.",
    inputSchema: {
      html_or_url: z.string().describe("Raw HTML/CSS/copy to audit, or an http(s) URL to fetch (8s timeout, 2MB max) and audit."),
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui (reserved for future per-type rules)."),
    },
  }, async ({ html_or_url, design_type }) => {
    let html = html_or_url;
    let fetchedFrom: string | undefined;
    if (/^https?:\/\//i.test(html_or_url.trim())) {
      try {
        const text = await fetchText(html_or_url.trim());
        html = text.slice(0, 2_000_000);
        fetchedFrom = html_or_url.trim();
      } catch (e) {
        return textResult(`Could not fetch ${html_or_url.trim()}: ${e instanceof Error ? e.message : String(e)}.\n\nPaste the raw HTML instead, or check the URL and try again. Nothing was audited — no invented result.` + footer());
      }
    }
    const { checks, score50, verdict } = auditHtml(html, design_type);
    const lines = checks.map((c) => `- [${c.passed ? "PASS" : c.severity === "warning" ? "WARN" : "FAIL"}] ${c.id} ${c.name} — ${c.detail}`);
    return textResult(
      `# Audit — deterministic pattern scan (not a taste judgment)\n\n${fetchedFrom ? `Fetched from: ${fetchedFrom}\n\n` : ""}Score: ${score50}/50\nVerdict: ${verdict}\n\n${lines.join("\n")}\n\nGate B (judgment — answer in writing before delivery): name the one idea from the subject; name the 1 primary + at most 1 secondary reference and the named dimension each supplied; list what was intentionally not copied; run the two-order test; do a fresh-eyes pass. Full checklist: design://rules/anti-slop and the QC checklist in data/qc-checklist.md.` + footer(),
    );
  });

  server.registerTool("corpus_stats", {
    title: "Corpus stats",
    description: "Counts measured from the library this server actually serves (banned rules, principles, directions, references, designers, intake questions, design systems, fonts), plus freshness date and source list. Not projections.",
    inputSchema: {},
  }, async () => textResult(corpusStatsText()));

  // Resources
  const rulesText = loadText("rules/anti-slop.md", designPrinciplesText());
  server.resource("anti-slop-rules", "design://rules/anti-slop", async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: rulesText }],
  }));
  server.resource("qc-checklist", "design://rules/qc-checklist", async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: loadText("qc-checklist.md", "QC checklist — see data/qc-checklist.md in the repo.") }],
  }));
  server.resource("principles-by-type", new ResourceTemplate("design://principles/{type}", {
    list: async () => ({ resources: TYPES.map((t) => ({ uri: `design://principles/${t}`, name: `Principles — ${t}`, mimeType: "text/markdown" })) }),
    complete: { type: (value: string) => TYPES.filter((t) => t.startsWith(value)) },
  }), async (uri, { type }) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: principlesResource(Array.isArray(type) ? type[0] : type) }],
  }));
  server.resource("intake-by-type", new ResourceTemplate("design://intake/{type}", {
    list: async () => ({ resources: TYPES.map((t) => ({ uri: `design://intake/${t}`, name: `Intake — ${t}`, mimeType: "text/markdown" })) }),
    complete: { type: (value: string) => TYPES.filter((t) => t.startsWith(value)) },
  }), async (uri, { type }) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: intakeResource(Array.isArray(type) ? type[0] : type) }],
  }));
  server.resource("references-by-niche", new ResourceTemplate("design://references/{niche}", {
    list: async () => ({
      resources: [...new Set(REFERENCES.map((r) => r.niche))].map((n) => ({ uri: `design://references/${n}`, name: `References — ${n}`, mimeType: "text/markdown" })),
    }),
    complete: { niche: (value: string) => [...new Set(REFERENCES.map((r) => r.niche))].filter((n) => n.startsWith(value)) },
  }), async (uri, { niche }) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: referencesResource(Array.isArray(niche) ? niche[0] : niche) }],
  }));

  // Prompts
  server.registerPrompt("brief", {
    title: "Run the intake brief",
    description: "Ask all intake questions for a design type before any research or design.",
    argsSchema: {
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui."),
      brief: z.string().optional().describe("Whatever the user said so far, even if vague."),
    },
  }, async ({ design_type, brief }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: `Run the intake gate for a ${design_type ?? "design"} brief. The user said so far: ${brief ?? "(nothing yet)"}.\n\nAsk ALL intake questions for this type in ONE message — universal questions plus the per-type questions (read design://intake/${normalizeType(design_type) ?? "web"}). Do not design with gaps: if the user cannot answer something, record it as an explicit assumption to confirm — never silently invent. Do not start researching or designing until the intake is complete or explicitly waived.` },
    }],
  }));
  server.registerPrompt("research", {
    title: "Research-first pass",
    description: "Research top designs and designers for the niche before designing, and extract principles — never copies.",
    argsSchema: {
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui."),
      niche: z.string().optional().describe("Niche, e.g. fintech, skincare, education."),
      brief: z.string().optional().describe("The brief, after intake."),
    },
  }, async ({ design_type, niche, brief }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: `Run the research-first pass for a ${design_type ?? "design"} brief in the niche "${niche ?? "general"}". Brief: ${brief ?? "(see intake)"}.\n\n1. Use search_references and get_top_designers for this niche and type. 2. Also check the free galleries live in this order: Awwwards Sites of the Day, SiteInspire, One Page Love, Design Details, Recent, Mobbin free tier. 3. For each of 5+ sources write one row: source + URL + date seen | what it does | principle | mechanism | what NOT to copy. 4. Keep only principles that appear in 2+ independent sources or solve this brief's named objection. 5. Pick 1 primary + at most 1 secondary reference, each for a named dimension, and record what was intentionally NOT copied. 6. Never reuse a photo, illustration, body copy, logo, trademark, trade dress, distinctive composition or 1:1 layout (17 U.S.C. 102(b): ideas and principles are safe; expression is not).` },
    }],
  }));
  server.registerPrompt("audit", {
    title: "QC audit",
    description: "Run the QC checklist (Gate A deterministic checks + Gate B judgment) before delivering a design.",
    argsSchema: {
      design_type: z.string().optional().describe("One of: logo, brand, social, ad, web, ui."),
    },
  }, async ({ design_type }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: `Run the QC audit gate for this ${design_type ?? "design"} before delivery.\n\nGate A (automatic): run audit_design on the artefact. Score under 35/50 = rewrite, do not ship. Gate B (judgment — answer in writing): name the one idea from the subject that runs the design; name the 1 primary + at most 1 secondary reference and the named dimension each supplied; list what was intentionally not copied; run the two-order test (could someone guess this look from the category alone? from category + the obvious anti-reference?); confirm real content throughout; do a fresh-eyes pass (what is the one action, unmistakable in 5 seconds?). Full checklist: design://rules/qc-checklist.` },
    }],
  }));

  return server;
}

/* ------------------------------------------------------------------ */
/* Transports: stdio (default) and Streamable HTTP (optional)          */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http") || process.env.MCP_TRANSPORT === "http";
  if (!httpMode) {
    const transport = new StdioServerTransport();
    await createServer().connect(transport);
    log(`anti-slop-design v${VERSION} running on stdio (corpus: ${DATA_DIR})`);
    return;
  }

  const port = Number(process.env.PORT ?? 3000);
  const httpServer = createHttpServer(async (req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, name: "anti-slop-design", version: VERSION, research_date: RESEARCH_DATE }));
      return;
    }
    if (req.url !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found. MCP endpoint is POST /mcp. Health check is GET /health." }));
      return;
    }
    try {
      const body = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        req.on("error", reject);
      });
      const parsed = body ? JSON.parse(body) : undefined;
      // Stateless: one transport + one server per request. No session state is kept.
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, parsed);
      res.on("close", () => { void server.close(); });
    } catch (e) {
      log("HTTP error:", e instanceof Error ? e.message : String(e));
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });
  httpServer.listen(port, () => {
    log(`anti-slop-design v${VERSION} running on Streamable HTTP at http://localhost:${port}/mcp (stateless; health at /health)`);
    log("Cold-start note: on free tiers (Render/Fly.io/Railway/Cloud Run) the first request after idle can take 30-60s. stdio mode has no cold start — prefer it for local use.");
  });
}

main().catch((e) => {
  log("Fatal:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
