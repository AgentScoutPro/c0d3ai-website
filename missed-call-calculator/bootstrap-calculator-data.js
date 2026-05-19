const fs = require("fs");
const path = require("path");
const { getCalculatorPages } = require("./generate-vertical-hubs");

const OUT_DIR = __dirname;
const DATA_PATH = path.join(OUT_DIR, "calculator-pages.json");

function copyFromPage(page) {
  return {
    hero: page.description,
    problem: page.pain_statement,
    math: page.pain_statement,
    industry: page.description,
    cta: `Use the ${page.service} missed call calculator to estimate lost revenue and plan an AI missed-call recovery system.`
  };
}

function bootstrapCalculatorData() {
  const pages = getCalculatorPages()
    .filter((page) => page.slug !== "real-estate-photography-missed-calls")
    .map((page) => ({
      service: page.service,
      slug: page.slug,
      vertical: page.vertical,
      avg_job_value: page.avg_job_value,
      missed_calls_per_day: page.missed_calls_per_day,
      copy: copyFromPage(page)
    }))
    .sort((a, b) => a.vertical.localeCompare(b.vertical) || a.service.localeCompare(b.service) || a.slug.localeCompare(b.slug));

  fs.writeFileSync(DATA_PATH, JSON.stringify(pages, null, 2) + "\n");
  console.log(`Wrote ${pages.length} pages to ${path.relative(process.cwd(), DATA_PATH)}`);
}

if (require.main === module) {
  bootstrapCalculatorData();
}

module.exports = {
  bootstrapCalculatorData
};
