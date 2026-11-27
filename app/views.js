// views.js — one job: turn deals and filter state into HTML. It never fetches
// anything and never changes the data; main.js owns state and events.

import { DEALS, CHECKED_LABEL } from "./deals.js";
import {
  CATEGORIES,
  STORES,
  discountPct,
  dollarsSaved,
  verdictLabel,
  sortDeals,
  filterDeals,
  boardTotals,
} from "./filters.js";

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

function dealCard(deal) {
  const other = deal.compare ? DEALS.find((d) => d.id === deal.compare) : null;
  const compareLine = other
    ? `<p class="compare">Same laptop at ${other.store}: <a href="#/deal/${other.id}">${money(other.price)}</a> — this one saves $${Math.abs(deal.price - other.price)} more.</p>`
    : "";
  return `<li class="card">
    <h3><a href="#/deal/${deal.id}">${deal.title}</a></h3>
    <div class="meta"><span class="store">${deal.store}</span><span class="category">${deal.category}</span></div>
    <div class="prices">
      <span class="now">${money(deal.price)}</span>
      <span class="was">${money(deal.was)}</span>
      <span class="off">−${discountPct(deal)}%</span>
    </div>
    <span class="verdict ${deal.verdict}">${verdictLabel(deal)} · save ${money(dollarsSaved(deal))}</span>
    <p class="note">${deal.note}</p>
    <p class="proof">${CHECKED_LABEL}. Source: ${deal.source}.</p>
    ${compareLine}
    <a class="buy" href="${deal.url}" target="_blank" rel="noopener">View at ${deal.store} ↗</a>
  </li>`;
}

function controlRow(state) {
  const catOptions = ['<option value="">All categories</option>'].concat(
    CATEGORIES.map((c) => `<option value="${c}"${state.category === c ? " selected" : ""}>${c}</option>`),
  ).join("");
  const storeOptions = ['<option value="">All stores</option>'].concat(
    STORES.map((s) => `<option value="${s}"${state.store === s ? " selected" : ""}>${s}</option>`),
  ).join("");
  const offOptions = [0, 25, 40, 50].map(
    (n) => `<option value="${n}"${state.minOff === n ? " selected" : ""}>${n === 0 ? "Any discount" : n + "% off or more"}</option>`,
  ).join("");
  return `<div class="controls">
    <input class="search" id="q" type="search" placeholder="Search deals — try “AirPods” or “TV”" value="${state.query.replaceAll('"', "&quot;")}" aria-label="Search deals">
    <select id="sort" aria-label="Sort deals">
      <option value="verdict"${state.sort === "verdict" ? " selected" : ""}>Best verdict first</option>
      <option value="pct"${state.sort === "pct" ? " selected" : ""}>Biggest % off</option>
      <option value="saved"${state.sort === "saved" ? " selected" : ""}>Biggest $ saved</option>
      <option value="price-asc"${state.sort === "price-asc" ? " selected" : ""}>Lowest price</option>
      <option value="price-desc"${state.sort === "price-desc" ? " selected" : ""}>Highest price</option>
    </select>
    <select id="store" aria-label="Filter by store">${storeOptions}</select>
    <select id="minoff" aria-label="Filter by discount">${offOptions}</select>
  </div>
  <div class="chips" role="group" aria-label="Filter by category">
    <button class="chip" data-cat="" aria-pressed="${state.category === ""}">All</button>
    ${CATEGORIES.map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${state.category === c}">${c}</button>`).join("")}
  </div>`;
}

export function listView(state) {
  const totals = boardTotals(DEALS);
  const shown = sortDeals(filterDeals(DEALS, state), state.sort);
  const cards = shown.map(dealCard).join("");
  const body = shown.length
    ? `<ul class="grid">${cards}</ul>`
    : `<p class="empty">No deals match that search. Try a different word, or clear a filter.</p>`;
  return `<section class="stats" aria-label="Board summary">
    <div class="stat"><b>${totals.count}</b><span>verified deals</span></div>
    <div class="stat"><b>$${totals.saved.toLocaleString("en-US")}</b><span>total savings if you bought them all</span></div>
    <div class="stat"><b>${totals.newLows}</b><span>new all-time lows</span></div>
    <div class="stat"><b>${totals.bestPct}%</b><span>biggest single discount</span></div>
  </section>
  ${controlRow(state)}
  <p class="count">Showing ${shown.length} of ${DEALS.length} deals · sorted ${state.sort === "verdict" ? "by verdict" : state.sort} · ${CHECKED_LABEL}</p>
  ${body}`;
}

export function detailView(id) {
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) {
    return `<p class="empty">That deal is not on the board. <a href="#/">Back to all deals</a>.</p>`;
  }
  const other = deal.compare ? DEALS.find((d) => d.id === deal.compare) : null;
  const compareBlock = other
    ? `<dt>Same product elsewhere</dt><dd>${other.store}: <a href="#/deal/${other.id}">${money(other.price)}</a> (was ${money(other.was)}). This listing is $${Math.abs(deal.price - other.price)} ${deal.price < other.price ? "cheaper" : "dearer"}.</dd>`
    : "";
  return `<article class="detail">
    <p><a class="back" href="#/">← All deals</a></p>
    <h1>${deal.title}</h1>
    <div class="meta"><span class="store">${deal.store}</span><span class="category">${deal.category}</span></div>
    <div class="prices">
      <span class="now">${money(deal.price)}</span>
      <span class="was">${money(deal.was)}</span>
      <span class="off">−${discountPct(deal)}%</span>
    </div>
    <span class="verdict ${deal.verdict}">${verdictLabel(deal)} · save ${money(dollarsSaved(deal))}</span>
    <p class="note">${deal.note}</p>
    <dl>
      <dt>Store</dt><dd>${deal.store}</dd>
      <dt>Sale price</dt><dd>${money(deal.price)}</dd>
      <dt>Usual price</dt><dd>${money(deal.was)}</dd>
      <dt>Discount</dt><dd>${discountPct(deal)}% off — ${money(dollarsSaved(deal))} saved</dd>
      <dt>Price checked</dt><dd>${CHECKED_LABEL}</dd>
      <dt>Price source</dt><dd>${deal.source}</dd>
      ${compareBlock}
    </dl>
    <a class="buy" href="${deal.url}" target="_blank" rel="noopener">View at ${deal.store} ↗</a>
    <p class="proof">Prices move during Black Friday. Confirm the price at the store before you pay.</p>
  </article>`;
}
