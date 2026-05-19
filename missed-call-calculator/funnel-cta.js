(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MissedCallFunnelCTA = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function getFunnelTier(yearlyLoss) {
    var loss = Number(yearlyLoss) || 0;

    if (loss < 10000) {
      return {
        tier: "low",
        title: "Small Revenue Leaks Add Up",
        urgency: "Low urgency, but worth fixing early.",
        message: "Your missed-call loss is still manageable. This is the right time to learn where calls are leaking before the number gets expensive.",
        cta: "See How AI Can Help",
        recommended_action: "Educational content",
        badge: "Monitor",
        color_theme: "green"
      };
    }

    if (loss < 50000) {
      return {
        tier: "medium",
        title: "You're Losing Meaningful Revenue",
        urgency: "This is enough revenue to justify a recovery workflow.",
        message: "Missed calls are now costing enough to affect growth. A simple audit can show which calls, hours, and follow-up gaps are causing the leak.",
        cta: "Get a Free Missed Call Audit",
        recommended_action: "Lead capture form",
        badge: "Meaningful Loss",
        color_theme: "yellow"
      };
    }

    if (loss < 250000) {
      return {
        tier: "high",
        title: "Revenue Is Slipping Through The Cracks",
        urgency: "Your missed-call exposure is large enough to prioritize now.",
        message: "At this level, unanswered calls may be costing more than a dedicated AI follow-up system. You should see how an AI agent would recover and route these opportunities.",
        cta: "Book Your AI Agent Demo",
        recommended_action: "Calendar booking",
        badge: "High Priority",
        color_theme: "orange"
      };
    }

    return {
      tier: "critical",
      title: "Critical Revenue Loss Detected",
      urgency: "This is urgent. Every week of delay may be expensive.",
      message: "Your missed-call exposure is in critical territory. C0D3AI should review your intake, missed-call, and follow-up process as a priority workflow.",
      cta: "Speak With C0D3AI Immediately",
      recommended_action: "Priority consultation",
      badge: "Critical",
      color_theme: "red"
    };
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderFunnelCTA(funnelData) {
    var data = funnelData || getFunnelTier(0);

    return [
      '<section class="funnel-cta funnel-' + escapeHTML(data.color_theme) + '" data-funnel-tier="' + escapeHTML(data.tier) + '">',
      '  <div class="funnel-badge">' + escapeHTML(data.badge) + '</div>',
      '  <h2>' + escapeHTML(data.title) + '</h2>',
      '  <p class="funnel-urgency">' + escapeHTML(data.urgency) + '</p>',
      '  <p>' + escapeHTML(data.message) + '</p>',
      '  <a class="btn funnel-button" href="#leadCapture">' + escapeHTML(data.cta) + '</a>',
      '  <div class="funnel-action"><span>Recommended next step:</span> ' + escapeHTML(data.recommended_action) + '</div>',
      '</section>'
    ].join("\\n");
  }

  return {
    getFunnelTier: getFunnelTier,
    renderFunnelCTA: renderFunnelCTA
  };
});
