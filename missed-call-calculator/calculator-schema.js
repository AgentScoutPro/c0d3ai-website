(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MissedCallCalculatorSchema = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var SITE_URL = "https://cod3ai.com";
  var BASE_PATH = "/missed-call-calculator/";

  function normalizePage(page) {
    return {
      service: String(page.service || "").trim(),
      slug: String(page.slug || "").trim(),
      vertical: String(page.vertical || "").trim(),
      avg_job_value: Number(page.avg_job_value) || 0,
      missed_calls_per_day: Number(page.missed_calls_per_day) || 0,
      copy: page.copy || {}
    };
  }

  function pageUrl(page) {
    return SITE_URL + BASE_PATH + page.slug;
  }

  function verticalLabel(vertical) {
    return String(vertical || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function serviceLower(page) {
    return page.service.charAt(page.service.length - 1).toLowerCase() === "s"
      ? page.service
      : page.service + " businesses";
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  function faqAnswerForCost(page) {
    var daily = page.avg_job_value * page.missed_calls_per_day;
    var annual = daily * 260;

    if (page.copy.math) return page.copy.math;

    return "At the default settings, " + page.missed_calls_per_day +
      " missed calls per day at an average value of " + money(page.avg_job_value) +
      " creates about " + money(daily) + " in daily missed-call exposure and about " +
      money(annual) + " per year.";
  }

  function faqAnswerForWhy(page) {
    if (page.copy.problem) return page.copy.problem;
    if (page.copy.industry) return page.copy.industry;

    return serviceLower(page) + " often miss calls during jobs, appointments, showings, consultations, after-hours demand, seasonal spikes, or busy intake windows.";
  }

  function faqAnswerForRecovery(page) {
    if (page.copy.cta) return page.copy.cta;

    return serviceLower(page) + " can stop losing leads from missed calls by using AI voice agents, instant missed-call text-back, qualification workflows, and automated booking follow-up.";
  }

  function generateCalculatorSchema(inputPage) {
    var page = normalizePage(inputPage);
    var url = pageUrl(page);
    var name = "Missed Call Calculator for " + page.service;
    var description = page.copy.hero ||
      "Free missed call calculator for " + page.service + ". Estimate revenue lost from missed calls and model how much AI follow-up could recover.";
    var organization = {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      "name": "C0D3AI",
      "url": SITE_URL,
      "logo": SITE_URL + "/COD3AI%20LOGO%207.png"
    };
    var applicationId = url + "#software";
    var faqId = url + "#faq";

    return {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebPage",
          "@id": url + "#webpage",
          "url": url,
          "name": name + " | C0D3AI",
          "description": description,
          "isPartOf": {
            "@type": "WebSite",
            "@id": SITE_URL + "/#website",
            "name": "C0D3AI",
            "url": SITE_URL
          },
          "publisher": {
            "@id": SITE_URL + "/#organization"
          },
          "about": [
            {
              "@type": "Thing",
              "name": "Missed call revenue"
            },
            {
              "@type": "Thing",
              "name": verticalLabel(page.vertical)
            }
          ],
          "mainEntity": {
            "@id": applicationId
          }
        },
        {
          "@type": "SoftwareApplication",
          "@id": applicationId,
          "name": name,
          "url": url,
          "description": description,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "browserRequirements": "Requires JavaScript",
          "isAccessibleForFree": true,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "provider": {
            "@id": SITE_URL + "/#organization"
          },
          "publisher": {
            "@id": SITE_URL + "/#organization"
          },
          "audience": {
            "@type": "BusinessAudience",
            "name": page.service
          }
        },
        {
          "@type": "FAQPage",
          "@id": faqId,
          "url": url,
          "name": name + " FAQs",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much do missed calls cost " + page.service + "?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faqAnswerForCost(page)
              }
            },
            {
              "@type": "Question",
              "name": "Why do " + page.service + " businesses miss calls?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faqAnswerForWhy(page)
              }
            },
            {
              "@type": "Question",
              "name": "How can " + page.service + " businesses stop losing leads from missed calls?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faqAnswerForRecovery(page)
              }
            }
          ]
        }
      ]
    };
  }

  function safeJson(schema) {
    return JSON.stringify(schema, null, 2)
      .replace(/<\/script/gi, "<\\/script")
      .replace(/<!--/g, "<\\!--");
  }

  function renderSchemaTag(schema) {
    return [
      '<script type="application/ld+json" data-schema="missed-call-calculator">',
      safeJson(schema),
      "</script>"
    ].join("\n");
  }

  return {
    generateCalculatorSchema: generateCalculatorSchema,
    renderSchemaTag: renderSchemaTag
  };
});
