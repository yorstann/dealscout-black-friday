// main.js — one job: own the page's state and wire the views to the browser.
// It keeps the shopper's search, filters and sort in one state object, renders
// the list or a single deal from the hash route, and re-renders on every change.
// Filters are deep-linkable: ?q=, ?cat=, ?store=, ?minoff= and ?sort= in the
// address bar set the same state a shopper would set by hand, so a filtered
// view can be shared as a link.

import { listView, detailView } from "./views.js";

const root = document.getElementById("app");

const state = {
  query: "",
  category: "",
  store: "",
  minOff: 0,
  sort: "verdict",
};

function readQueryState() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const cat = params.get("cat");
  const store = params.get("store");
  const minoff = Number(params.get("minoff") ?? 0);
  const sort = params.get("sort");
  if (q) state.query = q;
  if (cat) state.category = cat;
  if (store) state.store = store;
  if (Number.isFinite(minoff) && minoff > 0) state.minOff = minoff;
  if (sort) state.sort = sort;
}

function render() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/deal\/([\w-]+)$/);
  if (match) {
    root.innerHTML = detailView(match[1]);
    window.scrollTo(0, 0);
    return;
  }
  root.innerHTML = listView(state);
  wireControls();
}

function wireControls() {
  const q = document.getElementById("q");
  const sort = document.getElementById("sort");
  const store = document.getElementById("store");
  const minoff = document.getElementById("minoff");
  if (!q || !sort || !store || !minoff) return;

  q.addEventListener("input", () => {
    state.query = q.value;
    const caret = q.selectionStart;
    render();
    const again = document.getElementById("q");
    if (again) {
      again.focus();
      again.setSelectionRange(caret, caret);
    }
  });
  sort.addEventListener("change", () => {
    state.sort = sort.value;
    render();
  });
  store.addEventListener("change", () => {
    state.store = store.value;
    render();
  });
  minoff.addEventListener("change", () => {
    state.minOff = Number(minoff.value);
    render();
  });
  root.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.cat || "";
      render();
    });
  });
}

window.addEventListener("hashchange", render);
readQueryState();
render();
