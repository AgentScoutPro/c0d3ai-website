const {
  generateInternalLinks,
  addInternalLinksToPages,
  renderInternalLinksHTML
} = require("./internal-links");

const samplePages = [
  {
    service: "Plumbers",
    slug: "plumbers-missed-calls",
    vertical: "home_services",
    avg_job_value: 350,
    missed_calls_per_day: 5,
    copy: {
      hero: "Missed calls cost plumbing companies booked jobs.",
      problem: "Emergency calls often go to the first company that answers.",
      math: "Five missed calls per day can become a major monthly loss.",
      industry: "Plumbing customers usually need urgent help.",
      cta: "Recover plumbing calls"
    }
  },
  {
    service: "Electricians",
    slug: "electricians-missed-calls",
    vertical: "home_services",
    avg_job_value: 450,
    missed_calls_per_day: 4,
    copy: {}
  },
  {
    service: "Roofers",
    slug: "roofers-missed-calls",
    vertical: "home_services",
    avg_job_value: 8500,
    missed_calls_per_day: 3,
    copy: {}
  },
  {
    service: "HVAC Companies",
    slug: "hvac-missed-calls",
    vertical: "home_services",
    avg_job_value: 1200,
    missed_calls_per_day: 6,
    copy: {}
  },
  {
    service: "Real Estate Agents",
    slug: "real-estate-agents-missed-calls",
    vertical: "real_estate",
    avg_job_value: 7500,
    missed_calls_per_day: 3,
    copy: {}
  },
  {
    service: "Property Managers",
    slug: "property-managers-missed-calls",
    vertical: "real_estate",
    avg_job_value: 2500,
    missed_calls_per_day: 4,
    copy: {}
  },
  {
    service: "Personal Injury Attorneys",
    slug: "personal-injury-attorneys-missed-calls",
    vertical: "legal",
    avg_job_value: 15000,
    missed_calls_per_day: 2,
    copy: {}
  },
  {
    service: "Criminal Defense Attorneys",
    slug: "criminal-defense-missed-calls",
    vertical: "legal",
    avg_job_value: 5000,
    missed_calls_per_day: 3,
    copy: {}
  }
];

const currentPage = samplePages[0];
const internalLinks = generateInternalLinks(currentPage, samplePages);

console.log(JSON.stringify(internalLinks, null, 2));
console.log("\n" + renderInternalLinksHTML(internalLinks));

const pagesWithLinks = addInternalLinksToPages(samplePages);
console.log("\nFirst page with internal_links:");
console.log(JSON.stringify(pagesWithLinks[0], null, 2));
