# anti-slop-design-mcp

Free, research-first, anti-AI-slop design reference MCP server. No paid
dependencies, no API keys required.

Built from the research report *Free, Research-First, Anti-AI-Slop Design
System* (2026-11-22) — report §3 (MCP mechanics) and §8b (free MCP build
plan) — and the live artifact `anti-slop-design-research`.

**What it does:** serves a small, hand-curated, text-only corpus (banned
patterns, design principles, 12 directions, references, named designers,
intake questions, design-system tokens, Google Fonts) plus keyless public
sources (Iconify, Openverse, Wikimedia Commons). It links out to free
galleries (SiteInspire, One Page Love, Design Details, Recent, Awwwards)
instead of re-hosting screenshots.

**What it does NOT do:** it does not scrape Mobbin / ThinkUI / Uizze /
Land-book, does not re-host paywalled screenshots, does not copy any layout,
logo, photo or copy, and does not generate images (that still needs a model
or API key). A 600,000-screenshot corpus cannot be built for free — this
server is honest about that in `corpus_stats`.

## Install

Requires Node 20+.

```bash
cd anti-slop-design/mcp
npm install
npm run build
npm test        # stdio smoke test (15 checks, no network needed)
```

## Use

### stdio (default — local, no hosting, no cold start)

```bash
node dist/server.js
# or
npm start
```

Add it to your AI app with one of the snippets in `examples/`:

**Claude Code** — `.mcp.json` in your project (or `~/.claude.json`):

```json
{
  "mcpServers": {
    "anti-slop-design": {
      "command": "node",
      "args": ["/absolute/path/to/anti-slop-design/mcp/dist/server.js"]
    }
  }
}
```

**Cursor** — same shape in `.cursor/mcp.json`. **VS Code** — same shape in
`.vscode/mcp.json` (with `"type": "stdio"`). **Claude Desktop** — same shape
in `claude_desktop_config.json`. Full ready-to-paste files are in
`examples/mcp-claude-code.json`, `examples/mcp-cursor.json`,
`examples/mcp-vscode.json`, `examples/mcp-claude-desktop.json` — replace
`/absolute/path/to/anti-slop-design/mcp` with your real path.

### Streamable HTTP (optional — for hosted use)

```bash
PORT=3000 node dist/server.js --http   # or MCP_TRANSPORT=http
# endpoint: POST http://localhost:3000/mcp
# health:   GET  http://localhost:3000/health
```

Stateless (one server per request, no session state kept). Free-hosting
options: Render free web service, Fly.io free allowance, Railway free tier,
Google Cloud Run free tier. Caveats, from the research:

- Free tiers sleep/spin down when idle — expect a 30–60s cold start on the
  first request. stdio mode has no cold start; prefer it for local use.
- Avoid serverless with short timeouts (e.g. Vercel Hobby, 10s) — it only
  works with stateless handlers + external state.
- Host only your own corpus + links. Never host scraped paywalled content.
- A minimal `Dockerfile` is included (`docker build -t anti-slop-design-mcp .`
  then `docker run -p 3000:3000 -e PORT=3000 anti-slop-design-mcp`).

## Tools (exactly the spec, §3.2)

| Tool | Input | Returns |
|---|---|---|
| `search_references` | `query, design_type?, niche?, limit?` | Ranked text digests: principle, pattern, why it works, source name + URL, licence note. |
| `get_top_designers` | `niche, limit?` | Named designers/studios/agencies with what each is known for + portfolio URL. |
| `get_design_principles` | `design_type?, niche?` | Banned list (33 rules) + positive principles + matching directions + "intentionally not copied" reminder. |
| `get_design_system` | `brand_or_reference` | DESIGN.md-shaped token set (colours, type, spacing, radius, components, do/don't). Original tokens — never a real brand's copied system. |
| `get_assets` | `query, kind?` (`photo`/`icon`/`font`/`all`) | Keyless first: Iconify icons, Openverse + Wikimedia photos (licence per result), Google Fonts (OFL). Pexels/Unsplash only with your own free key (see below). |
| `audit_design` | `html_or_url, design_type?` | Deterministic pass/fail list (17 checks) + score out of 50. Under 35/50 = rewrite, do not ship. Never a vibe score. |
| `corpus_stats` | — | Counts measured from the library served, freshness date, source list. |

All tools return **"no result + what exists"** instead of inventing, and every
result names its source + licence.

## Resources

- `design://rules/anti-slop` — the full banned list (Markdown)
- `design://rules/qc-checklist` — Gate A + Gate B QC checklist
- `design://principles/{type}` — principles per type (logo, brand, social, ad, web, ui)
- `design://intake/{type}` — per-type intake questionnaire
- `design://references/{niche}` — references per niche

## Prompts

- `/brief` — run the intake gate (ask all questions in one message first)
- `/research` — research-first pass (5+ sources, principles, "intentionally not copied")
- `/audit` — QC audit gate (deterministic checks + judgment checklist)

## Environment variables

| Variable | Required? | What it does |
|---|---|---|
| `PEXELS_API_KEY` | No | Your own free Pexels key (200 req/hr, 20k/mo). Enables Pexels results in `get_assets`. Sign up free at https://www.pexels.com/api/ |
| `UNSPLASH_ACCESS_KEY` | No | Your own free Unsplash key (50 req/hr demo). Enables Unsplash results. Sign up free at https://unsplash.com/developers |
| `ANTI_SLOP_DATA_DIR` | No | Override the `data/` directory location. |
| `PORT` | No (HTTP mode) | HTTP port, default 3000. |
| `MCP_TRANSPORT` | No | Set to `http` to use Streamable HTTP instead of stdio (same as `--http`). |

No key is ever sent anywhere unless you set it. Live keyless lookups are
cached for 10 minutes and rate-limited to 10 calls/minute per host; failures
are reported honestly in the tool output, never papered over.

## Corpus (what is actually in here)

| Contents | Count |
|---|---|
| Banned rules (6 categories) | 33 |
| Universal principles | 10 |
| Per-type principles | 19 |
| Directions | 12 |
| Reference digests | 23 |
| Named designers/studios (6 niches) | 35 |
| Intake questions (universal + per-type) | 46 |
| Design systems | 6 |
| Google Fonts families | 18 |

Corpus version 0.1.0, research date 2026-11-22. All content is written in our
own words from public sources, with attribution in `data/meta.json`. Studio
URLs are curated from public portfolios and award listings — verify a URL
before citing it in client work; studios rebrand and merge.

## Test

```bash
npm test
```

`test/test-mcp.mjs` speaks raw JSON-RPC 2.0 to the server over stdio and
checks: handshake, exact tool list, `corpus_stats` counts,
`get_design_principles` (C01 + WB1), `get_top_designers`, `search_references`,
`get_design_system`, unknown-niche no-result behaviour, `audit_design` on a
slop sample (must score under 35/50 and flag A01/A05/A06/A07/A14),
resources + prompts. Live-network tools (`get_assets`) are not asserted —
they depend on keyless APIs being reachable; try them manually.

Try the audit yourself on `examples/slop-sample.html` — paste its contents
into `audit_design`.

## Version note (verified, not from the report)

The research report cites "TS SDK v2.4" and "Python mcp v2.3". Checked live
on npm on 2026-11-22, those versions do not exist: the current
`@modelcontextprotocol/sdk` is **1.32.2**, which this server uses (with
`zod` 3.x, which the SDK requires). If you see "v2.4" anywhere in older
notes, treat it as a report error.

## Gaps and honest limits

- The corpus is small and hand-curated by design. It replaces taste rules
  and direction, not a 600k-screenshot library. For shipped screens, link
  out to the free galleries.
- No image generation. The server directs image work (prompts, art
  direction, real-photo sourcing) but cannot generate images without a model.
- Openverse search returned HTTP 503 ("Search is over capacity") when tested
  on 2026-11-22 in this environment. The server reports that failure
  honestly and still returns Wikimedia results. If Openverse stays
  unavailable, photos come from Wikimedia + (with your key) Pexels/Unsplash.
- The MCP Inspector was not run (manual JSON-RPC test instead). Verify in
  your own client (Claude Code / Cursor / VS Code) after install.
- The included `Dockerfile` was not build-tested (no Docker in this
  environment). It is a minimal starting point — verify the image builds
  before deploying it anywhere.
- The legal note in the corpus (17 U.S.C. §102(b)) is educational, not legal
  advice.

## Licence

MIT — see `LICENSE`. Corpus content is original writing with attributed
public sources; check each asset's licence (returned per result) before
shipping it.
