(function (root) {
  "use strict";

  var config = root.C0D3AI_SUPABASE_CONFIG || {};
  var tableName = "missed_call_calculator_leads";

  function getSupabaseConfig() {
    return {
      url: String(config.url || "").replace(/\/$/, ""),
      anonKey: String(config.anonKey || "")
    };
  }

  function isSupabaseConfigured() {
    var current = getSupabaseConfig();
    return Boolean(current.url && current.anonKey);
  }

  async function insertSupabaseRow(row) {
    var current = getSupabaseConfig();

    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured for this environment.");
    }

    var response = await fetch(current.url + "/rest/v1/" + tableName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": current.anonKey,
        "Authorization": "Bearer " + current.anonKey,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(row)
    });

    if (!response.ok) {
      var details = "";
      try {
        var error = await response.json();
        details = error.message || error.details || "";
      } catch (_) {
        details = await response.text();
      }

      throw new Error(details || "Supabase rejected the lead submission.");
    }

    return response.json();
  }

  root.C0D3AISupabase = {
    getSupabaseConfig: getSupabaseConfig,
    isSupabaseConfigured: isSupabaseConfigured,
    insertSupabaseRow: insertSupabaseRow
  };
})(window);
