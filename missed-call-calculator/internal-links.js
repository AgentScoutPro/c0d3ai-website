(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MissedCallInternalLinks = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var BASE_URL = "/missed-call-calculator/";
  var GROUP_SIZE = 3;
  var VERTICALS = {
    HOME_SERVICES: "home_services",
    REAL_ESTATE: "real_estate",
    LEGAL: "legal"
  };
  var VERTICAL_HUB_URLS = {
    home_services: "/missed-call-calculator/home-services",
    real_estate: "/missed-call-calculator/real-estate",
    legal: "/missed-call-calculator/legal"
  };

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

  function pageKey(page) {
    return page.slug || page.service + "|" + page.vertical;
  }

  function isCurrentPage(page, currentPage) {
    return pageKey(page) === pageKey(currentPage);
  }

  function byStableName(a, b) {
    return (
      a.service.localeCompare(b.service) ||
      a.slug.localeCompare(b.slug) ||
      a.vertical.localeCompare(b.vertical)
    );
  }

  function byHighValue(a, b) {
    return (
      b.avg_job_value - a.avg_job_value ||
      byStableName(a, b)
    );
  }

  function byVerticalThenName(a, b) {
    return (
      a.vertical.localeCompare(b.vertical) ||
      byStableName(a, b)
    );
  }

  function toLink(page) {
    return {
      title: "Missed Call Calculator for " + page.service,
      url: BASE_URL + page.slug,
      service: page.service,
      vertical: page.vertical
    };
  }

  function takeUnique(candidates, limit, used) {
    var selected = [];

    candidates.forEach(function (page) {
      var key = pageKey(page);
      if (selected.length >= limit || used.has(key)) return;
      used.add(key);
      selected.push(page);
    });

    return selected;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGroup(title, links) {
    if (!links || links.length === 0) return "";

    var items = links.map(function (link) {
      return '      <li><a href="' + escapeHTML(link.url) + '">' + escapeHTML(link.title) + "</a></li>";
    }).join("\n");

    return [
      '  <div class="related-group">',
      "    <h3>" + escapeHTML(title) + "</h3>",
      "    <ul>",
      items,
      "    </ul>",
      "  </div>"
    ].join("\n");
  }

  function generateInternalLinks(currentPage, allPages) {
    var current = normalizePage(currentPage);
    var pages = (allPages || [])
      .map(normalizePage)
      .filter(function (page) {
        return page.service && page.slug && page.vertical && !isCurrentPage(page, current);
      });

    var used = new Set();
    var sameVerticalCandidates = pages
      .filter(function (page) { return page.vertical === current.vertical; })
      .sort(byStableName);
    var crossVerticalCandidates = pages
      .filter(function (page) { return page.vertical !== current.vertical; })
      .sort(byVerticalThenName);
    var highValueCandidates = pages.slice().sort(byHighValue);

    var highValueRelated = takeUnique(highValueCandidates, GROUP_SIZE, used);

    var sameVertical = takeUnique(sameVerticalCandidates, GROUP_SIZE, used);
    if (sameVertical.length < GROUP_SIZE) {
      sameVertical = sameVertical.concat(
        takeUnique(crossVerticalCandidates, GROUP_SIZE - sameVertical.length, used)
      );
    }

    var crossVertical = takeUnique(crossVerticalCandidates, GROUP_SIZE, used);
    if (crossVertical.length < GROUP_SIZE) {
      crossVertical = crossVertical.concat(
        takeUnique(sameVerticalCandidates, GROUP_SIZE - crossVertical.length, used)
      );
    }

    return {
      same_vertical: sameVertical.map(toLink),
      high_value_related: highValueRelated.map(toLink),
      cross_vertical: crossVertical.map(toLink)
    };
  }

  function addInternalLinksToPages(allPages) {
    var pages = (allPages || []).map(normalizePage);

    return pages.map(function (page) {
      return Object.assign({}, page, {
        internal_links: generateInternalLinks(page, pages)
      });
    });
  }

  function renderInternalLinksHTML(internalLinks) {
    var links = internalLinks || {};
    var groups = [
      renderGroup("More in This Industry", links.same_vertical),
      renderGroup("High Value Missed Call Calculators", links.high_value_related),
      renderGroup("Other Industries Losing Revenue From Missed Calls", links.cross_vertical)
    ].filter(Boolean);

    if (groups.length === 0) return "";

    return [
      '<section class="related-calculators">',
      "  <h2>Related Missed Call Calculators</h2>",
      "",
      groups.join("\n\n"),
      "</section>"
    ].join("\n");
  }

  return {
    VERTICALS: VERTICALS,
    VERTICAL_HUB_URLS: VERTICAL_HUB_URLS,
    generateInternalLinks: generateInternalLinks,
    addInternalLinksToPages: addInternalLinksToPages,
    renderInternalLinksHTML: renderInternalLinksHTML
  };
});
