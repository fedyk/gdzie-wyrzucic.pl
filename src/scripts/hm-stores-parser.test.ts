import assert from "node:assert/strict";
import test from "node:test";
import { HM_CATEGORY_ID, parseStorePoint, parseStoresResponse, sha256, syncHmPoints } from "./hm-stores-parser.js";

test("parseStorePoint maps H&M store fields to point fields", () => {
  const point = parseStorePoint({
    latitude: "51.1",
    longitude: "17.2",
    name: "Wroclavia",
    address: {
      streetName2: "Sucha 1",
      postCode: "50-086",
      postalAddress: "Wroclaw",
    },
  });

  assert.deepEqual(point, {
    id: sha256("51.1_17.2").substring(0, 8).toUpperCase(),
    name: "H&M, Wroclavia",
    lat: 51.1,
    lng: 17.2,
    address: "Sucha 1, 50-086, Wroclaw",
  });
});

test("parseStoresResponse adds H&M category to every parsed point", () => {
  const points = parseStoresResponse({
    stores: [
      {
        latitude: 51.1,
        longitude: 17.2,
        name: "Wroclavia",
        address: {
          streetName2: "Sucha 1",
          postCode: "50-086",
          postalAddress: "Wroclaw",
        },
      },
    ],
  });

  assert.equal(points.length, 1);
  assert.deepEqual(points[0]?.categoryIds, [HM_CATEGORY_ID]);
});

test("parseStoresResponse rejects non-array stores payloads", () => {
  assert.throws(
    () => parseStoresResponse({ stores: {} as never }),
    new RangeError("`stores.stores` should be an array"),
  );
});

test("parseStorePoint validates coordinates", () => {
  assert.throws(
    () =>
      parseStorePoint({
        latitude: "not-a-number",
        longitude: "17.2",
        name: "Wroclavia",
        address: {
          streetName2: "Sucha 1",
          postCode: "50-086",
          postalAddress: "Wroclaw",
        },
      }),
    new RangeError("`lat` should be valid number"),
  );
});

test("syncHmPoints updates existing H&M points in place and appends new ones", () => {
  const firstNonHmPoint = {
    id: "NONHM1",
    name: "First other point",
    lat: 51.1,
    lng: 17.2,
    address: "First other address",
    categoryIds: ["OTHER"],
  };
  const secondNonHmPoint = {
    id: "NONHM2",
    name: "Second other point",
    lat: 51.2,
    lng: 17.3,
    address: "Second other address",
    categoryIds: ["OTHER"],
  };
  const removedHmPoint = {
    id: "REMOVEDHM",
    name: "H&M, Removed",
    lat: 52.0,
    lng: 21.0,
    address: "Removed address",
    categoryIds: [HM_CATEGORY_ID],
  };
  const existingHmPoint = {
    id: "EXISTINGHM",
    name: "H&M, Old",
    lat: 52.1,
    lng: 21.2,
    address: "Old address",
    categoryIds: [HM_CATEGORY_ID],
  };
  const updatedHmPoint = {
    id: "EXISTINGHM",
    name: "H&M, Updated",
    lat: 52.2,
    lng: 21.3,
    address: "Updated address",
    categoryIds: [HM_CATEGORY_ID],
  };
  const freshHmPoint = {
    id: "NEWHM",
    name: "H&M, New",
    lat: 53.1,
    lng: 22.2,
    address: "New address",
    categoryIds: [HM_CATEGORY_ID],
  };

  assert.deepEqual(syncHmPoints([firstNonHmPoint, removedHmPoint, existingHmPoint, secondNonHmPoint], [
    updatedHmPoint,
    freshHmPoint,
  ]), [firstNonHmPoint, updatedHmPoint, secondNonHmPoint, freshHmPoint]);
});
