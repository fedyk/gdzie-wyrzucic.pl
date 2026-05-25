import assert from "node:assert";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseHtml } from "node-html-parser";
import { readJsonFile, writeJsonFile } from "./json-file.ts";

export const EKOSYSTEM_AUTOCOMPLETE_URL =
  "https://ekosystem.wroc.pl/wp-admin/admin-ajax.php?action=gdzie-wrzucic";
export const EKOSYSTEM_SEARCH_URL =
  "https://ekosystem.wroc.pl/segregacja-odpadow/gdzie-wrzucic/";
export const EKOSYSTEM_POINTS_URL = "https://mapa.ekosystem.wroc.pl/wp-admin/admin-ajax.php";

export const ekosystemDataPaths = {
  categories: fileURLToPath(new URL("../../data/ekosystem-parser/categories.json", import.meta.url)),
  categoriesDuplicate: fileURLToPath(
    new URL("../../data/ekosystem-parser/categories-duplicate.json", import.meta.url),
  ),
  phrases: fileURLToPath(new URL("../../data/ekosystem-parser/phrases.json", import.meta.url)),
  pointTypes: fileURLToPath(new URL("../../data/ekosystem-parser/points-types.json", import.meta.url)),
  pointsRaw: fileURLToPath(new URL("../../data/ekosystem-parser/points-raw.json", import.meta.url)),
  pointsParsed: fileURLToPath(new URL("../../data/ekosystem-parser/points-parsed.json", import.meta.url)),
  productsRaw: fileURLToPath(new URL("../../data/ekosystem-parser/products-raw.json", import.meta.url)),
  productsParsed: fileURLToPath(new URL("../../data/ekosystem-parser/products-parsed.json", import.meta.url)),
};

export interface PhraseAutocompleteItem {
  id: string;
}

export interface ParsedPhraseCategory {
  name: string | null;
  classNames: string[];
  links: Array<{
    href: string | null;
    text: string;
  }>;
}

export interface ParsedPhraseResult {
  phrase: string | null;
  categories: ParsedPhraseCategory[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Waste {
  id: string;
  name: string;
  categoryIds: string[];
}

export interface PointType {
  query: string;
  categoryId: string;
}

export interface RawPoint {
  position?: {
    lat?: string | number;
    lng?: string | number;
  };
  title?: string;
  useInfoWindow?: {
    content?: string;
  };
}

export type ProductsRaw = Array<[string, ParsedPhraseCategory[]]>;
export type PointsRaw = Array<[string, RawPoint[]]>;
export type CategoriesDuplicate = Record<string, string>;

export interface ParsedPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  categoryIds: string[];
}

const LOG_PREFIX = "[ekosystem-parser]";

function formatDuration(startedAt: number): string {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;
}

function logInfo(message: string, ...args: unknown[]): void {
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

export async function fetchPhrases(): Promise<Map<string, string>> {
  const phrases = new Map<string, string>();
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  for (const [index, letter] of alphabet.entries()) {
    const items = await fetchPhrasesByTerm(letter);
    const beforeCount = phrases.size;

    for (const item of items) {
      phrases.set(item.id, item.id);
    }

    logInfo(
      "Fetched autocomplete term %s/%s (%s): %s results, %s new, %s total",
      index + 1,
      alphabet.length,
      letter,
      items.length,
      phrases.size - beforeCount,
      phrases.size,
    );
  }

  return phrases;
}

export async function fetchPhrasesByTerm(term: string): Promise<PhraseAutocompleteItem[]> {
  const response = await fetch(`${EKOSYSTEM_AUTOCOMPLETE_URL}&term=${encodeURIComponent(term)}`);

  return JSON.parse(await response.text()) as PhraseAutocompleteItem[];
}

export async function fetchSearchPage(phrase: string): Promise<string> {
  const response = await fetch(`${EKOSYSTEM_SEARCH_URL}?odpad=${encodeURIComponent(phrase)}`);

  return response.text();
}

export function parsePhraseResults(html: string): ParsedPhraseResult[] {
  const results: ParsedPhraseResult[] = [];
  const parsedHTML = parseHtml(html);
  const parsedResults = parsedHTML.querySelectorAll(".gdzie-wrzucic-result");

  for (const parsedResult of parsedResults) {
    const parsedResultNameEl = parsedResult.querySelector(".odpad-name");
    const parsedCategories = parsedResult.querySelectorAll(".pojemnik");
    const phrase = parsedResultNameEl ? parsedResultNameEl.text.trim() : null;
    const categories: ParsedPhraseCategory[] = [];

    for (const categoryEl of parsedCategories) {
      const nameEl = categoryEl.querySelector(".pojemnik-name");
      const name = nameEl ? nameEl.text.trim() : null;
      const links = categoryEl.querySelectorAll("a").map((anchor) => ({
        href: anchor.attributes.href ?? null,
        text: anchor.text.trim(),
      }));

      categories.push({
        name,
        classNames: categoryEl.classList.value,
        links,
      });
    }

    results.push({
      phrase,
      categories,
    });
  }

  return results;
}

export async function fetchSearchResults(phrases: string[]): Promise<Map<string | null, ParsedPhraseCategory[]>> {
  const results = new Map<string | null, ParsedPhraseCategory[]>();

  for (const [index, phrase] of phrases.entries()) {
    const html = await fetchSearchPage(phrase);
    const parsedResults = parsePhraseResults(html);

    for (const parsedResult of parsedResults) {
      results.set(parsedResult.phrase, parsedResult.categories);
    }

    logInfo(
      "Fetched product %s/%s: %s (%s parsed results, %s total)",
      index + 1,
      phrases.length,
      phrase,
      parsedResults.length,
      results.size,
    );
  }

  return results;
}

export async function fetchPoints(pointTypes: PointType[]): Promise<Map<string, RawPoint[]>> {
  const results = new Map<string, RawPoint[]>();

  for (const [index, pointType] of pointTypes.entries()) {
    if (typeof pointType !== "object") {
      throw new Error("`pointType` should be an object");
    }

    const query = pointType.query;

    if (typeof query !== "string") {
      throw new Error("`query` should be a string");
    }

    const response = await fetch(EKOSYSTEM_POINTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "get-points",
        "points[]": query,
      }),
    });
    const responseText = await response.text();

    let parsedResponse: { markers?: RawPoint[] } | undefined;

    try {
      parsedResponse = JSON.parse(responseText) as { markers?: RawPoint[] };
    } catch (err) {
      console.error("fetchPoints", err);
    }

    const markers = parsedResponse?.markers;

    if (!Array.isArray(markers)) {
      console.warn(`${LOG_PREFIX} Point query ${index + 1}/${pointTypes.length} (${query}) has no markers`);
    } else {
      results.set(query, markers);
      logInfo(
        "Fetched point query %s/%s: %s (%s markers)",
        index + 1,
        pointTypes.length,
        query,
        markers.length,
      );
    }
  }

  return results;
}

export function parsePointsFromData(pointTypes: PointType[], pointsRaw: PointsRaw, categories: Category[]): ParsedPoint[] {
  const pointTypesMap = new Map(pointTypes.map((value) => [value.query, value.categoryId]));
  const parsedPoints = new Map<string, ParsedPoint>();
  const categoriesMap = new Map(categories.map((value) => [value.id, value.name]));

  assert.ok(Array.isArray(pointsRaw), new Error("`points` should be an array"));

  pointsRaw.forEach((pointGroup) => {
    assert.ok(Array.isArray(pointGroup), new Error("`pointGroup` should be an array"));
    assert.ok(pointGroup.length === 2, new Error("`pointGroup` should be a ['categoryName', points[]]"));

    const query = pointGroup[0];
    const points = pointGroup[1];
    const categoryId = pointTypesMap.get(query);

    if (!categoriesMap.has(categoryId ?? "")) {
      console.warn(
        `WARN: category ${categoryId} does not exist in ${path.basename(ekosystemDataPaths.categories)}. ` +
          `Please check if 'query' ${query} has proper category in ${path.basename(ekosystemDataPaths.pointTypes)}`,
      );
    }

    if (!categoryId) {
      console.warn("`pointGroup` with query", query, "has no defined categoryId");
      return;
    }

    assert.ok(Array.isArray(points), new Error("`points` should be an array"));

    points.forEach((point) => {
      const parsedPoint = parseRawPoint(point, categoryId);

      if (!parsedPoint) {
        return;
      }

      const existingPoint = parsedPoints.get(parsedPoint.id);

      if (!existingPoint) {
        parsedPoints.set(parsedPoint.id, parsedPoint);
        return;
      }

      if (existingPoint.name !== parsedPoint.name) {
        console.warn(
          "parsed point",
          parsedPoint.id,
          "and next similar point have different names",
          existingPoint.name,
          parsedPoint.name,
        );
      }

      if (!existingPoint.categoryIds.includes(categoryId)) {
        existingPoint.categoryIds.push(categoryId);
      }
    });
  });

  return Array.from(parsedPoints.values());
}

export function parseRawPoint(point: RawPoint, categoryId: string): ParsedPoint | null {
  const name = point.title ? String(point.title).trim() : "";
  const useInfoWindow = point.useInfoWindow?.content ?? "";
  const lat = point.position?.lat ? Number(point.position.lat) : Number.NaN;
  const lng = point.position?.lng ? Number(point.position.lng) : Number.NaN;
  const id =
    point.position?.lat && point.position.lng
      ? sha256(`${point.position.lat}_${point.position.lng}`).substring(0, 8).toUpperCase()
      : null;

  if (Number.isNaN(lat)) {
    console.warn("`point` is missing `lat`", point);
    return null;
  }

  if (Number.isNaN(lng)) {
    console.warn("`point` is missing `lng`", point);
    return null;
  }

  if (!id) {
    console.warn("`point` is missing `id`", point);
    return null;
  }

  if (name.length === 0) {
    console.warn("`point` cannot have empty `title`", point);
    return null;
  }

  if (useInfoWindow.length === 0) {
    console.warn("`useInfoWindow` cannot be empty", point);
    return null;
  }

  const html = parseHtml(useInfoWindow);
  const h3 = html.querySelector("h3");
  const heading = h3 ? h3.text.trim().replace(/\s\s+/g, " ") : undefined;
  const paragraphs = html.querySelectorAll("p");
  const address = paragraphs[0] ? paragraphs[0].text : heading;

  if (!address) {
    console.warn("`address` cannot be empty", point);
    return null;
  }

  return {
    id,
    name,
    lat,
    lng,
    address,
    categoryIds: [categoryId],
  };
}

export function parseCategoriesFromProducts(
  products: ProductsRaw,
  categoriesDuplicate: CategoriesDuplicate,
): Category[] {
  const names = new Set<string>();
  const categories: Category[] = [];

  if (!Array.isArray(products)) {
    throw new Error("products should be an array");
  }

  for (const product of products) {
    const [, types] = product;

    if (!Array.isArray(types)) {
      continue;
    }

    for (const type of types) {
      const name = String(type.name).trim();

      if (categoriesDuplicate[name]) {
        continue;
      }

      names.add(name);
    }
  }

  for (const name of names) {
    categories.push({
      id: sha256(name).substring(0, 8).toUpperCase(),
      name,
    });
  }

  const customCategoryName = "Opakowania na zuzyte igly i strzykawki";

  categories.push({
    id: sha256(customCategoryName).substring(0, 8).toUpperCase(),
    name: customCategoryName,
  });

  return categories;
}

export function parseProductsFromData(
  categories: Category[],
  categoriesDuplicate: CategoriesDuplicate,
  products: ProductsRaw,
): Waste[] {
  const wastes: Waste[] = [];
  const categoryIdsMap = new Map<string, string>();
  const productNames = new Set<string>();
  const productIds = new Set<string>();

  if (!Array.isArray(categories)) {
    throw new Error("`categories` should be an array");
  }

  categories.forEach((category) => {
    const name = category?.name;
    const id = category?.id;

    if (!name) {
      console.warn("`category`", category, "has empty name");
      return;
    }

    if (!id) {
      console.warn("`category`", category, "has empty id");
      return;
    }

    categoryIdsMap.set(name, id);
  });

  if (!Array.isArray(products)) {
    throw new Error("`products` should be an array");
  }

  products.forEach((product) => {
    if (!Array.isArray(product)) {
      console.warn("`product`", product, "should be an array");
      return;
    }

    const name = String(product[0] || "").trim();
    const types = product[1];

    if (name.length === 0) {
      console.warn("`name` of product", product, "should NOT be empty");
      return;
    }

    if (productNames.has(name)) {
      console.warn(`"product" with name "${name}" already was registered`);
    }

    productNames.add(name);

    if (!Array.isArray(types)) {
      console.warn("`types` of product", product, "should be an array");
      return;
    }

    const id = sha256(name).substring(0, 8).toUpperCase();

    if (productIds.has(id)) {
      console.warn(`"product" with id "${id}" already was registered`);
    }

    productIds.add(id);

    const waste: Waste = {
      id,
      name,
      categoryIds: [],
    };

    types.forEach((type) => {
      let typeName = type.name;

      if (!typeName) {
        console.warn("`name` of product type", type, "cannot be empty");
        return;
      }

      if (categoriesDuplicate[typeName]) {
        typeName = categoriesDuplicate[typeName];
      }

      const categoryId = categoryIdsMap.get(typeName);

      if (!categoryId) {
        console.warn("cannot find id for", typeName);
        return;
      }

      if (waste.categoryIds.includes(categoryId)) {
        console.warn(`WARN: "${waste.name} already has category with id "${categoryId}""`);
        return;
      }

      waste.categoryIds.push(categoryId);
    });

    if (waste.categoryIds.length === 0) {
      console.warn("`waste`", waste, "has empty categories");
    }

    wastes.push(waste);
  });

  const iglyStrukawkiCategoryId = "8830C24C";

  if (!categories.find((category) => category.id === iglyStrukawkiCategoryId)) {
    console.warn("WARN: `iglyStrukawkiCategoryId` doesn't present in categories");
  } else {
    const name = "Zuzyte igly i strzykawki";

    wastes.push({
      id: sha256(name).substring(0, 8).toUpperCase(),
      name,
      categoryIds: [iglyStrukawkiCategoryId],
    });
  }

  return wastes;
}

export async function syncPhrases(): Promise<void> {
  const phrases = await fetchPhrases();
  const values = Array.from(phrases.values());

  writeJsonFile(ekosystemDataPaths.phrases, values);

  logInfo("Wrote %s phrases to %s", values.length, path.basename(ekosystemDataPaths.phrases));
}

export async function syncProducts(): Promise<void> {
  const phrases = readJsonFile<string[]>(ekosystemDataPaths.phrases);

  logInfo("Loaded %s phrases from %s", phrases.length, path.basename(ekosystemDataPaths.phrases));

  const results = await fetchSearchResults(phrases);
  const entries = Array.from(results.entries());

  writeJsonFile(ekosystemDataPaths.productsRaw, entries);

  logInfo("Wrote %s raw products to %s", entries.length, path.basename(ekosystemDataPaths.productsRaw));
}

export async function syncPoints(): Promise<void> {
  const pointTypes = readJsonFile<PointType[]>(ekosystemDataPaths.pointTypes);

  logInfo("Loaded %s point types from %s", pointTypes.length, path.basename(ekosystemDataPaths.pointTypes));

  const results = await fetchPoints(pointTypes);
  const entries = Array.from(results.entries());

  writeJsonFile(ekosystemDataPaths.pointsRaw, entries);

  logInfo("Wrote %s point groups to %s", entries.length, path.basename(ekosystemDataPaths.pointsRaw));
}

export function parseCategories(): void {
  const products = readJsonFile<ProductsRaw>(ekosystemDataPaths.productsRaw);
  const categoriesDuplicate = readJsonFile<CategoriesDuplicate>(ekosystemDataPaths.categoriesDuplicate);
  const categories = parseCategoriesFromProducts(products, categoriesDuplicate);

  writeJsonFile(ekosystemDataPaths.categories, categories);

  logInfo("Wrote %s categories to %s", categories.length, path.basename(ekosystemDataPaths.categories));
}

export function parseProducts(): void {
  const categories = readJsonFile<Category[]>(ekosystemDataPaths.categories);
  const categoriesDuplicate = readJsonFile<CategoriesDuplicate>(ekosystemDataPaths.categoriesDuplicate);
  const products = readJsonFile<ProductsRaw>(ekosystemDataPaths.productsRaw);
  const wastes = parseProductsFromData(categories, categoriesDuplicate, products);

  writeJsonFile(ekosystemDataPaths.productsParsed, wastes);

  logInfo("Wrote %s parsed products to %s", wastes.length, path.basename(ekosystemDataPaths.productsParsed));
}

export function parsePoints(): void {
  const pointTypes = readJsonFile<PointType[]>(ekosystemDataPaths.pointTypes);
  const pointsRaw = readJsonFile<PointsRaw>(ekosystemDataPaths.pointsRaw);
  const categories = readJsonFile<Category[]>(ekosystemDataPaths.categories);
  const points = parsePointsFromData(pointTypes, pointsRaw, categories);

  writeJsonFile(ekosystemDataPaths.pointsParsed, points);

  logInfo("Wrote %s parsed points to %s", points.length, path.basename(ekosystemDataPaths.pointsParsed));
}

export async function syncEkosystemData(): Promise<void> {
  const startedAt = Date.now();
  const stages: Array<{
    name: string;
    run: () => Promise<void> | void;
  }> = [
    { name: "Sync phrases", run: syncPhrases },
    { name: "Sync products", run: syncProducts },
    { name: "Sync points", run: syncPoints },
    { name: "Parse categories", run: parseCategories },
    { name: "Parse products", run: parseProducts },
    { name: "Parse points", run: parsePoints },
  ];

  logInfo("Starting sync pipeline with %s stages", stages.length);

  for (const [index, stage] of stages.entries()) {
    const stageStartedAt = Date.now();

    logInfo("Starting stage %s/%s: %s", index + 1, stages.length, stage.name);
    await stage.run();
    logInfo("Finished stage %s/%s: %s in %s", index + 1, stages.length, stage.name, formatDuration(stageStartedAt));
  }

  logInfo("Finished sync pipeline in %s", formatDuration(startedAt));
}

export function sha256(str: string): string {
  const hash = crypto.createHash("sha256");

  hash.update(str);

  return hash.digest("hex");
}

async function main(): Promise<void> {
  await syncEkosystemData();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
