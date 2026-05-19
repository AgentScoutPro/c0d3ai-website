const fs = require("fs");
const path = require("path");
const { generateCalculatorSchema, renderSchemaTag } = require("./calculator-schema");
const { getCalculatorPages } = require("./generate-vertical-hubs");

const OUT_DIR = __dirname;
const SCHEMA_RE = /\n?\s*<script type="application\/ld\+json" data-schema="missed-call-calculator">[\s\S]*?<\/script>/;

function pageCopyFromDerivedPage(page) {
  return {
    hero: page.description,
    problem: page.pain_statement,
    math: page.pain_statement,
    industry: page.description,
    cta: `Use the ${page.service} missed call calculator to model revenue exposure and decide where AI follow-up can recover more leads.`
  };
}

function renderForPage(page) {
  return renderSchemaTag(generateCalculatorSchema({
    service: page.service,
    slug: page.slug,
    vertical: page.vertical,
    avg_job_value: page.avg_job_value,
    missed_calls_per_day: page.missed_calls_per_day,
    copy: pageCopyFromDerivedPage(page)
  }));
}

function injectSchema(html, schemaTag) {
  if (SCHEMA_RE.test(html)) {
    return html.replace(SCHEMA_RE, "\n" + schemaTag);
  }

  if (!html.includes("</head>")) {
    throw new Error("Cannot inject schema: missing </head>");
  }

  return html.replace("</head>", schemaTag + "</head>");
}

function updateCalculatorSchema() {
  const pages = getCalculatorPages();

  pages.forEach((page) => {
    const filePath = path.join(OUT_DIR, `${page.slug}.html`);
    const html = fs.readFileSync(filePath, "utf8");
    const nextHtml = injectSchema(html, renderForPage(page));
    fs.writeFileSync(filePath, nextHtml);
  });

  console.log(`Updated schema on ${pages.length} missed call calculator pages.`);
}

if (require.main === module) {
  updateCalculatorSchema();
}

module.exports = {
  updateCalculatorSchema,
  renderForPage,
  injectSchema
};
