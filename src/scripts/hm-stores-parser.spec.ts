import assert from "node:assert/strict";
import test from "node:test";
import { HM_CATEGORY_ID, fetchStores, parseStoresResponse } from "./hm-stores-parser.js";

test("fetchStores gets production H&M stores and parses them", async () => {
  const response = await fetchStores();

  assert.ok(Array.isArray(response.stores));
  assert.ok(response.stores.length > 0);

  const points = parseStoresResponse({ stores: response.stores.slice(0, 3) });

  assert.ok(points.length > 0);
  assert.ok(points.every((point) => point.categoryIds.includes(HM_CATEGORY_ID)));
  assert.ok(points.every((point) => point.lat > 49 && point.lat < 55));
  assert.ok(points.every((point) => point.lng > 14 && point.lng < 25));
});
