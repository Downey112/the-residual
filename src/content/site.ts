/**
 * Site-wide configuration. Edit this file to change copy, links and specs.
 *
 * LINKS: paste your real storefront URLs here. Buttons only render when a URL is set.
 * TEE specs: these describe the print files and blank used for the mockups.
 * Check them against your print provider's order page before publishing.
 */

export const LINKS = {
  tee: "", // prototype only, not for sale. Leave empty to hide the buy button.
  book: "https://luqmanizn.gumroad.com/l/nsezv",
  contact: "mailto:luqmansyahrulnizam@gmail.com",
  whatsapp: "https://wa.me/60102477357", // 010-247 7357
};

export const SITE = {
  name: "The Residual",
  tagline: "You learned to fit the line.",
  description:
    "The Residual: a heavyweight tee and a field guide for statistics graduates, both about the part the line leaves out.",
};

export const TEE = {
  name: "The Residual Tee",
  status: "Prototype · not for sale",
  blank: "Garment-dyed heavyweight cotton tee (Comfort Colors blank)",
  colourway: "Black",
  inks: "White ink, one amber accent",
  front: "Small serif wordmark, upper chest. Approx. 2.8 in wide.",
  back: "Regression line, fitted points and one isolated residual, with the wordmark above and the line “You learned to fit the line.” below. Plot approx. 11 in wide, centred.",
  rationale:
    "In linear regression every observation is judged by its distance from the fitted line. The residual, written e, is that distance: the part the model could not account for. One point sits far from the line, and the shirt keeps it.",
};

export const PHILOSOPHY = {
  quote:
    "When you fit a line to data, the line is your best account of what usually happens. The residual is the distance between that account and what actually happened to one point.",
  follow:
    "A good analyst does not delete the points that sit far off the line. She goes and looks at them.",
  source: "The Residual, Epilogue",
};
