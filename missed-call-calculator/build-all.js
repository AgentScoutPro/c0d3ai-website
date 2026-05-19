const { generateCalculatorPages } = require("./generate-calculator-pages");
const { buildHubPages } = require("./generate-vertical-hubs");
const { generateIndexPage } = require("./generate-index-page");
const { generatePageInspector } = require("./generate-page-inspector");
const { generateSitemap } = require("./generate-sitemap");

generateCalculatorPages();
buildHubPages();
generateIndexPage();
generatePageInspector();
generateSitemap();
