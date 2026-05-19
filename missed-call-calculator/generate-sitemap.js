const fs = require("fs");
const path = require("path");
const { getAllCalculatorPages } = require("./page-data");

const ROOT = path.resolve(__dirname, "..");

const STATIC_URLS = [
  "https://cod3ai.com/",
  "https://cod3ai.com/solutions",
  "https://cod3ai.com/case-studies",
  "https://cod3ai.com/pricing",
  "https://cod3ai.com/roi-calculator",
  "https://cod3ai.com/missed-call-calculator",
  "https://cod3ai.com/integrations",
  "https://cod3ai.com/sample-report",
  "https://cod3ai.com/live-dashboard",
  "https://cod3ai.com/healthcare-ai-automation",
  "https://cod3ai.com/real-estate-ai-automation",
  "https://cod3ai.com/gohighlevel-ai-automation",
  "https://cod3ai.com/ai-receptionist",
  "https://cod3ai.com/lease-abstraction-ai",
  "https://cod3ai.com/missed-call-calculator/home-services",
  "https://cod3ai.com/missed-call-calculator/real-estate",
  "https://cod3ai.com/missed-call-calculator/legal"
];

function generateSitemap() {
  const calculatorUrls = getAllCalculatorPages()
    .map((page) => `https://cod3ai.com/missed-call-calculator/${page.slug}`)
    .sort();
  const urls = STATIC_URLS.concat(calculatorUrls);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    ''
  ].join("\n");

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log(`Generated sitemap with ${urls.length} URLs.`);
}

if (require.main === module) {
  generateSitemap();
}

module.exports = {
  generateSitemap
};
