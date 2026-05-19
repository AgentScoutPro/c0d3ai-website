const { generateCalculatorPages } = require("./generate-calculator-pages");
const { buildHubPages } = require("./generate-vertical-hubs");
const { generateSitemap } = require("./generate-sitemap");

generateCalculatorPages();
buildHubPages();
generateSitemap();
