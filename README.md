# anti-slop-design

Free, research-first, anti-AI-slop design for any AI model. No paid APIs, no account, no API key.

If the brief is vague, it asks all intake questions first. Then it researches top designs and designers for the niche on the free web, takes inspiration from principles (never copying), then designs. For logo, brand/graphic, social media, ad creative, landing page/web, and UI/app work.

## What is in here

- `skill/anti-slop-design/` — portable Agent Skill (SKILL.md, 6 gates: intake, research, direction, build, audit, deliver). Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI, Windsurf, OpenCode.
- `mcp/` — free MCP server (Node 20+, stdio by default). 7 tools: `search_references`, `get_top_designers`, `get_design_principles`, `get_design_system`, `get_assets`, `audit_design`, `corpus_stats`.

## Install the Skill (one command)

```bash
npx skills add MRaheel25/anti-slop-design
```

Or clone it directly:

```bash
git clone https://github.com/MRaheel25/anti-slop-design.git ~/.claude/skills/anti-slop-design
```

Then ask your agent to design a logo, social post, ad, landing page, or app screen. It will ask the intake questions first, research, then design.

## Install the MCP server

Hosted, no install needed:

- Endpoint: `https://mcp.grafigator.com/mcp` (Streamable HTTP)
- Health: `https://mcp.grafigator.com/health`

```json
{
  "mcpServers": {
    "anti-slop-design": {
      "type": "streamable-http",
      "url": "https://mcp.grafigator.com/mcp"
    }
  }
}
```

Or run it locally:

```bash
git clone https://github.com/MRaheel25/anti-slop-design.git
cd anti-slop-design/mcp
npm install && npm run build && npm test
```

Then add the snippet from `mcp/examples/mcp-claude-code.json` (or Cursor / VS Code / Claude Desktop) to your client config, with the real absolute path. No account, no key. Optional: your own free `PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY` enables those photo results.

## How it works

1. **Intake gate** — all questions for the design type, in one message. No designing with gaps.
2. **Research gate** — minimum 5 sources, 2–3 named designers, principles extracted, with an "intentionally not copied" record.
3. **Direction gate** — deal 3 directions, pick 1, write DESIGN.md tokens before building.
4. **Build** — real content only, one accent, one theme.
5. **Audit gate** — banned-pattern lint + QC checklist, score under 35/50 = rewrite, don't ship.

## Honest limits

- Image generation itself still needs a model. This directs image work and sources real photos (Pexels, Unsplash, Openverse, Wikimedia).
- It does not include a 600k-screenshot corpus. That is what Mobbin / ThinkUI / Uizze sell. It links to free galleries and MCPs (SiteInspire, One Page Love, Design Details) instead, and ships a small hand-curated text corpus.
- Research figures and prices in the docs are as of 22 November 2026.

## Licence

MIT. See `mcp/LICENSE`. Ideas are restated with attribution to Hallmark, Taste-Skill, Impeccable, ui-ux-pro-max, awesome-design-md, Anthropic frontend-design, blader/humanizer, and stop-slop.
