const pages = require("./calculator-pages.json");

function getAllCalculatorPages() {
  return pages.map((page) => ({
    ...page,
    copy: { ...(page.copy || {}) }
  }));
}

module.exports = {
  pages,
  getAllCalculatorPages
};
