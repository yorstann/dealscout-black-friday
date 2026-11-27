// filters.js — one job: take the deal board and a shopper's choices, and hand
// back the deals to show, in the order to show them. No DOM here; views.js
// owns the rendering. Every number below is computed from the two prices, so
// a deal's discount can never disagree with its prices.

export const CATEGORIES = ["TVs", "Laptops", "Audio", "Home", "Toys & Games", "Fashion"];
export const STORES = ["Amazon", "Best Buy", "Walmart", "Target"];

export function discountPct(deal) {
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function dollarsSaved(deal) {
  return +(deal.was - deal.price).toFixed(2);
}

export function verdictRank(deal) {
  // New lows first, then strong deals, then routine ones.
  return { "new-low": 0, strong: 1, routine: 2 }[deal.verdict] ?? 2;
}

export function verdictLabel(deal) {
  return { "new-low": "New low", strong: "Strong deal", routine: "Routine cut" }[deal.verdict] ?? "Deal";
}

export function sortDeals(deals, sort) {
  const list = [...deals];
  switch (sort) {
    case "pct":
      return list.sort((a, b) => discountPct(b) - discountPct(a) || dollarsSaved(b) - dollarsSaved(a));
    case "saved":
      return list.sort((a, b) => dollarsSaved(b) - dollarsSaved(a) || discountPct(b) - discountPct(a));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "verdict":
    default:
      return list.sort((a, b) => verdictRank(a) - verdictRank(b) || discountPct(b) - discountPct(a));
  }
}

export function filterDeals(deals, { query = "", category = "", store = "", minOff = 0 } = {}) {
  const needle = query.trim().toLowerCase();
  return deals.filter((deal) => {
    if (category && deal.category !== category) return false;
    if (store && deal.store !== store) return false;
    if (discountPct(deal) < minOff) return false;
    if (needle) {
      const hay = `${deal.title} ${deal.store} ${deal.category}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function boardTotals(deals) {
  const saved = deals.reduce((sum, d) => sum + dollarsSaved(d), 0);
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  const best = [...deals].sort((a, b) => discountPct(b) - discountPct(a))[0];
  return { count: deals.length, saved: Math.round(saved), newLows, bestPct: best ? discountPct(best) : 0 };
}
