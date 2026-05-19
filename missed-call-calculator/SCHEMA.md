# Missed Call Calculator Schema

Use `calculator-schema.js` in the page generator after each page object is assembled and before the closing `</head>` tag is rendered.

## Functions

- `generateCalculatorSchema(page)` returns JSON-LD with `WebPage`, `SoftwareApplication`, and `FAQPage` entities.
- `renderSchemaTag(schema)` returns a complete `<script type="application/ld+json">` tag.

## Page Template Usage

```js
const {
  generateCalculatorSchema,
  renderSchemaTag
} = require("./missed-call-calculator/calculator-schema");

function renderMissedCallCalculatorPage(page) {
  const schemaTag = renderSchemaTag(generateCalculatorSchema(page));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ...
  ${schemaTag}
</head>
<body>
  ...
</body>
</html>`;
}
```

The page object should include:

```js
{
  service: "Plumbers",
  slug: "plumbers-missed-calls",
  vertical: "home_services",
  avg_job_value: 350,
  missed_calls_per_day: 5,
  copy: {
    hero: "...",
    problem: "...",
    math: "...",
    industry: "...",
    cta: "..."
  }
}
```

## Updating Existing Static Pages

Run:

```sh
node missed-call-calculator/update-calculator-schema.js
```

The updater inserts or replaces the schema tag marked with:

```html
data-schema="missed-call-calculator"
```
