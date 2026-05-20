const fs = require("fs");
const path = require("path");
const { getAllCalculatorPages } = require("./page-data");

const OUT_FILE = path.join(__dirname, "index.html");
const BASE_URL = "/missed-call-calculator/";
const SITE_URL = "https://cod3ai.com";

const HUBS = {
  home_services: {
    label: "Home Services",
    route: "home-services",
    icon: "🏠",
    description: "Contractors, repair teams, restoration companies, cleaning crews, and home service operators."
  },
  real_estate: {
    label: "Real Estate",
    route: "real-estate",
    icon: "🏢",
    description: "Agents, brokers, investors, lenders, property managers, title teams, and real estate operators."
  },
  legal: {
    label: "Legal",
    route: "legal",
    icon: "⚖",
    description: "Law firms and intake teams that cannot afford to miss high-intent case calls."
  }
};

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function compactMoney(value) {
  if (value >= 1000000) return "$" + (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return "$" + Math.round(value / 1000) + "K";
  return "$" + Math.round(value).toLocaleString("en-US");
}

function annualLoss(page) {
  return page.avg_job_value * page.missed_calls_per_day * 260;
}

function getStats(pages) {
  const totalAnnual = pages.reduce((sum, page) => sum + annualLoss(page), 0);
  const verticalCounts = pages.reduce((counts, page) => {
    counts[page.vertical] = (counts[page.vertical] || 0) + 1;
    return counts;
  }, {});
  const mostVisitedIndustry = Object.keys(verticalCounts).sort((a, b) => verticalCounts[b] - verticalCounts[a])[0];
  const highestValuePage = pages.slice().sort((a, b) => b.avg_job_value - a.avg_job_value || a.service.localeCompare(b.service))[0];

  return {
    averageAnnualLoss: pages.length ? totalAnnual / pages.length : 0,
    mostVisitedIndustry,
    highestValuePage
  };
}

function renderHubCards(pages) {
  const counts = pages.reduce((acc, page) => {
    acc[page.vertical] = (acc[page.vertical] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(HUBS).map((vertical) => {
    const hub = HUBS[vertical];
    return `<a class="panel industry-card" href="${BASE_URL}${hub.route}">
      <span class="industry-icon" aria-hidden="true">${hub.icon}</span>
      <span class="meta">${counts[vertical] || 0} calculators</span>
      <h3>${escapeHTML(hub.label)}</h3>
      <p>${escapeHTML(hub.description)}</p>
      <strong>Browse ${escapeHTML(hub.label)}</strong>
    </a>`;
  }).join("\n");
}

function renderPopularCalculators(pages) {
  return pages
    .slice()
    .sort((a, b) => annualLoss(b) - annualLoss(a) || b.avg_job_value - a.avg_job_value || a.service.localeCompare(b.service))
    .slice(0, 8)
    .map((page) => `<a class="panel calculator-card" href="${BASE_URL}${escapeHTML(page.slug)}">
      <span class="meta">${escapeHTML(HUBS[page.vertical].label)}</span>
      <h3>${escapeHTML(page.service)}</h3>
      <p>${escapeHTML(page.copy.problem)}</p>
      <div class="card-metric">${compactMoney(annualLoss(page))}<span> estimated annual loss</span></div>
    </a>`)
    .join("\n");
}

function renderIndexPage() {
  const pages = getAllCalculatorPages();
  const stats = getStats(pages);
  const firstCalculator = pages.find((page) => page.slug === "plumbers-missed-calls") || pages[0];
  const highest = stats.highestValuePage;
  const mostVisited = HUBS[stats.mostVisitedIndustry] || HUBS.home_services;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Missed Call Calculator | See How Much Revenue Missed Calls Cost Your Business</title>
  <meta name="description" content="Use our free Missed Call Calculator to estimate how much revenue your business could be losing from unanswered calls. Home Services, Real Estate, Legal, and more.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}/missed-call-calculator">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/missed-call-calculator">
  <meta property="og:title" content="Free Missed Call Calculator | See How Much Revenue Missed Calls Cost Your Business">
  <meta property="og:description" content="Use our free Missed Call Calculator to estimate how much revenue your business could be losing from unanswered calls. Home Services, Real Estate, Legal, and more.">
  <meta property="og:image" content="${SITE_URL}/COD3AI%20LOGO%207.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--green:#00ff41;--red:#ff4d5e;--panel:rgba(255,255,255,.055);--border:rgba(255,255,255,.13);--muted:rgba(255,255,255,.62)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(65,38,116,.38),transparent 35rem),radial-gradient(circle at 92% 14%,rgba(0,255,65,.08),transparent 30rem),#09070d;color:#fff;font-family:Inter,system-ui,sans-serif;overflow-x:hidden}
    a{color:inherit}a:focus-visible{outline:2px solid var(--green);outline-offset:4px}.nav{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:50;width:min(1180px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 18px;border:1px solid var(--border);border-radius:999px;background:rgba(5,5,7,.88);backdrop-filter:blur(18px)}
    .brand{display:flex;align-items:center;gap:10px;text-decoration:none}.dot{width:10px;height:10px;border-radius:99px;background:var(--green);box-shadow:0 0 18px var(--green)}.brand img{height:25px;width:auto}.navlinks{display:flex;gap:22px}.navlinks a{color:rgba(255,255,255,.6);font-size:11px;font-weight:800;letter-spacing:.13em;text-decoration:none;text-transform:uppercase}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:999px;background:var(--green);color:#020403;font-size:12px;font-weight:900;letter-spacing:.06em;text-decoration:none;text-transform:uppercase}.btn.secondary{background:transparent;color:white;border:1px solid var(--border)}
    main{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:122px 0 84px}.eyebrow,.meta{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.42)}.eyebrow{color:var(--green)}h1{max-width:900px;margin:16px 0 22px;font-size:clamp(2.6rem,7vw,5.6rem);line-height:.92;letter-spacing:0;font-weight:900}.lead{max-width:720px;color:var(--muted);font-size:1.12rem;line-height:1.75}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.panel{border:1px solid var(--border);border-radius:8px;background:var(--panel);backdrop-filter:blur(20px);box-shadow:0 28px 80px rgba(0,0,0,.24)}
    .section{margin-top:72px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:20px}.section h2{margin:0;font-size:clamp(1.8rem,3.3vw,2.8rem);line-height:1.04}.section p{color:var(--muted);line-height:1.7}.three-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.info-card,.industry-card,.calculator-card,.stat-card{padding:22px;text-decoration:none}.info-card strong,.industry-card strong{display:block;margin-top:18px;color:var(--green);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.info-card h3,.industry-card h3,.calculator-card h3{margin:12px 0 10px;font-size:1.25rem}.industry-icon{display:inline-flex;width:44px;height:44px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.05);font-size:1.35rem}.calculator-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.calculator-card{min-height:248px;display:flex;flex-direction:column}.calculator-card:hover,.industry-card:hover{border-color:rgba(0,255,65,.45);background:rgba(0,255,65,.055)}.calculator-card p{font-size:13px}.card-metric{margin-top:auto;color:var(--green);font-weight:900}.card-metric span{display:block;margin-top:4px;color:rgba(255,255,255,.45);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.stat-value{margin-top:12px;color:var(--green);font-size:clamp(2rem,4vw,3.3rem);font-weight:900;line-height:.95}.cta{text-align:center;padding:46px 26px;border-color:rgba(0,255,65,.22);background:rgba(0,255,65,.04)}footer{padding:44px 24px;border-top:1px solid rgba(255,255,255,.07);text-align:center;color:rgba(255,255,255,.25);font-size:11px}
    @media(max-width:960px){.navlinks{display:none}.three-grid,.calculator-grid,.stat-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){main{width:min(100% - 24px,1120px);padding-top:106px}.brand img{display:none}.three-grid,.calculator-grid,.stat-grid{grid-template-columns:1fr}.section-head{display:block}.btn{width:100%}.hero-actions{width:100%}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
  </style>
</head>
<body>
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="https://cod3ai.com"><span class="dot" aria-hidden="true"></span><img src="../COD3AI LOGO 8.png" alt="C0D3AI"><strong>C0D3AI</strong></a>
    <div class="navlinks"><a href="#how">How It Works</a><a href="#industries">Industries</a><a href="#popular">Popular</a></div>
    <a class="btn" href="${BASE_URL}${escapeHTML(firstCalculator.slug)}">Try the Calculator</a>
  </nav>
  <main>
    <section class="hero">
      <div class="eyebrow">C0D3AI // Free Missed Call Calculator</div>
      <h1>How Much Are Missed Calls Costing Your Business?</h1>
      <p class="lead">Discover how missed calls may be quietly costing you thousands in lost revenue.</p>
      <div class="hero-actions">
        <a class="btn" href="${BASE_URL}${escapeHTML(firstCalculator.slug)}">Try the Calculator</a>
        <a class="btn secondary" href="#industries">Browse Industries</a>
      </div>
    </section>

    <section class="section" id="how">
      <div class="section-head"><div><span class="eyebrow">How It Works</span><h2>Three inputs. A clearer revenue picture.</h2></div></div>
      <div class="three-grid">
        <div class="panel info-card"><span class="meta">01</span><h3>Enter missed calls</h3><p>Start with how many inbound calls go unanswered on an average business day.</p><strong>Call volume</strong></div>
        <div class="panel info-card"><span class="meta">02</span><h3>Enter average job value</h3><p>Use your normal job, case, commission, or deal value to model real opportunity cost.</p><strong>Revenue value</strong></div>
        <div class="panel info-card"><span class="meta">03</span><h3>See potential revenue loss</h3><p>Estimate daily, monthly, yearly, and five-year loss from missed inbound demand.</p><strong>Loss estimate</strong></div>
      </div>
    </section>

    <section class="section" id="industries">
      <div class="section-head"><div><span class="eyebrow">Browse by Industry</span><h2>Pick the calculator closest to your business.</h2></div></div>
      <div class="three-grid">
        ${renderHubCards(pages)}
      </div>
    </section>

    <section class="section" id="popular">
      <div class="section-head"><div><span class="eyebrow">Popular Calculators</span><h2>High-value missed call calculators.</h2></div></div>
      <div class="calculator-grid">
        ${renderPopularCalculators(pages)}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><span class="eyebrow">Revenue Loss Statistics</span><h2>What the calculator library shows.</h2></div></div>
      <div class="stat-grid">
        <div class="panel stat-card"><span class="meta">Average annual loss</span><div class="stat-value">${compactMoney(stats.averageAnnualLoss)}</div><p>Average modeled annual exposure across all calculator pages.</p></div>
        <div class="panel stat-card"><span class="meta">Most visited industry</span><div class="stat-value">${escapeHTML(mostVisited.label)}</div><p>The largest calculator library by available profession pages.</p></div>
        <div class="panel stat-card"><span class="meta">Highest-value profession</span><div class="stat-value">${escapeHTML(highest.service)}</div><p>${compactMoney(highest.avg_job_value)} average value used in the calculator model.</p></div>
      </div>
    </section>

    <section class="section panel cta">
      <div class="eyebrow">Stop Losing Revenue</div>
      <h2>Turn missed calls into a measurable recovery plan.</h2>
      <p>Choose a calculator, estimate the revenue at risk, and send your result to C0D3AI for a practical missed-call recovery plan.</p>
      <a class="btn" href="${BASE_URL}${escapeHTML(firstCalculator.slug)}">Get Started</a>
    </section>
  </main>
  <footer><a href="https://cod3ai.com"><img src="../COD3AI LOGO 8.png" alt="C0D3AI" style="height:28px;opacity:.72"></a><p>&copy; 2026 C0D3AI CONSULTING SYSTEMS</p></footer>
</body>
</html>
`;
}

function generateIndexPage() {
  fs.writeFileSync(OUT_FILE, renderIndexPage());
  console.log("Generated missed-call-calculator/index.html.");
}

if (require.main === module) {
  generateIndexPage();
}

module.exports = {
  generateIndexPage,
  renderIndexPage
};
