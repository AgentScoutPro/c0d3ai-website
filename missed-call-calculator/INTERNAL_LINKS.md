# Missed Call Calculator Internal Links

Use `internal-links.js` in the missed call calculator generator after the full page dataset has been created and before each page is rendered.

## Functions

- `VERTICALS` exports canonical vertical values: `home_services`, `real_estate`, and `legal`.
- `VERTICAL_HUB_URLS` exports canonical vertical hub routes.
- `generateInternalLinks(currentPage, allPages)` returns grouped links for one page.
- `addInternalLinksToPages(allPages)` returns every page with an added `internal_links` field.
- `renderInternalLinksHTML(internalLinks)` returns production-ready related calculator HTML.

## Vertical Hub URLs

```js
{
  home_services: "/missed-call-calculator/home-services",
  real_estate: "/missed-call-calculator/real-estate",
  legal: "/missed-call-calculator/legal"
}
```

## Generator Integration

```js
const {
  addInternalLinksToPages,
  renderInternalLinksHTML
} = require("./missed-call-calculator/internal-links");

const pagesWithLinks = addInternalLinksToPages(allPages);

pagesWithLinks.forEach((page) => {
  const relatedCalculatorsHTML = renderInternalLinksHTML(page.internal_links);

  const html = renderMissedCallCalculatorPage({
    ...page,
    relatedCalculatorsHTML
  });

  writePage(`/missed-call-calculator/${page.slug}.html`, html);
});
```

Place `relatedCalculatorsHTML` where the current template renders related calculators. The recommended location is after the industry/problem sections and before the final CTA.

## Browser Usage

```html
<script src="/missed-call-calculator/internal-links.js"></script>
<script>
  const { generateInternalLinks, renderInternalLinksHTML } = window.MissedCallInternalLinks;
  const links = generateInternalLinks(currentPage, allPages);
  document.querySelector("#related-calculators").innerHTML = renderInternalLinksHTML(links);
</script>
```

## Output Shape

Each generated link uses clean, extensionless URLs:

```js
{
  title: "Missed Call Calculator for Plumbers",
  url: "/missed-call-calculator/plumbers-missed-calls",
  service: "Plumbers",
  vertical: "home_services"
}
```
