const fs = require("fs");
const path = require("path");
const { getAllCalculatorPages } = require("./page-data");

const OUT_DIR = __dirname;
const BASE_URL = "/missed-call-calculator/";
const SITE_URL = "https://cod3ai.com";

const HUBS = {
  home_services: {
    label: "Home Services",
    route: "home-services",
    eyebrow: "C0D3AI // Home Services Missed Call Calculators",
    title: "Home Services Missed Call Calculators | C0D3AI",
    description: "Missed call calculators for plumbers, HVAC, roofers, electricians, landscapers, cleaners, restoration companies, and other home service businesses.",
    h1: "Missed Call Calculators for Home Services",
    verticalNoun: "home services",
    intro: "See how much revenue missed calls may be costing your home services business.",
    problem: "Missed calls turn paid demand into lost jobs. Emergency repairs, seasonal spikes, estimate requests, and after-hours calls all create moments where speed decides who wins the customer.",
    categoryHeading: "Home Service Calculator Library",
    ctaHeadline: "Ready to recover more home service calls?",
    ctaCopy: "Choose a calculator, model the revenue at risk, then let C0D3AI help you deploy AI voice agents, missed-call text-back, and follow-up systems that respond before buyers move on.",
    cta: "Try a home services missed call calculator"
  },
  real_estate: {
    label: "Real Estate",
    route: "real-estate",
    eyebrow: "C0D3AI // Real Estate Lead Response Calculators",
    title: "Real Estate Missed Call Calculators | C0D3AI",
    description: "Missed call calculators for real estate agents, brokers, investors, property managers, loan officers, title companies, and other real estate teams.",
    h1: "Missed Call Calculators for Real Estate",
    verticalNoun: "real estate",
    intro: "See how much revenue missed calls may be costing your real estate business.",
    problem: "A missed call can mean a lost buyer consultation, seller appointment, lease opportunity, financing conversation, or property management lead. Response speed protects pipeline value.",
    categoryHeading: "Real Estate Calculator Library",
    ctaHeadline: "Ready to capture more real estate leads?",
    ctaCopy: "Choose a calculator, model the opportunity cost, then let C0D3AI help you deploy AI voice agents and follow-up workflows that engage leads before they contact another team.",
    cta: "Try a real estate missed call calculator"
  },
  legal: {
    label: "Legal",
    route: "legal",
    eyebrow: "C0D3AI // Legal Intake Missed Call Calculators",
    title: "Legal Missed Call Calculators | C0D3AI",
    description: "Missed call calculators for personal injury attorneys, criminal defense lawyers, family law firms, estate planning attorneys, and other legal practices.",
    h1: "Missed Call Calculators for Law Firms",
    verticalNoun: "legal",
    intro: "See how much revenue missed calls may be costing your legal business.",
    problem: "Missed legal calls can cost consultations, signed matters, and high-value cases. Intake speed matters because urgency, trust, and first response shape who wins the client.",
    categoryHeading: "Legal Calculator Library",
    ctaHeadline: "Ready to capture more legal intake calls?",
    ctaCopy: "Choose a calculator, model missed-call exposure, then let C0D3AI help you deploy AI intake and missed-call recovery systems for your firm.",
    cta: "Try a legal missed call calculator"
  }
};

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function titleCaseFromSlug(slug) {
  return slug
    .replace(/-missed-calls$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractService(html, slug) {
  const titleMatch = html.match(/<title>Missed Call Calculator for ([^|<]+)\s*\|\s*C0D3AI<\/title>/i);
  if (titleMatch) return stripTags(titleMatch[1]);

  const h1Match = html.match(/<h1[^>]*>Missed Call Calculator\s*<span[^>]*>\s*for\s*([^<]+)<\/span><\/h1>/i);
  if (h1Match) return stripTags(h1Match[1]);

  return titleCaseFromSlug(slug);
}

function extractMetaDescription(html, service) {
  const match = html.match(/<meta name="description" content="([^"]+)"/i);
  return match ? match[1] : `Free missed call calculator for ${service}.`;
}

function extractPainStatement(html, service) {
  const quoteMatch = html.match(/<div class="panel quote"><p>([\s\S]*?)<\/p><\/div>/i);
  if (quoteMatch) return stripTags(quoteMatch[1]);

  const leadMatch = html.match(/<p class="lead">([\s\S]*?)<\/p>/i);
  if (leadMatch) return stripTags(leadMatch[1]);

  return `Missed calls can turn into lost revenue for ${service}.`;
}

function extractNumberFromInput(html, id) {
  const match = html.match(new RegExp(`<input id="${id}"[^>]*value="([0-9]+)"`, "i"));
  return match ? Number(match[1]) : 0;
}

function inferVertical(html, slug) {
  if (/real-estate|realtor|agent|broker|property|mortgage|loan-officer|title-compan|escrow|leasing|appraiser|photograph|videograph|developer|investor|lender|hoa|airbnb|vacation-rental|transaction-coordinator|closing-agent|asset-manager|apartment-locator|relocation/i.test(slug)) {
    return "real_estate";
  }

  if (/Legal Intake Response Tool|legal missed call|law firm intake|Average Case Value/i.test(html)) {
    return "legal";
  }

  if (/Real Estate Lead Response Tool|real estate missed call|Average Commission|Capture Every Lead/i.test(html)) {
    return "real_estate";
  }

  return "home_services";
}

function getCalculatorPages() {
  return getAllCalculatorPages()
    .map((page) => ({
      ...page,
      description: page.copy.hero,
      pain_statement: page.copy.math || page.copy.problem
    }))
    .sort((a, b) => a.service.localeCompare(b.service) || a.slug.localeCompare(b.slug));
}

function groupForSections(pages) {
  return pages.reduce((groups, page) => {
    const letter = /^[A-Z0-9]/.test(page.service.charAt(0).toUpperCase())
      ? page.service.charAt(0).toUpperCase()
      : "#";
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(page);
    return groups;
  }, {});
}

function renderPageCard(page) {
  return [
    `          <li class="calc-card">`,
    `            <a href="${BASE_URL}${escapeHTML(page.slug)}">`,
    `              <span class="meta">Average value: $${page.avg_job_value.toLocaleString("en-US")}</span>`,
    `              <strong>${escapeHTML(page.service)}</strong>`,
    `              <small>${escapeHTML(page.pain_statement)}</small>`,
    `              <em>Open calculator</em>`,
    `            </a>`,
    `          </li>`
  ].join("\n");
}

function renderCategorySections(pages) {
  const groups = groupForSections(pages);

  return Object.keys(groups).sort().map((letter) => {
    const cards = groups[letter].map(renderPageCard).join("\n");
    return [
      `      <section class="category-section panel">`,
      `        <div class="category-head">`,
      `          <span class="meta">Category ${escapeHTML(letter)}</span>`,
      `          <h3>${escapeHTML(letter)}</h3>`,
      `        </div>`,
      `        <ul class="calculator-list">`,
      cards,
      `        </ul>`,
      `      </section>`
    ].join("\n");
  }).join("\n");
}

function renderVerticalLinks(currentVertical) {
  return Object.keys(HUBS)
    .filter((vertical) => vertical !== currentVertical)
    .map((vertical) => {
      const hub = HUBS[vertical];
      return `<a href="${BASE_URL}${hub.route}">${escapeHTML(hub.label)} calculators</a>`;
    })
    .join("");
}

function renderHubPage(vertical, pages) {
  const hub = HUBS[vertical];
  const avgValue = pages.length
    ? Math.round(pages.reduce((sum, page) => sum + page.avg_job_value, 0) / pages.length)
    : 0;
  const totalMissedCalls = pages.reduce((sum, page) => sum + page.missed_calls_per_day, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(hub.title)}</title>
  <meta name="description" content="${escapeHTML(hub.description)}">
  <meta name="keywords" content="missed call calculator, ${escapeHTML(hub.label.toLowerCase())} missed calls, lost revenue calculator, AI answering service">
  <meta name="author" content="C0D3AI Systems">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}${BASE_URL}${hub.route}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}${BASE_URL}${hub.route}">
  <meta property="og:title" content="${escapeHTML(hub.title)}">
  <meta property="og:description" content="${escapeHTML(hub.description)}">
  <meta property="og:image" content="${SITE_URL}/COD3AI%20LOGO%207.png">
  <meta name="twitter:card" content="summary_large_image">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-W4GC6JNEDK"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-W4GC6JNEDK');</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--green:#00ff41;--red:#ff4d5e;--panel:rgba(255,255,255,.055);--border:rgba(255,255,255,.13);--muted:rgba(255,255,255,.62)}
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(65,38,116,.38),transparent 35rem),radial-gradient(circle at 92% 14%,rgba(0,255,65,.08),transparent 30rem),#09070d;color:#fff;font-family:Inter,system-ui,sans-serif;overflow-x:hidden}
    a{color:inherit}a:focus-visible{outline:2px solid var(--green);outline-offset:4px}
    .nav{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:50;width:min(1180px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 18px;border:1px solid var(--border);border-radius:999px;background:rgba(5,5,7,.88);backdrop-filter:blur(18px)}
    .brand{display:flex;align-items:center;gap:10px;text-decoration:none}.dot{width:10px;height:10px;border-radius:99px;background:var(--green);box-shadow:0 0 18px var(--green)}.brand img{height:25px;width:auto}.navlinks{display:flex;gap:22px}.navlinks a{color:rgba(255,255,255,.6);font-size:11px;font-weight:800;letter-spacing:.13em;text-decoration:none;text-transform:uppercase}
    .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:999px;background:var(--green);color:#020403;font-size:12px;font-weight:900;letter-spacing:.06em;text-decoration:none;text-transform:uppercase}
    main{width:min(1080px,calc(100% - 32px));margin:0 auto;padding:122px 0 84px}.eyebrow,.meta{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.42)}.eyebrow{color:var(--green)}
    h1{margin:16px 0 22px;font-size:clamp(2.45rem,6vw,5rem);line-height:.94;letter-spacing:0;font-weight:900}.sub{color:rgba(255,255,255,.25)}.lead{max-width:760px;color:var(--muted);font-size:1.08rem;line-height:1.75}
    .panel{border:1px solid var(--border);border-radius:8px;background:var(--panel);backdrop-filter:blur(20px);box-shadow:0 28px 80px rgba(0,0,0,.24)}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:34px}.stat{padding:22px}.num{margin-top:10px;font-size:clamp(1.8rem,4vw,3rem);font-weight:900;line-height:.95;color:var(--green)}.note{margin-top:10px;color:rgba(255,255,255,.42);font-size:12px;line-height:1.45}
    .section{max-width:960px;margin:58px auto 0}.section h2{margin:0 0 18px;font-size:clamp(1.65rem,3vw,2.35rem);line-height:1.08}.section p{color:var(--muted);font-size:1rem;line-height:1.78}.quote{padding:24px;border-left:3px solid var(--green)}
    .featured-links,.hub-links{display:flex;flex-wrap:wrap;gap:10px}.featured-links a,.hub-links a{display:inline-flex;align-items:center;min-height:38px;padding:0 14px;border:1px solid var(--border);border-radius:99px;color:rgba(255,255,255,.72);font-size:12px;font-weight:800;text-decoration:none}.featured-links a:hover,.hub-links a:hover{border-color:var(--green);color:white}
    .category-grid{display:grid;gap:18px;margin-top:24px}.category-section{padding:22px}.category-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:16px}.category-head h3{margin:0;font-size:1.7rem}.calculator-list{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;list-style:none;margin:0;padding:0}.calc-card a{display:flex;min-height:164px;flex-direction:column;padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.035);text-decoration:none}.calc-card a:hover{border-color:rgba(0,255,65,.45);background:rgba(0,255,65,.055)}.calc-card strong{display:block;margin-top:10px;font-size:1.08rem;line-height:1.25}.calc-card small{display:block;margin-top:10px;color:rgba(255,255,255,.56);line-height:1.5}.calc-card em{margin-top:auto;padding-top:16px;color:var(--green);font-size:12px;font-style:normal;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .cta{text-align:center;padding:42px 26px;border-color:rgba(0,255,65,.22);background:rgba(0,255,65,.04)}footer{padding:44px 24px;border-top:1px solid rgba(255,255,255,.07);text-align:center;color:rgba(255,255,255,.25);font-size:11px}
    @media(max-width:900px){.navlinks{display:none}.stats,.calculator-list{grid-template-columns:1fr}.brand img{max-width:110px}}@media(max-width:560px){main{width:min(100% - 24px,1080px);padding-top:106px}.brand img{display:none}.btn{padding:0 14px;font-size:11px}.category-head{display:block}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
  </style>
</head>
<body>
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="https://cod3ai.com"><span class="dot" aria-hidden="true"></span><img src="../COD3AI LOGO 8.png" alt="C0D3AI"><strong>C0D3AI</strong></a>
    <div class="navlinks"><a href="https://cod3ai.com/solutions">Solutions</a><a href="https://cod3ai.com/pricing">Pricing</a><a href="https://cod3ai.com/roi-calculator">ROI Calculator</a></div>
    <a class="btn" href="#calculators">${escapeHTML(hub.cta)}</a>
  </nav>
  <main>
    <section>
      <div class="eyebrow">${escapeHTML(hub.eyebrow)}</div>
      <h1>${escapeHTML(hub.h1)}</h1>
      <p class="lead">${escapeHTML(hub.intro)}</p>
      <div class="stats">
        <div class="panel stat"><div class="meta">Calculators</div><div class="num">${pages.length}</div><div class="note">pages in this vertical</div></div>
        <div class="panel stat"><div class="meta">Avg Value</div><div class="num">$${avgValue.toLocaleString("en-US")}</div><div class="note">average default job, deal, or case value</div></div>
        <div class="panel stat"><div class="meta">Missed Calls</div><div class="num">${totalMissedCalls}</div><div class="note">combined default missed calls per day</div></div>
      </div>
    </section>

    <section class="section">
      <h2>Why missed calls matter in ${escapeHTML(hub.verticalNoun)}</h2>
      <p>${escapeHTML(hub.problem)}</p>
      <div class="panel quote"><p>Start with a calculator below to estimate daily, monthly, annual, and five-year missed-call exposure for a specific ${escapeHTML(hub.verticalNoun)} profession.</p></div>
    </section>

    <section id="calculators" class="section">
      <h2>Browse calculators by profession</h2>
      <p>Every card below is generated from the existing missed call calculator pages in this vertical and links directly to the matching calculator.</p>
      <div class="category-grid">
${renderCategorySections(pages)}
      </div>
    </section>

    <section class="section panel" style="padding:24px">
      <h2>Related industries</h2>
      <div class="hub-links">${renderVerticalLinks(vertical)}</div>
    </section>

    <section class="section panel cta">
      <div class="eyebrow">Stop losing revenue from unanswered calls</div>
      <h2>${escapeHTML(hub.ctaHeadline)}</h2>
      <p>${escapeHTML(hub.ctaCopy)}</p>
      <a class="btn" href="#calculators">${escapeHTML(hub.cta)}</a>
    </section>
  </main>
  <footer><a href="https://cod3ai.com"><img src="../COD3AI LOGO 8.png" alt="C0D3AI" style="height:28px;opacity:.72"></a><p>&copy; 2026 C0D3AI CONSULTING SYSTEMS</p></footer>
</body>
</html>
`;
}

function buildHubPages() {
  const pages = getCalculatorPages();
  const grouped = pages.reduce((acc, page) => {
    if (!acc[page.vertical]) acc[page.vertical] = [];
    acc[page.vertical].push(page);
    return acc;
  }, {});

  Object.keys(HUBS).forEach((vertical) => {
    const verticalPages = (grouped[vertical] || []).sort((a, b) => a.service.localeCompare(b.service) || a.slug.localeCompare(b.slug));
    const html = renderHubPage(vertical, verticalPages);
    fs.writeFileSync(path.join(OUT_DIR, `${HUBS[vertical].route}.html`), html);
    console.log(`${HUBS[vertical].route}.html: ${verticalPages.length} calculators`);
  });
}

if (require.main === module) {
  buildHubPages();
}

module.exports = {
  buildHubPages,
  getCalculatorPages,
  inferVertical
};
