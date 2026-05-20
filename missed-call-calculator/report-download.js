(function (root) {
  "use strict";

  var CONTACT_EMAIL = "kolby@c0d3ai.com";
  var CONTACT_PHONE = "(928) 793-8914";
  var REPORT_NAME = "Missed Call Revenue Report";

  function cleanText(value) {
    return String(value || "").trim();
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function titleCaseVertical(value) {
    return cleanText(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
  }

  function wrapText(text, maxLength) {
    var words = cleanText(text).split(/\s+/);
    var lines = [];
    var current = "";

    words.forEach(function (word) {
      var next = current ? current + " " + word : word;
      if (next.length > maxLength && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    return lines;
  }

  function escapePdfText(value) {
    return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  function addPdfLine(commands, text, x, y, size, font) {
    commands.push("BT /" + (font || "F1") + " " + size + " Tf " + x + " " + y + " Td (" + escapePdfText(text) + ") Tj ET");
  }

  function buildPdfDocument(lines) {
    var width = 612;
    var height = 792;
    var marginX = 54;
    var yStart = 724;
    var y = yStart;
    var pageCommands = [];
    var pages = [];

    function newPage() {
      if (pageCommands.length) pages.push(pageCommands);
      pageCommands = [];
      y = yStart;
    }

    lines.forEach(function (line) {
      var size = line.size || 10;
      var leading = line.leading || Math.ceil(size * 1.45);
      var font = line.bold ? "F2" : "F1";
      var maxLength = line.maxLength || (line.heading ? 62 : 86);
      var wrapped = line.blank ? [""] : wrapText(line.text, maxLength);

      wrapped.forEach(function (part, index) {
        if (y < 68) newPage();
        if (!line.blank) addPdfLine(pageCommands, part, marginX, y, size, font);
        y -= index === wrapped.length - 1 ? leading + (line.after || 0) : leading;
      });
    });

    if (pageCommands.length) pages.push(pageCommands);

    var objects = [];
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("<< /Type /Pages /Kids [" + pages.map(function (_, index) { return (3 + index * 2) + " 0 R"; }).join(" ") + "] /Count " + pages.length + " >>");

    pages.forEach(function (commands, index) {
      var pageObjectNumber = 3 + index * 2;
      var contentObjectNumber = pageObjectNumber + 1;
      var content = commands.join("\n");
      objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + width + " " + height + "] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents " + contentObjectNumber + " 0 R >>");
      objects.push("<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream");
    });

    var pdf = "%PDF-1.4\n";
    var offsets = [0];
    objects.forEach(function (object, index) {
      offsets.push(pdf.length);
      pdf += (index + 1) + " 0 obj\n" + object + "\nendobj\n";
    });

    var xrefOffset = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    offsets.slice(1).forEach(function (offset) {
      pdf += String(offset).padStart(10, "0") + " 00000 n \n";
    });
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF";

    return new Blob([pdf], { type: "application/pdf" });
  }

  function generateMissedCallReportPDF(data) {
    var report = data || {};
    var service = cleanText(report.service) || "Your Business";
    var vertical = titleCaseVertical(report.vertical || report.industry);
    var tier = cleanText(report.funnel_tier) || "not calculated";
    var daily = money(report.daily_loss);
    var monthly = money(report.monthly_loss);
    var yearly = money(report.yearly_loss);
    var lines = [
      { text: "C0D3AI", size: 13, bold: true, after: 4 },
      { text: REPORT_NAME, size: 24, bold: true, heading: true, after: 8 },
      { text: "Prepared for: " + service, size: 12, bold: true },
      { text: "Industry vertical: " + vertical, size: 11 },
      { text: "Call now: " + CONTACT_PHONE + " | Email: " + CONTACT_EMAIL, size: 10, after: 14 },
      { text: "Calculator Results", size: 16, bold: true, heading: true, after: 4 },
      { text: "Daily revenue loss: " + daily, size: 12, bold: true },
      { text: "Monthly revenue loss: " + monthly, size: 12, bold: true },
      { text: "Yearly revenue loss: " + yearly, size: 12, bold: true },
      { text: "Funnel tier: " + tier, size: 12, bold: true, after: 10 },
      { text: "What These Numbers Mean", size: 15, bold: true, heading: true, after: 4 },
      { text: "This report turns missed calls into a revenue conversation. The estimate shows how unanswered calls may affect pipeline, staffing, customer experience, and growth. It is not a final financial statement, but it gives your team a clear business case for improving response time and follow-up.", size: 10, after: 8 },
      { text: "Why The Data Matters", size: 15, bold: true, heading: true, after: 4 },
      { text: "Missed calls usually come from busy teams, after-hours demand, seasonal volume, ad campaigns, and handoffs between sales, dispatch, intake, or front office staff. When a prospect cannot reach you, the revenue risk is immediate because many buyers call the next available provider.", size: 10, after: 8 },
      { text: "How Executives Can Use This Report", size: 14, bold: true, heading: true },
      { text: "Use the yearly revenue exposure to prioritize missed-call recovery as a growth and operational resilience initiative.", size: 10, after: 6 },
      { text: "How Management Can Use This Report", size: 14, bold: true, heading: true },
      { text: "Use the daily and monthly loss estimates to review coverage gaps, response times, follow-up consistency, and appointment booking workflows.", size: 10, after: 6 },
      { text: "How Finance Teams Can Use This Report", size: 14, bold: true, heading: true },
      { text: "Use the annualized estimate to compare the cost of missed calls against staffing, automation, after-hours coverage, and AI agent investments.", size: 10, after: 6 },
      { text: "How Small Business Owners Can Use This Report", size: 14, bold: true, heading: true },
      { text: "Use the report to make a daily problem easier to see, explain, and act on without needing a complex analytics project.", size: 10, after: 8 },
      { text: "Positioning This Internally", size: 15, bold: true, heading: true, after: 4 },
      { text: "Share the report with leaders responsible for revenue, operations, customer experience, intake, and finance. Frame it as a response-time and lead-handling business case, not just a phone problem.", size: 10, after: 8 },
      { text: "Why Missed Call Recovery Matters", size: 15, bold: true, heading: true, after: 4 },
      { text: "Recovering missed calls protects demand you already paid to generate. AI voice agents, instant missed-call text-back, qualification, and booking follow-up can help keep high-intent prospects engaged before they choose another provider.", size: 10, after: 8 },
      { text: "Recommended Next Steps", size: 15, bold: true, heading: true, after: 4 },
      { text: "1. Review when calls are missed: business hours, after hours, weekends, or campaign spikes.", size: 10 },
      { text: "2. Estimate which missed calls are qualified opportunities.", size: 10 },
      { text: "3. Deploy instant response workflows for calls your team cannot answer live.", size: 10 },
      { text: "4. Use C0D3AI to map an AI agent, missed-call text-back, and booking workflow for " + service + ".", size: 10, after: 10 },
      { text: "C0D3AI Contact", size: 15, bold: true, heading: true, after: 4 },
      { text: "Call now: " + CONTACT_PHONE, size: 11, bold: true },
      { text: "Email: " + CONTACT_EMAIL, size: 11, bold: true }
    ];

    return buildPdfDocument(lines);
  }

  function downloadReportPDF(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename || "cod3ai-missed-call-report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function renderReportDownloadCTA() {
    return [
      '<section class="section panel report-cta" id="reportDownload">',
      '  <div class="eyebrow">Free PDF Report</div>',
      '  <h2>Turn This Data Into a Business Case</h2>',
      '  <p>Your missed call report gives your team more than a quick estimate. It gives executives, managers, finance teams, and small business owners a clear way to see how unanswered calls may be affecting revenue, staffing, customer experience, and growth.</p>',
      '  <p>Use this report to start better conversations about response time, lead handling, after hours coverage, sales follow up, and AI automation. For executives, it helps show where revenue may be leaking. For managers, it highlights operational gaps. For finance teams, it connects missed calls to measurable business impact. For small business owners, it turns a common daily problem into a simple revenue case that is easier to understand and act on.</p>',
      '  <p><strong>Download the free report, share it with your team, and use it to support smarter decisions around automation, staffing, and customer response.</strong></p>',
      '  <button class="btn report-download-button" id="reportDownloadButton" type="button">DOWNLOAD YOUR FREE REPORT HERE</button>',
      '  <div class="form-status" id="reportInlineStatus" role="status" aria-live="polite"></div>',
      '</section>'
    ].join("");
  }

  function renderReportEmailCaptureModal() {
    return [
      '<div class="report-modal" id="reportModal" aria-hidden="true">',
      '  <div class="report-modal-backdrop" data-report-close></div>',
      '  <div class="report-modal-panel" role="dialog" aria-modal="true" aria-labelledby="reportModalTitle">',
      '    <button class="report-close" type="button" aria-label="Close report form" data-report-close>&times;</button>',
      '    <div class="eyebrow">Missed Call Revenue Report</div>',
      '    <h2 id="reportModalTitle">Send the report to your inbox</h2>',
      '    <p>Enter your email to unlock the free PDF. The download starts after your request is saved.</p>',
      '    <form id="reportLeadForm" class="report-form" novalidate>',
      '      <div class="hp" aria-hidden="true"><label for="reportWebsite">Website</label><input id="reportWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>',
      '      <div class="lead-field"><label for="reportEmail">Email *</label><input id="reportEmail" name="email" type="email" autocomplete="email" required></div>',
      '      <div class="lead-field"><label for="reportName">Name</label><input id="reportName" name="name" type="text" autocomplete="name"></div>',
      '      <div class="lead-field"><label for="reportBusiness">Business Name</label><input id="reportBusiness" name="business_name" type="text" autocomplete="organization"></div>',
      '      <div class="lead-field"><label for="reportPhone">Phone</label><input id="reportPhone" name="phone" type="tel" autocomplete="tel"></div>',
      '      <button class="btn report-submit" id="reportSubmit" type="submit">DOWNLOAD YOUR FREE REPORT HERE</button>',
      '      <div class="form-status" id="reportStatus" role="status" aria-live="polite"></div>',
      '    </form>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function ReportDownloadCTA() {
    return renderReportDownloadCTA();
  }

  function ReportEmailCaptureModal() {
    return renderReportEmailCaptureModal();
  }

  root.ReportDownloadCTA = ReportDownloadCTA;
  root.ReportEmailCaptureModal = ReportEmailCaptureModal;
  root.generateMissedCallReportPDF = generateMissedCallReportPDF;
  root.downloadReportPDF = downloadReportPDF;
  root.C0D3AIReportDownload = {
    ReportDownloadCTA: ReportDownloadCTA,
    ReportEmailCaptureModal: ReportEmailCaptureModal,
    generateMissedCallReportPDF: generateMissedCallReportPDF,
    downloadReportPDF: downloadReportPDF,
    renderReportDownloadCTA: renderReportDownloadCTA,
    renderReportEmailCaptureModal: renderReportEmailCaptureModal
  };
})(window);
