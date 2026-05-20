(function (root) {
  "use strict";

  var CONTACT_EMAIL = "kolby@c0d3ai.com";

  function cleanText(value) {
    return String(value || "").trim();
  }

  function cleanNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
  }

  function validateLead(leadData) {
    var errors = [];

    if (!cleanText(leadData.name)) errors.push("Name is required.");
    if (!cleanText(leadData.email)) errors.push("Email is required.");
    if (cleanText(leadData.email) && !isValidEmail(leadData.email)) {
      errors.push("Enter a valid email address.");
    }
    if (cleanText(leadData.website)) errors.push("Spam protection rejected this submission.");

    return errors;
  }

  function validateReportLead(leadData) {
    var errors = [];

    if (!cleanText(leadData.email)) errors.push("Email is required.");
    if (cleanText(leadData.email) && !isValidEmail(leadData.email)) {
      errors.push("Enter a valid email address.");
    }
    if (cleanText(leadData.website)) errors.push("Spam protection rejected this submission.");

    return errors;
  }

  function normalizeLead(leadData) {
    return {
      name: cleanText(leadData.name),
      business_name: cleanText(leadData.business_name) || null,
      phone: cleanText(leadData.phone) || null,
      email: cleanText(leadData.email),
      industry: cleanText(leadData.industry) || null,
      service: cleanText(leadData.service) || null,
      page_slug: cleanText(leadData.page_slug) || null,
      daily_loss: cleanNumber(leadData.daily_loss),
      monthly_loss: cleanNumber(leadData.monthly_loss),
      yearly_loss: cleanNumber(leadData.yearly_loss),
      funnel_tier: cleanText(leadData.funnel_tier) || null,
      source: "missed_call_calculator",
      status: "new",
      notes: cleanText(leadData.notes) || null
    };
  }

  function normalizeReportLead(leadData) {
    var service = cleanText(leadData.service);
    var vertical = cleanText(leadData.vertical || leadData.industry);
    var funnelTier = cleanText(leadData.funnel_tier);

    return {
      name: cleanText(leadData.name) || "PDF Report Download",
      business_name: cleanText(leadData.business_name) || null,
      phone: cleanText(leadData.phone) || null,
      email: cleanText(leadData.email),
      industry: vertical || null,
      service: service || null,
      page_slug: cleanText(leadData.page_slug) || null,
      daily_loss: cleanNumber(leadData.daily_loss),
      monthly_loss: cleanNumber(leadData.monthly_loss),
      yearly_loss: cleanNumber(leadData.yearly_loss),
      funnel_tier: funnelTier || null,
      source: "missed_call_calculator",
      status: "new",
      notes: "Downloaded gated Missed Call Revenue Report.",
      downloaded_report: "missed_call_revenue_report",
      report_type: "missed_call_calculator_report",
      download_requested: true,
      downloaded_at: new Date().toISOString(),
      marketing_tags: [
        "missed_call_calculator",
        "pdf_download",
        service,
        vertical,
        funnelTier
      ].filter(Boolean),
      lead_source: "missed_call_calculator_pdf_download"
    };
  }

  async function submitMissedCallLead(leadData) {
    var errors = validateLead(leadData || {});

    if (errors.length) {
      return {
        success: false,
        error: errors[0],
        validation_errors: errors
      };
    }

    try {
      var row = normalizeLead(leadData);
      var data = await root.C0D3AISupabase.insertSupabaseRow(row);

      return {
        success: true,
        data: data
      };
    } catch (error) {
      var message = error.message || "Something went wrong while saving your request.";
      if (/Supabase is not configured/i.test(message)) {
        message = "Lead capture is not configured yet. Please email " + CONTACT_EMAIL + " and we will review your numbers.";
      }

      return {
        success: false,
        error: message
      };
    }
  }

  async function submitReportDownloadLead(leadData) {
    var errors = validateReportLead(leadData || {});

    if (errors.length) {
      return {
        success: false,
        error: errors[0],
        validation_errors: errors
      };
    }

    try {
      var row = normalizeReportLead(leadData);
      var data = await root.C0D3AISupabase.insertSupabaseRow(row);

      return {
        success: true,
        data: data
      };
    } catch (error) {
      var message = error.message || "Something went wrong while saving your report request.";
      if (/Supabase is not configured/i.test(message)) {
        message = "Report download lead capture is not configured yet. Please email " + CONTACT_EMAIL + " and we will send your report.";
      }

      return {
        success: false,
        error: message
      };
    }
  }

  root.submitMissedCallLead = submitMissedCallLead;
  root.submitReportDownloadLead = submitReportDownloadLead;
  root.C0D3AILeadSubmission = {
    submitMissedCallLead: submitMissedCallLead,
    submitReportDownloadLead: submitReportDownloadLead,
    validateLead: validateLead,
    validateReportLead: validateReportLead,
    normalizeLead: normalizeLead,
    normalizeReportLead: normalizeReportLead
  };
})(window);
