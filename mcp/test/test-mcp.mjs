#!/usr/bin/env node
/**
 * test-mcp.mjs — smoke test for anti-slop-design-mcp over stdio.
 *
 * Speaks raw JSON-RPC 2.0 to the server (no MCP client dependency), so this
 * test also proves the server speaks the protocol correctly.
 *
 * Checks:
 *  1. initialize handshake works
 *  2. tools/list returns exactly the 7 tools from the spec
 *  3. corpus_stats returns real counts
 *  4. get_design_principles returns the banned list (C01 present)
 *  5. audit_design on a slop sample scores below 35/50 (REWRITE)
 *  6. get_top_designers returns named designers for a niche
 *  7. resources/list + resources/read + prompts/list work
 *
 * Run: npm test        (build first: npm run build)
 * Live-network tools (get_assets) are NOT asserted here — they depend on
 * keyless APIs being reachable. Run them manually if you want to check.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, "..", "dist", "server.js");

const SLOP_SAMPLE = `<!doctype html><html><head><style>
  body { font-family: Inter, Arial, sans-serif; color: #000; background: #fff; }
  .hero { background: linear-gradient(135deg, #8b5cf6, #3b82f6); height: 100vh; text-align: center; }
  .hero h1 span { color: #a855f7; }
  .card { border-radius: 16px; box-shadow: 0 0 40px rgba(139,92,246,.6); }
</style></head><body>
  <div class="hero"><p class="eyebrow">WELCOME</p><h1>Not just a tool, <span>it's magic</span></h1>
  <p>Lorem ipsum dolor sit amet. Trusted by 10,000+ teams.</p></div>
  <div class="card">One</div><div class="card">Two</div><div class="card">Three</div>
  <form><input type="email"><button>Submit</button></form>
</body></html>`;

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

const proc = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
let buf = "";
let nextId = 1;
const pending = new Map();
proc.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { console.log("WARN  non-JSON on stdout:", line.slice(0, 200)); continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg);
    }
  }
});
let stderr = "";
proc.stderr.on("data", (c) => { stderr += c.toString(); });

function call(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve });
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); } }, 15000);
    proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function notify(method, params = {}) {
  proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
}
async function toolCall(name, args) {
  const res = await call("tools/call", { name, arguments: args });
  if (res.error) throw new Error(`${name}: ${JSON.stringify(res.error)}`);
  return res.result?.content?.map((c) => c.text ?? "").join("\n") ?? "";
}

try {
  const init = await call("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "anti-slop-test", version: "0.1.0" },
  });
  check("initialize handshake", !!init.result?.serverInfo, `server: ${init.result?.serverInfo?.name} ${init.result?.serverInfo?.version}`);
  notify("notifications/initialized");

  const tools = await call("tools/list");
  const names = (tools.result?.tools ?? []).map((t) => t.name).sort();
  const expected = ["audit_design", "corpus_stats", "get_assets", "get_design_principles", "get_design_system", "get_top_designers", "search_references"].sort();
  check("tools/list returns exactly the 7 spec tools", JSON.stringify(names) === JSON.stringify(expected), names.join(", "));

  const stats = await toolCall("corpus_stats", {});
  const bannedMatch = stats.match(/banned_rules: (\d+)/);
  const refsMatch = stats.match(/references: (\d+)/);
  const dirMatch = stats.match(/directions: (\d+)/);
  check("corpus_stats returns real counts", !!bannedMatch && Number(bannedMatch[1]) > 20 && !!refsMatch && Number(refsMatch[1]) >= 20 && !!dirMatch && Number(dirMatch[1]) === 12,
    stats.split("\n").slice(2, 9).join(" | "));

  const principles = await toolCall("get_design_principles", { design_type: "web" });
  check("get_design_principles returns banned list (C01) + web principles (WB1)",
    principles.includes("C01") && principles.includes("WB1") && principles.includes("intentionally NOT copied"));

  const designers = await toolCall("get_top_designers", { niche: "web", limit: 5 });
  check("get_top_designers returns 5 named web designers/studios with URLs",
    designers.includes("Active Theory") && designers.includes("https://") && (designers.match(/^\d\. /gm) ?? []).length >= 5);

  const refs = await toolCall("search_references", { query: "fintech onboarding", design_type: "ui", limit: 3 });
  check("search_references returns ranked digests with source + licence",
    refs.includes("Principle:") && refs.includes("Source:") && refs.includes("Licence:"));

  const system = await toolCall("get_design_system", { brand_or_reference: "swiss industrial" });
  check("get_design_system returns a DESIGN.md token set for 'swiss industrial'",
    system.includes("Swiss Industrial") && system.includes("## 1. Colours") && system.includes("## 6. Do"));

  const noResult = await toolCall("get_top_designers", { niche: "underwater-basket-weaving" });
  check("unknown niche returns 'no result + what exists' instead of inventing",
    /No result found/.test(noResult) && /What does exist/.test(noResult));

  const audit = await toolCall("audit_design", { html_or_url: SLOP_SAMPLE, design_type: "web" });
  const scoreMatch = audit.match(/Score: (\d+)\/50/);
  const score = scoreMatch ? Number(scoreMatch[1]) : 99;
  check("audit_design on slop sample scores below 35/50 (REWRITE)",
    score < 35 && audit.includes("REWRITE"), `score ${score}/50`);
  check("audit_design flags the expected patterns (A01 gradient, A05 pure colours, A06 lorem, A07 invented stats, A14 h-screen)",
    ["A01", "A05", "A06", "A07", "A14"].every((id) => audit.includes(id) && audit.includes("FAIL")));

  const resources = await call("resources/list");
  const uris = (resources.result?.resources ?? []).map((r) => r.uri);
  check("resources/list includes design://rules/anti-slop", uris.includes("design://rules/anti-slop"), uris.join(", "));
  const templates = await call("resources/templates/list").catch(() => null);
  if (templates?.result) {
    const tUris = (templates.result.resourceTemplates ?? []).map((t) => t.uriTemplate);
    check("resources/templates/list includes principles/intake/references templates",
      tUris.includes("design://principles/{type}") && tUris.includes("design://intake/{type}") && tUris.includes("design://references/{niche}"), tUris.join(", "));
  } else {
    console.log("SKIP  resources/templates/list not supported by this client call shape");
  }
  const read = await call("resources/read", { uri: "design://intake/logo" });
  const readText = read.result?.contents?.[0]?.text ?? "";
  check("resources/read design://intake/logo returns the logo questionnaire",
    readText.includes("brand name") && readText.includes("REQUIRED"));

  const prompts = await call("prompts/list");
  const promptNames = (prompts.result?.prompts ?? []).map((p) => p.name).sort();
  check("prompts/list returns brief, research, audit",
    JSON.stringify(promptNames) === JSON.stringify(["audit", "brief", "research"]), promptNames.join(", "));
  const brief = await call("prompts/get", { name: "brief", arguments: { design_type: "logo", brief: "a coffee brand" } });
  const briefText = brief.result?.messages?.[0]?.content?.text ?? "";
  check("prompts/get brief returns an intake-gate message",
    briefText.includes("intake gate") && briefText.includes("logo"));
} catch (e) {
  check("test run completed without exception", false, e instanceof Error ? e.message : String(e));
} finally {
  proc.kill();
  await new Promise((r) => setTimeout(r, 300));
}

console.log("\n--- server stderr (logs only, stdout is protocol) ---");
console.log(stderr.trim() || "(no stderr output)");
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
