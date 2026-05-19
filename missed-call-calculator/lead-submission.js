(function (root) {
  "use strict";

  function cleanText(value) {
    return String(value || "").trim();
  }

  function cleanNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function validateLead(leadData) {
    var errors = [];

    if (!cleanText(leadData.name)) errors.push("Name is required.");
    if (!cleanText(leadData.email)) errors.push("Email is required.");
    if (cleanText(leadData.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(leadData.email))) {
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
        message = "Lead capture is not configured yet. Please email C0D3AI directly and we will review your numbers.";
      }

      return {
        success: false,
        error: message
      };
    }
  }

  root.submitMissedCallLead = submitMissedCallLead;
  root.C0D3AILeadSubmission = {
    submitMissedCallLead: submitMissedCallLead,
    validateLead: validateLead,
    normalizeLead: normalizeLead
  };
})(window);
