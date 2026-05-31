"""
Generates ADC_Code_Showcase.html — a browser-openable code exhibit
for FECON 390 project submission.
Run: python3 build_code_showcase.py
"""

import html, os

BASE = "/Users/connorsolvason/my-website"
WORKER = "/Users/connorsolvason/adc-admin/worker.js"

def read(path, start=1, end=None):
    lines = open(path).readlines()
    chunk = lines[start-1 : end]
    return "".join(chunk)

def esc(s):
    return html.escape(s)

# ── Collect snippets ──────────────────────────────────────────────────────────

files = [
    {
        "id": "index",
        "name": "index.html",
        "lang": "html",
        "lines": 581,
        "role": "Homepage — hero section, impact stats, Instagram feed, sponsor bar",
        "prompt": "\"Build a complete multi-page website for ADC, a nonprofit soccer and education "
                  "organization in Curundú, Panama. Include a hero section with a video background, "
                  "a clean navigation menu, and ADC's green and black brand colors.\"",
        "phase": "Phase 1",
        "snippet_label": "Hero section: cycling video background + floating animated logo",
        "code": esc(read(f"{BASE}/index.html", 352, 385)),
    },
    {
        "id": "styles",
        "name": "styles.css",
        "lang": "css",
        "lines": 788,
        "role": "Shared stylesheet — design tokens, responsive grid, all component styles",
        "prompt": "\"Add a visual impact statistics section to the about page showing ADC's key numbers "
                  "with animated counting effect. Style it as a dark full-width band consistent with "
                  "the rest of the site.\"",
        "phase": "Phase 2",
        "snippet_label": "CSS custom properties (design tokens) + stats grid + scroll-reveal animation",
        "code": esc(read(f"{BASE}/styles.css", 1, 35)) + "\n/* ... */\n\n" +
                esc(read(f"{BASE}/styles.css", 282, 310)),
    },
    {
        "id": "nav",
        "name": "nav.js",
        "lang": "javascript",
        "lines": 42,
        "role": "Shared navigation — hamburger toggle, active link detection, IntersectionObserver scroll-reveal",
        "prompt": "\"Add a hamburger menu for mobile, highlight the active page in the nav, "
                  "and add a scroll-reveal animation so sections fade in as the user scrolls.\"",
        "phase": "Phase 1",
        "snippet_label": "Full file — mobile nav + IntersectionObserver scroll-reveal (42 lines)",
        "code": esc(read(f"{BASE}/nav.js")),
    },
    {
        "id": "chatbot",
        "name": "chatbot.js",
        "lang": "javascript",
        "lines": 197,
        "role": "AI virtual assistant — bilingual keyword matching, suggestion chips, animated chat UI",
        "prompt": "\"Build a chatbot widget for the ADC website that answers common questions about "
                  "donating, volunteering, events, and the organization. It should float in the "
                  "bottom-right corner and support Spanish.\"",
        "phase": "Phase 4",
        "snippet_label": "FAQ trigger matching with Unicode normalization (accent-insensitive search)",
        "code": esc(read(f"{BASE}/chatbot.js", 1, 65)),
    },
    {
        "id": "admin",
        "name": "admin.js",
        "lang": "javascript",
        "lines": 1535,
        "role": "Private admin dashboard — SHA-256 password gate, AI grant writer, draft storage, GA panel",
        "prompt": "\"Build a private admin dashboard for ADC's founders. Include a password gate "
                  "(no backend, SHA-256 hash only), a Claude-powered grant proposal writer that "
                  "calls a Cloudflare Worker, auto-save drafts to localStorage, and a to-do tracker.\"",
        "phase": "Phase 4",
        "snippet_label": "Grant writer: build prompt → call Cloudflare Worker → display streamed output",
        "code": (
            esc(read(f"{BASE}/admin.js", 1, 12))
            .replace(
                "&#x27;87ac7086beadc393a2992e2531be5d797f518889a1c73850a1555ce0d8d0b4d2&#x27;",
                "&#x27;[REDACTED — SHA-256 hash]&#x27;"
            )
            .replace(
                "&#x27;https://adc-grant-proxy.adcurundu.workers.dev&#x27;",
                "&#x27;[REDACTED — live endpoint]&#x27;"
            )
            + "\n/* ... */\n\n"
            + esc(read(f"{BASE}/admin.js", 1052, 1095))
        ),
    },
    {
        "id": "worker",
        "name": "worker.js  (Cloudflare Worker)",
        "lang": "javascript",
        "lines": 111,
        "role": "Serverless API proxy — routes grant writer requests to Groq LLM, keeps API key off the client",
        "prompt": "\"Create a Cloudflare Worker that acts as a proxy between the admin dashboard and "
                  "the Groq API. Accept POST requests with a system prompt and user prompt, forward "
                  "them to Groq's llama-3.3-70b model, and return the response. Handle CORS.\"",
        "phase": "Phase 4",
        "snippet_label": "Full Cloudflare Worker — CORS handling, Groq API call, error forwarding (111 lines)",
        "code": esc(read(WORKER)),
    },
]

# ── File stats ────────────────────────────────────────────────────────────────
file_tree = [
    ("index.html",          "581",  "Homepage"),
    ("acercadeadc.html",    "299",  "About page — team bios, values, timeline, achievements"),
    ("calendario.html",     "328",  "Calendar — styled event list with category badges"),
    ("participar.html",     "260",  "Participation — 6 audience pathways"),
    ("contactanos.html",    "297",  "Contact — map embed, contact form, newsletter"),
    ("donar.html",          "349",  "Donation — tiered giving levels, fund transparency"),
    ("blog.html",           "564",  "Blog — featured hero + filterable article grid"),
    ("faq.html",            "337",  "FAQ — accordion by audience segment"),
    ("styles.css",          "788",  "Shared stylesheet — all components"),
    ("nav.js",              "42",   "Navigation — hamburger, active state, scroll-reveal"),
    ("chatbot.js",          "197",  "Virtual assistant chatbot"),
    ("admin.js",            "1,535","Private admin dashboard + AI grant writer"),
    ("worker.js",           "111",  "Cloudflare Worker — serverless API proxy"),
]
total = 6346

# ── Build HTML ────────────────────────────────────────────────────────────────

nav_links = "\n".join(
    f'<a href="#{f["id"]}">{f["name"].split()[0]}</a>'
    for f in files
)

file_tree_rows = "\n".join(
    f'<tr><td class="ft-name">{n}</td><td class="ft-lines">{l}</td><td class="ft-desc">{d}</td></tr>'
    for n, l, d in file_tree
)

sections = []
for f in files:
    sections.append(f"""
<section class="file-section" id="{f['id']}">
  <div class="file-header">
    <div class="file-meta">
      <span class="file-badge {f['lang']}">{f['lang'].upper()}</span>
      <span class="file-name">{f['name']}</span>
      <span class="file-lines">{f['lines']:,} lines</span>
    </div>
    <p class="file-role">{f['role']}</p>
  </div>

  <div class="prompt-box">
    <div class="prompt-label">
      <span class="phase-tag">{f['phase']}</span>
      PROMPT THAT GENERATED THIS FILE
    </div>
    <p class="prompt-text">{f['prompt']}</p>
  </div>

  <div class="snippet-wrap">
    <div class="snippet-label">{f['snippet_label']}</div>
    <pre><code class="language-{f['lang']}">{f['code']}</code></pre>
  </div>
</section>
""")

html_out = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ADC Website — Code Showcase | FECON 390</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <style>
    :root {{
      --green:     #1b6b3a;
      --green-l:   #2ead6b;
      --green-pale:#e8f5ee;
      --dark:      #0f0f0f;
      --mid:       #1a1a1a;
      --border:    #2a2a2a;
      --text:      #e8e8e8;
      --muted:     #888;
      --accent:    #2ead6b;
      --yellow:    #f5c842;
      --blue:      #4a9eff;
      --red:       #e05c5c;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; font-size: 15px; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: var(--dark);
      color: var(--text);
      line-height: 1.6;
    }}

    /* ── TOP BAR ── */
    .top-bar {{
      background: var(--green);
      padding: 0.6rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }}
    .top-bar-left {{ font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; color: #fff; }}
    .top-bar-left span {{ opacity: 0.7; font-weight: 400; }}
    .top-nav {{ display: flex; gap: 0.25rem; flex-wrap: wrap; }}
    .top-nav a {{
      color: rgba(255,255,255,0.75);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      font-family: 'JetBrains Mono', monospace;
    }}
    .top-nav a:hover {{ background: rgba(255,255,255,0.15); color: #fff; }}

    /* ── HERO ── */
    .hero {{
      padding: 5rem 2rem 4rem;
      max-width: 900px;
      margin: 0 auto;
    }}
    .hero-eyebrow {{
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--green-l);
      margin-bottom: 1rem;
    }}
    .hero h1 {{
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 1rem;
      color: #fff;
    }}
    .hero h1 em {{ font-style: normal; color: var(--green-l); }}
    .hero-sub {{
      font-size: 1rem;
      color: var(--muted);
      max-width: 60ch;
      margin-bottom: 2.5rem;
      line-height: 1.7;
    }}

    /* ── STATS ROW ── */
    .stats-row {{
      display: flex;
      gap: 2.5rem;
      flex-wrap: wrap;
      padding: 1.5rem 2rem;
      background: var(--mid);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }}
    .stat {{ text-align: center; }}
    .stat-num {{ font-size: 2.2rem; font-weight: 700; color: var(--green-l); line-height: 1; }}
    .stat-label {{ font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; letter-spacing: 0.04em; }}

    /* ── FILE TREE ── */
    .tree-section {{
      max-width: 900px;
      margin: 3rem auto;
      padding: 0 2rem;
    }}
    .section-heading {{
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--green-l);
      margin-bottom: 1rem;
    }}
    .file-tree {{
      width: 100%;
      border-collapse: collapse;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      background: var(--mid);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }}
    .file-tree thead th {{
      background: var(--border);
      padding: 0.6rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }}
    .file-tree tbody tr {{ border-top: 1px solid var(--border); }}
    .file-tree tbody tr:hover {{ background: rgba(255,255,255,0.03); }}
    .ft-name {{ padding: 0.55rem 1rem; color: var(--green-l); }}
    .ft-lines {{ padding: 0.55rem 1rem; color: var(--muted); text-align: right; }}
    .ft-desc {{ padding: 0.55rem 1rem; color: #bbb; font-family: 'Inter', sans-serif; font-size: 0.8rem; }}
    .tree-total {{
      text-align: right;
      font-size: 0.8rem;
      color: var(--muted);
      margin-top: 0.6rem;
      font-family: 'JetBrains Mono', monospace;
    }}
    .tree-total strong {{ color: var(--green-l); }}

    /* ── FILE SECTIONS ── */
    .file-section {{
      max-width: 900px;
      margin: 3.5rem auto;
      padding: 0 2rem;
    }}
    .file-header {{
      margin-bottom: 1.25rem;
    }}
    .file-meta {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }}
    .file-badge {{
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
    }}
    .file-badge.html       {{ background: #e44d26; color: #fff; }}
    .file-badge.css        {{ background: #264de4; color: #fff; }}
    .file-badge.javascript {{ background: #f7df1e; color: #000; }}
    .file-name {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
    }}
    .file-lines {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      color: var(--muted);
      background: var(--mid);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }}
    .file-role {{
      font-size: 0.88rem;
      color: var(--muted);
    }}

    /* ── PROMPT BOX ── */
    .prompt-box {{
      background: #0d1f14;
      border: 1px solid var(--green);
      border-left: 3px solid var(--green-l);
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
    }}
    .prompt-label {{
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--green-l);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}
    .phase-tag {{
      background: var(--green);
      color: #fff;
      font-size: 0.65rem;
      padding: 0.1rem 0.45rem;
      border-radius: 3px;
      font-weight: 600;
    }}
    .prompt-text {{
      font-size: 0.9rem;
      color: #c8e6d4;
      font-style: italic;
      line-height: 1.65;
    }}

    /* ── CODE BLOCK ── */
    .snippet-wrap {{
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }}
    .snippet-label {{
      background: #1e1e1e;
      padding: 0.5rem 1rem;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--muted);
      letter-spacing: 0.03em;
      border-bottom: 1px solid var(--border);
    }}
    .snippet-wrap pre {{
      margin: 0 !important;
      border-radius: 0 !important;
      max-height: 420px;
      overflow-y: auto;
      font-size: 0.8rem !important;
    }}
    .snippet-wrap pre::-webkit-scrollbar {{ width: 6px; }}
    .snippet-wrap pre::-webkit-scrollbar-track {{ background: #1a1a1a; }}
    .snippet-wrap pre::-webkit-scrollbar-thumb {{ background: #444; border-radius: 3px; }}

    /* ── DIVIDER ── */
    .section-divider {{
      border: none;
      border-top: 1px solid var(--border);
      margin: 3rem auto;
      max-width: 900px;
    }}

    /* ── FOOTER ── */
    .footer {{
      text-align: center;
      padding: 3rem 2rem;
      font-size: 0.8rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }}
    .footer a {{ color: var(--green-l); text-decoration: none; }}
    .footer strong {{ color: #ccc; }}
  </style>
</head>
<body>

<!-- TOP BAR -->
<div class="top-bar">
  <div class="top-bar-left">
    ADC Code Showcase &nbsp;<span>· FECON 390 · Connor Solvason</span>
  </div>
  <nav class="top-nav">
    {nav_links}
  </nav>
</div>

<!-- HERO -->
<div class="hero">
  <p class="hero-eyebrow">FECON 390 — Project Artifact</p>
  <h1>Asociación Deportiva Curundú<br><em>Built entirely with conversational AI</em></h1>
  <p class="hero-sub">
    Every line of code below was generated by Claude AI in response to plain-English prompts —
    no prior coding knowledge required. This file documents the key source files of a fully
    deployed nonprofit website and admin backend.
  </p>
  <div style="display:flex; gap:1rem; flex-wrap:wrap;">
    <a href="https://csolv.github.io/my-website/" target="_blank"
       style="background:var(--green); color:#fff; padding:0.55rem 1.2rem; border-radius:6px;
              font-size:0.85rem; font-weight:600; text-decoration:none;">
      → Live Site
    </a>
    <a href="https://github.com/csolv/my-website" target="_blank"
       style="border:1px solid var(--border); color:#ccc; padding:0.55rem 1.2rem; border-radius:6px;
              font-size:0.85rem; font-weight:500; text-decoration:none;">
      GitHub Repository
    </a>
  </div>
</div>

<!-- STATS -->
<div class="stats-row">
  <div class="stat"><div class="stat-num">6,346</div><div class="stat-label">Total lines of code</div></div>
  <div class="stat"><div class="stat-num">13</div><div class="stat-label">Source files</div></div>
  <div class="stat"><div class="stat-num">48</div><div class="stat-label">AI prompts documented</div></div>
  <div class="stat"><div class="stat-num">$0</div><div class="stat-label">Developer cost</div></div>
  <div class="stat"><div class="stat-num">3</div><div class="stat-label">Languages (HTML/CSS/JS)</div></div>
  <div class="stat"><div class="stat-num">0</div><div class="stat-label">Lines written by hand</div></div>
</div>

<!-- FILE TREE -->
<div class="tree-section">
  <p class="section-heading">Project File Structure</p>
  <table class="file-tree">
    <thead>
      <tr>
        <th>File</th>
        <th style="text-align:right;">Lines</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {file_tree_rows}
    </tbody>
  </table>
  <p class="tree-total">Total: <strong>{total:,} lines</strong> across 13 files</p>
</div>

<hr class="section-divider">

<!-- FILE SECTIONS -->
{"".join(sections)}

<!-- FOOTER -->
<div class="footer">
  <p>
    <strong>Asociación Deportiva Curundú Website</strong> — Built with Claude AI (Anthropic) ·
    <a href="https://csolv.github.io/my-website/" target="_blank">adcurundu.org</a>
  </p>
  <p style="margin-top:0.4rem;">
    Connor Solvason · FECON 390 · Prof. Daniel Egger · Duke University · April 2026
  </p>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
</body>
</html>
"""

out_path = f"{BASE}/ADC_Code_Showcase.html"
with open(out_path, "w") as fh:
    fh.write(html_out)

print(f"Saved: {out_path}")
print(f"Size: {len(html_out):,} bytes")
