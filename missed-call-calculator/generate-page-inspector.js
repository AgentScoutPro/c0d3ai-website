const fs = require("fs");
const path = require("path");
const { getAllCalculatorPages } = require("./page-data");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "admin");
const OUT_FILE = path.join(OUT_DIR, "page-inspector.html");
const SITE_URL = "https://cod3ai.com";
const BASE_ROUTE = "/missed-call-calculator/";

const HUBS = {
  home_services: { label: "Home Services", route: "/missed-call-calculator/home-services", file: "missed-call-calculator/home-services.html" },
  real_estate: { label: "Real Estate", route: "/missed-call-calculator/real-estate", file: "missed-call-calculator/real-estate.html" },
  legal: { label: "Legal", route: "/missed-call-calculator/legal", file: "missed-call-calculator/legal.html" }
};

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readPage(slug) {
  const file = path.join(ROOT, "missed-call-calculator", `${slug}.html`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function getMatch(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function countDuplicates(items, field) {
  return items.reduce((counts, item) => {
    const key = item[field] || "";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getStatus(item, titleCounts, h1Counts) {
  if (!item.fileExists || !item.title || !item.h1 || !item.canonical || !item.schemaStatus.webPage || !item.schemaStatus.softwareApplication || !item.schemaStatus.faqPage) {
    return "FAIL";
  }

  if (item.internalLinksCount < 9 || titleCounts[item.title] > 1 || h1Counts[item.h1] > 1 || !item.hasFunnelTierSupport) {
    return "WARNING";
  }

  return "PASS";
}

function buildInspectionData() {
  const pages = getAllCalculatorPages().map((page) => {
    const html = readPage(page.slug);
    const title = getMatch(html, /<title>([\s\S]*?)<\/title>/i);
    const h1 = getMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const canonical = getMatch(html, /<link rel="canonical" href="([^"]+)"/i);
    const internalLinksCount = (html.match(/\/missed-call-calculator\/[^"'#<\s]+/g) || [])
      .filter((url) => !url.includes(page.slug))
      .length;

    return {
      service: page.service,
      vertical: page.vertical,
      verticalLabel: HUBS[page.vertical].label,
      slug: page.slug,
      route: `${BASE_ROUTE}${page.slug}`,
      file: `missed-call-calculator/${page.slug}.html`,
      fileExists: Boolean(html),
      title,
      h1,
      canonical,
      schemaStatus: {
        webPage: html.includes('"@type": "WebPage"'),
        softwareApplication: html.includes('"@type": "SoftwareApplication"'),
        faqPage: html.includes('"@type": "FAQPage"')
      },
      internalLinksCount,
      hasFunnelTierSupport: html.includes("function getFunnelTier") && html.includes("funnel_tier"),
      hubRoute: HUBS[page.vertical].route,
      preview: page.copy.hero
    };
  });

  const titleCounts = countDuplicates(pages, "title");
  const h1Counts = countDuplicates(pages, "h1");

  return pages.map((page) => ({
    ...page,
    duplicateTitle: titleCounts[page.title] > 1,
    duplicateH1: h1Counts[page.h1] > 1,
    status: getStatus(page, titleCounts, h1Counts)
  }));
}

function renderInspector() {
  const pages = buildInspectionData();
  const hubPages = Object.keys(HUBS).map((key) => HUBS[key]);
  const totals = {
    pagesGenerated: pages.length,
    hubPages: hubPages.length,
    pass: pages.filter((page) => page.status === "PASS").length,
    warning: pages.filter((page) => page.status === "WARNING").length,
    fail: pages.filter((page) => page.status === "FAIL").length
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C0D3AI Page Inspector | Missed Call Calculator</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--green:#00ff41;--red:#ff4d5e;--yellow:#f5c95c;--panel:rgba(255,255,255,.055);--border:rgba(255,255,255,.13);--muted:rgba(255,255,255,.62)}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(65,38,116,.38),transparent 35rem),radial-gradient(circle at 92% 14%,rgba(0,255,65,.08),transparent 30rem),#09070d;color:#fff;font-family:Inter,system-ui,sans-serif;overflow-x:hidden}a{color:inherit}.wrap{width:min(1280px,calc(100% - 32px));margin:0 auto;padding:54px 0 80px}.eyebrow,.meta{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.42)}.eyebrow{color:var(--green)}h1{margin:14px 0 12px;font-size:clamp(2.2rem,5vw,4.4rem);line-height:.95}.lead{color:var(--muted);max-width:780px;line-height:1.7}.panel{border:1px solid var(--border);border-radius:8px;background:var(--panel);box-shadow:0 28px 80px rgba(0,0,0,.24)}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:28px 0}.stat{padding:18px}.stat strong{display:block;margin-top:8px;font-size:2rem;color:var(--green)}.toolbar{position:sticky;top:0;z-index:3;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px;margin:26px 0;background:rgba(5,5,7,.92);backdrop-filter:blur(18px)}select,button,input{min-height:40px;border:1px solid var(--border);border-radius:8px;background:rgba(0,0,0,.22);color:white;padding:0 12px;font:inherit}button{cursor:pointer;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.active{border-color:var(--green);color:var(--green)}.table{display:grid;gap:12px}.row{display:grid;grid-template-columns:96px 1.2fr 1.3fr 1.15fr 90px 170px;gap:12px;align-items:start;padding:16px}.head{position:sticky;top:82px;z-index:2;background:rgba(9,7,13,.95);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.45)}.status{display:inline-flex;align-items:center;justify-content:center;min-height:26px;border-radius:999px;padding:0 10px;font-size:10px;font-weight:900;letter-spacing:.12em}.PASS{background:rgba(0,255,65,.14);color:var(--green)}.WARNING{background:rgba(245,201,92,.16);color:var(--yellow)}.FAIL{background:rgba(255,77,94,.18);color:var(--red)}.cell-title{font-weight:900}.small{margin-top:6px;color:rgba(255,255,255,.48);font-size:12px;line-height:1.45;word-break:break-word}.links{display:flex;flex-wrap:wrap;gap:8px}.links a,.links button{display:inline-flex;align-items:center;min-height:32px;border:1px solid var(--border);border-radius:999px;padding:0 10px;color:rgba(255,255,255,.72);background:transparent;font-size:11px;font-weight:800;text-decoration:none}.preview{display:none;margin-top:12px;padding:12px;border-radius:8px;background:rgba(255,255,255,.045);color:rgba(255,255,255,.68);line-height:1.55}.preview.open{display:block}.badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.badge{border:1px solid var(--border);border-radius:999px;padding:4px 8px;color:rgba(255,255,255,.62);font-size:10px;font-weight:800}.badge.ok{border-color:rgba(0,255,65,.28);color:var(--green)}.badge.warn{border-color:rgba(245,201,92,.32);color:var(--yellow)}.badge.fail{border-color:rgba(255,77,94,.34);color:var(--red)}.files{margin-top:28px;padding:20px}.files code{color:var(--green)}@media(max-width:1100px){.stats{grid-template-columns:repeat(2,1fr)}.row,.head{grid-template-columns:1fr}.head{display:none}}@media(max-width:640px){.wrap{width:min(100% - 24px,1280px)}.stats{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="eyebrow">Internal Validation Dashboard</div>
    <h1>Missed Call Calculator Page Inspector</h1>
    <p class="lead">Static QA dashboard for generated calculator pages, hub routes, schema, internal links, and funnel support. This page is intentionally noindex and does not require authentication yet.</p>

    <section class="stats">
      <div class="panel stat"><span class="meta">Total pages generated</span><strong>${totals.pagesGenerated}</strong></div>
      <div class="panel stat"><span class="meta">Hub pages</span><strong>${totals.hubPages}</strong></div>
      <div class="panel stat"><span class="meta">PASS</span><strong>${totals.pass}</strong></div>
      <div class="panel stat"><span class="meta">WARNING</span><strong>${totals.warning}</strong></div>
      <div class="panel stat"><span class="meta">FAIL</span><strong>${totals.fail}</strong></div>
    </section>

    <section class="panel toolbar" aria-label="Inspector filters">
      <select id="verticalFilter" aria-label="Filter by vertical">
        <option value="all">All verticals</option>
        <option value="home_services">Home Services</option>
        <option value="real_estate">Real Estate</option>
        <option value="legal">Legal</option>
      </select>
      <button data-filter="all" class="active">All Pages</button>
      <button data-filter="missingSchema">Missing Schema</button>
      <button data-filter="missingLinks">Missing Links</button>
      <button data-filter="duplicateTitle">Duplicate Titles</button>
      <button data-filter="duplicateH1">Duplicate H1</button>
    </section>

    <section class="table" id="table">
      <div class="panel row head"><div>Status</div><div>Page</div><div>SEO</div><div>Technical</div><div>Links</div><div>Actions</div></div>
    </section>

    <section class="panel files">
      <div class="eyebrow">Routes and file locations</div>
      <p>Main route: <code>/missed-call-calculator</code> -> <code>missed-call-calculator/index.html</code></p>
      <p>Inspector route: <code>/admin/page-inspector</code> -> <code>admin/page-inspector.html</code></p>
      <p>Hub routes: ${hubPages.map((hub) => `<code>${hub.route}</code>`).join(" ")}</p>
      <p>Canonical data: <code>missed-call-calculator/calculator-pages.json</code></p>
    </section>
  </main>

  <script>
    const pages = ${JSON.stringify(pages).replace(/</g, "\\u003c")};
    let activeFilter = 'all';
    const table = document.getElementById('table');
    const verticalFilter = document.getElementById('verticalFilter');
    const buttons = [...document.querySelectorAll('[data-filter]')];

    function schemaLabel(page){
      const s = page.schemaStatus;
      const missing = [];
      if(!s.webPage) missing.push('WebPage');
      if(!s.softwareApplication) missing.push('SoftwareApplication');
      if(!s.faqPage) missing.push('FAQPage');
      return missing.length ? 'Missing ' + missing.join(', ') : 'Complete schema';
    }

    function matches(page){
      if(verticalFilter.value !== 'all' && page.vertical !== verticalFilter.value) return false;
      if(activeFilter === 'missingSchema') return !page.schemaStatus.webPage || !page.schemaStatus.softwareApplication || !page.schemaStatus.faqPage;
      if(activeFilter === 'missingLinks') return page.internalLinksCount < 9;
      if(activeFilter === 'duplicateTitle') return page.duplicateTitle;
      if(activeFilter === 'duplicateH1') return page.duplicateH1;
      return true;
    }

    function badge(text, ok){
      return '<span class="badge ' + (ok ? 'ok' : 'fail') + '">' + text + '</span>';
    }

    function render(){
      table.querySelectorAll('.data-row').forEach((row) => row.remove());
      pages.filter(matches).forEach((page, index) => {
        const row = document.createElement('div');
        row.className = 'panel row data-row';
        row.innerHTML = \`
          <div><span class="status \${page.status}">\${page.status}</span><div class="small">\${page.verticalLabel}</div></div>
          <div><div class="cell-title">\${page.service}</div><div class="small">Slug: \${page.slug}</div><div class="small">File: \${page.file}</div></div>
          <div><div class="small"><strong>Title:</strong> \${page.title || 'Missing'}</div><div class="small"><strong>H1:</strong> \${page.h1 || 'Missing'}</div><div class="small"><strong>Canonical:</strong> \${page.canonical || 'Missing'}</div></div>
          <div><div class="badges">\${badge('WebPage', page.schemaStatus.webPage)}\${badge('SoftwareApplication', page.schemaStatus.softwareApplication)}\${badge('FAQPage', page.schemaStatus.faqPage)}\${badge('Funnel tier', page.hasFunnelTierSupport)}</div><div class="small">\${schemaLabel(page)}</div></div>
          <div><div class="cell-title">\${page.internalLinksCount}</div><div class="small">Internal link references</div></div>
          <div><div class="links"><a href="\${page.route}" target="_blank" rel="noopener">Open page</a><a href="\${page.hubRoute}" target="_blank" rel="noopener">Open hub</a><button type="button" data-preview="\${index}">Preview page</button></div><div class="preview" id="preview-\${index}">\${page.preview}</div></div>
        \`;
        table.appendChild(row);
      });

      document.querySelectorAll('[data-preview]').forEach((button) => {
        button.addEventListener('click', () => {
          document.getElementById('preview-' + button.dataset.preview).classList.toggle('open');
        });
      });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        buttons.forEach((item) => item.classList.toggle('active', item === button));
        render();
      });
    });
    verticalFilter.addEventListener('change', render);
    render();
  </script>
</body>
</html>
`;
}

function generatePageInspector() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, renderInspector());
  console.log("Generated admin/page-inspector.html.");
}

if (require.main === module) {
  generatePageInspector();
}

module.exports = {
  generatePageInspector,
  buildInspectionData
};
