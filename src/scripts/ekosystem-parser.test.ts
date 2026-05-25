import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCategoriesFromProducts,
  parsePhraseResults,
  parsePointsFromData,
  parseProductsFromData,
  parseRawPoint,
  sha256,
  type Category,
  type PointType,
  type ProductsRaw,
} from "./ekosystem-parser.js";

test("parsePhraseResults extracts phrase categories and map links", () => {
  const results = parsePhraseResults(`
    <div class="gdzie-wrzucic-result">
      <div class="odpad-name">Bateria</div>
      <div class="pojemnik pojemnik-baterie">
        <span class="pojemnik-name">Pojemnik na baterie</span>
        <a href="https://mapa.example/?points%5B%5D=baterie">zobacz na mapie</a>
      </div>
    </div>
  `);

  assert.deepEqual(results, [
    {
      phrase: "Bateria",
      categories: [
        {
          name: "Pojemnik na baterie",
          classNames: ["pojemnik", "pojemnik-baterie"],
          links: [
            {
              href: "https://mapa.example/?points%5B%5D=baterie",
              text: "zobacz na mapie",
            },
          ],
        },
      ],
    },
  ]);
});

test("parseCategoriesFromProducts deduplicates category names and skips configured duplicates", () => {
  const products: ProductsRaw = [
    [
      "kubek",
      [
        { name: "Szklo", classNames: [], links: [] },
        { name: "Odpady zmieszane", classNames: [], links: [] },
      ],
    ],
    ["butelka", [{ name: "Szklo", classNames: [], links: [] }]],
  ];

  const categories = parseCategoriesFromProducts(products, {
    "Odpady zmieszane": "Odpady zmieszane - pojemnik oznaczony kolorem czarnym",
  });

  assert.ok(categories.some((category) => category.name === "Szklo"));
  assert.ok(!categories.some((category) => category.name === "Odpady zmieszane"));
  assert.ok(categories.some((category) => category.name === "Opakowania na zuzyte igly i strzykawki"));
});

test("parseProductsFromData maps product categories through duplicate category names", () => {
  const mixedCategoryName = "Odpady zmieszane - pojemnik oznaczony kolorem czarnym";
  const categories: Category[] = [
    { id: "AAAA1111", name: "Szklo" },
    { id: "BBBB2222", name: mixedCategoryName },
    { id: "8830C24C", name: "Opakowania na zuzyte igly i strzykawki" },
  ];
  const products: ProductsRaw = [
    [
      "kubek",
      [
        { name: "Szklo", classNames: [], links: [] },
        { name: "Odpady zmieszane", classNames: [], links: [] },
      ],
    ],
  ];

  const wastes = parseProductsFromData(categories, { "Odpady zmieszane": mixedCategoryName }, products);
  const waste = wastes.find((item) => item.name === "kubek");

  assert.deepEqual(waste, {
    id: sha256("kubek").substring(0, 8).toUpperCase(),
    name: "kubek",
    categoryIds: ["AAAA1111", "BBBB2222"],
  });
  assert.ok(wastes.some((item) => item.name === "Zuzyte igly i strzykawki"));
});

test("parseRawPoint extracts point address from info-window HTML", () => {
  const point = parseRawPoint(
    {
      position: { lat: "51.095", lng: "16.94" },
      title: "Apteka",
      useInfoWindow: {
        content: "<div><h3>Apteka</h3><p>ul. Testowa 1</p></div>",
      },
    },
    "CAT1",
  );

  assert.deepEqual(point, {
    id: sha256("51.095_16.94").substring(0, 8).toUpperCase(),
    name: "Apteka",
    lat: 51.095,
    lng: 16.94,
    address: "ul. Testowa 1",
    categoryIds: ["CAT1"],
  });
});

test("parsePointsFromData merges point categories by generated point id", () => {
  const pointTypes: PointType[] = [
    { query: "leki", categoryId: "CAT1" },
    { query: "baterie", categoryId: "CAT2" },
  ];
  const categories: Category[] = [
    { id: "CAT1", name: "Leki" },
    { id: "CAT2", name: "Baterie" },
  ];
  const rawPoint = {
    position: { lat: "51.095", lng: "16.94" },
    title: "Punkt",
    useInfoWindow: {
      content: "<div><h3>Punkt</h3><p>ul. Testowa 1</p></div>",
    },
  };

  const points = parsePointsFromData(
    pointTypes,
    [
      ["leki", [rawPoint]],
      ["baterie", [rawPoint]],
    ],
    categories,
  );

  assert.equal(points.length, 1);
  assert.deepEqual(points[0]?.categoryIds, ["CAT1", "CAT2"]);
});
