// Generates profile SVGs (banner + repo cards) into ./out using the GitHub API. No dependencies.
import { mkdirSync, writeFileSync } from "node:fs";

const OWNER = "ignaciogarcia-dev";
const REPOS = ["reconbanker", "walty", "two-towers"];
const TOKEN = process.env.GITHUB_TOKEN;
const headers = { Accept: "application/vnd.github+json", ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }) };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const LANG = { TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5", PHP: "#4F5D95", Go: "#00ADD8", Rust: "#dea584" };

function wrap(text, max) {
  const lines = []; let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) { lines.length = 2; lines[1] = lines[1].replace(/.{0,3}$/, "…"); }
  return lines;
}

function card(r) {
  const desc = wrap(r.description || "", 52);
  const lang = r.language;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="130" viewBox="0 0 400 130" role="img" aria-label="${esc(r.name)}: ${r.stargazers_count} stars">
  <rect x=".5" y=".5" width="399" height="129" rx="10" fill="#0d1117" stroke="#30363d"/>
  <text x="20" y="34" font-family="${FONT}" font-size="17" font-weight="600" fill="#58a6ff">${esc(r.name)}</text>
  ${desc.map((l, i) => `<text x="20" y="${60 + i * 18}" font-family="${FONT}" font-size="13" fill="#8b949e">${esc(l)}</text>`).join("\n  ")}
  ${lang ? `<circle cx="26" cy="108" r="5" fill="${LANG[lang] || "#8b949e"}"/><text x="38" y="112" font-family="${FONT}" font-size="12" fill="#8b949e">${esc(lang)}</text>` : ""}
  <path transform="translate(160 99) scale(.75)" fill="#e3b341" d="M8 .25a.75.75 0 0 1 .67.42l1.88 3.8 4.2.61a.75.75 0 0 1 .42 1.28l-3.04 2.96.72 4.18a.75.75 0 0 1-1.09.79L8 12.32l-3.76 1.97a.75.75 0 0 1-1.09-.79l.72-4.18L.83 6.36a.75.75 0 0 1 .42-1.28l4.2-.61L7.33.67A.75.75 0 0 1 8 .25z"/>
  <text x="178" y="112" font-family="${FONT}" font-size="12" fill="#c9d1d9">${r.stargazers_count}</text>
  <text x="${178 + String(r.stargazers_count).length * 8 + 16}" y="112" font-family="${FONT}" font-size="12" fill="#8b949e">${r.forks_count} forks</text>
</svg>`;
}

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="200" viewBox="0 0 1000 200" role="img" aria-label="Ignacio García">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#1b2a41"/></linearGradient></defs>
  <rect width="1000" height="200" rx="14" fill="url(#g)"/>
  <text x="60" y="96" font-family="${FONT}" font-size="46" font-weight="700" fill="#f0f6fc">Ignacio García</text>
  <text x="62" y="134" font-family="${FONT}" font-size="20" fill="#8b949e">AI agents · LLM features · payment systems</text>
  <text x="62" y="164" font-family="${FONT}" font-size="14" fill="#58a6ff">Montevideo, Uruguay</text>
</svg>`;

mkdirSync("out", { recursive: true });
writeFileSync("out/banner.svg", banner);
for (const name of REPOS) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${name}`, { headers });
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`);
  writeFileSync(`out/${name}.svg`, card(await res.json()));
}
console.log("ok");
