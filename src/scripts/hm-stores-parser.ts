import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJsonFile, writeJsonFile } from "./json-file.js";

export const HM_STORES_URL =
  "https://api.storelocator.hmgroup.tech/v2/brand/hm/stores/locale/pl_PL/country/PL?_type=json&campaigns=true&departments=true&openinghours=true&maxnumberofstores=100";

export const HM_CATEGORY_ID = "3e1f50db";

export const hmDataPaths = {
  points: fileURLToPath(new URL("../../data/points.json", import.meta.url)),
};

export interface HmStoreAddress {
  streetName2: string;
  postCode: string;
  postalAddress: string;
}

export interface HmStore {
  latitude: string | number;
  longitude: string | number;
  name: string;
  address: HmStoreAddress;
}

export interface HmStoresResponse {
  stores?: HmStore[];
}

export interface ParsedHmPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  categoryIds: string[];
}

export async function fetchStores(): Promise<HmStoresResponse> {
  const response = await fetch(HM_STORES_URL);

  return JSON.parse(await response.text()) as HmStoresResponse;
}

export function parseStoresResponse(response: HmStoresResponse): ParsedHmPoint[] {
  if (response.stores !== undefined && !Array.isArray(response.stores)) {
    throw new RangeError("`stores.stores` should be an array");
  }

  return parseStorePoints(response.stores ?? []);
}

export function parseStorePoints(points: HmStore[]): ParsedHmPoint[] {
  return points.map((point) => ({
    ...parseStorePoint(point),
    categoryIds: [HM_CATEGORY_ID],
  }));
}

export function parseStorePoint(point: HmStore): Omit<ParsedHmPoint, "categoryIds"> {
  if (!point) {
    throw new RangeError("`point` cannot be empty");
  }

  const lat = Number(point.latitude);

  if (Number.isNaN(lat)) {
    throw new RangeError("`lat` should be valid number");
  }

  const lng = Number(point.longitude);

  if (Number.isNaN(lng)) {
    throw new RangeError("`lng` should be valid number");
  }

  return {
    id: sha256(`${lat}_${lng}`).substring(0, 8).toUpperCase(),
    name: `H&M, ${point.name}`,
    lat,
    lng,
    address: `${point.address.streetName2}, ${point.address.postCode}, ${point.address.postalAddress}`,
  };
}

export function syncHmPoints(existingPoints: ParsedHmPoint[], freshHmPoints: ParsedHmPoint[]): ParsedHmPoint[] {
  const freshHmPointsById = new Map(freshHmPoints.map((point) => [point.id, point]));
  const syncedHmPointIds = new Set<string>();
  const points = existingPoints.flatMap((point) => {
    if (!point.categoryIds.includes(HM_CATEGORY_ID)) {
      return [point];
    }

    const freshHmPoint = freshHmPointsById.get(point.id);

    if (!freshHmPoint) {
      return [];
    }

    syncedHmPointIds.add(point.id);

    return [freshHmPoint];
  });
  const newHmPoints = freshHmPoints.filter((point) => !syncedHmPointIds.has(point.id));

  return [...points, ...newHmPoints];
}

export async function sync(): Promise<void> {
  const stores = await fetchStores();
  const freshHmPoints = parseStoresResponse(stores);
  const existingPoints = readJsonFile<ParsedHmPoint[]>(hmDataPaths.points);
  const points = syncHmPoints(existingPoints, freshHmPoints);

  writeJsonFile(hmDataPaths.points, points);

  console.log("write result to", path.basename(hmDataPaths.points));
}

export function sha256(str: string): string {
  const hash = crypto.createHash("sha256");

  hash.update(str);

  return hash.digest("hex");
}

async function main(): Promise<void> {
  await sync();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
