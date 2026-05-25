import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchPhrasesByTerm,
  fetchPoints,
  fetchSearchPage,
  parsePhraseResults,
  parseRawPoint,
  type PointType,
} from "./ekosystem-parser.js";

test("fetchPhrasesByTerm gets production autocomplete results", async () => {
  const phrases = await fetchPhrasesByTerm("bat");

  assert.ok(Array.isArray(phrases));
  assert.ok(phrases.length > 0);
  assert.ok(phrases.every((phrase) => typeof phrase.id === "string" && phrase.id.length > 0));
});

test("fetchSearchPage gets production search page and parses results", async () => {
  const html = await fetchSearchPage("bateria");
  const results = parsePhraseResults(html);

  assert.ok(results.length > 0);
  assert.ok(results.some((result) => result.categories.length > 0));
});

test("fetchPoints gets production map markers and parser accepts first marker", async () => {
  const pointTypes: PointType[] = [{ query: "pszok", categoryId: "DD95DF21" }];
  const points = await fetchPoints(pointTypes);
  const markers = points.get("pszok");

  assert.ok(Array.isArray(markers));
  assert.ok(markers.length > 0);

  const parsedPoint = parseRawPoint(markers[0]!, "DD95DF21");

  assert.ok(parsedPoint);
  assert.equal(parsedPoint.categoryIds[0], "DD95DF21");
});
