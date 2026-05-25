import * as querystring from "querystring";
import * as storage from "../storage.js"
import { Middleware, Category2, Point, Waste2 } from "../types.js";
import { GOOGLE_MAPS_STATIC_API_KEY } from "../config.js";
import { renderMarkdown } from "../remarkable.js";
import { renderResults } from "../views/results.js";
import { renderCategory } from "../views/category.js";
import { categoryPath, idFromSlug, setPageMeta, truncateDescription, wastePath } from "../seo.js";

export const search: Middleware = async function (ctx) {
  const queryParams = parseQueryParams(ctx.request.query)

  if (queryParams.wasteId) {
    const waste = getWasteById(queryParams.wasteId)

    if (!waste) {
      return ctx.throw(404, new Error("Page doesn't exist"))
    }

    ctx.status = 301
    return ctx.redirect(wastePath(waste))
  }

  if (queryParams.categoryId) {
    const category = getCategoryById(queryParams.categoryId)

    if (!category) {
      return ctx.throw(404, new Error("Category does not exist"))
    }

    ctx.status = 301
    return ctx.redirect(categoryPath(category))
  }

  if (queryParams.query.length === 0) {
    return ctx.redirect("/")
  }

  const hits = storage.search(queryParams.query)

  setPageMeta(ctx, {
    title: `Gdzie wyrzucić "${queryParams.query}"?`,
    description: `Wyniki wyszukiwania dla: ${queryParams.query}. Sprawdź, do jakiego pojemnika lub punktu oddać ten odpad.`,
    canonicalPath: "/search?" + querystring.stringify({ q: queryParams.query }),
    robots: "noindex,follow",
  })
  ctx.state.headerQuery = queryParams.query;
  ctx.body = await renderResults({
    heading: `Wyniki dla: ${queryParams.query}`,
    results: buildSearchResults(hits)
  })
}

export const wastePage: Middleware = async function (ctx) {
  const waste = getWasteBySlug(String((ctx as any).params?.slug || ""))

  if (!waste) {
    return ctx.throw(404, new Error("Page doesn't exist"))
  }

  const canonicalPath = wastePath(waste)

  if (ctx.path !== canonicalPath) {
    ctx.status = 301
    return ctx.redirect(canonicalPath)
  }

  const categoryNames = waste.categoryIds
    .map(categoryId => storage.getCategoryById(categoryId)?.name)
    .filter((name): name is string => Boolean(name))

  setPageMeta(ctx, {
    title: `Gdzie wyrzucić: ${waste.name}?`,
    description: truncateDescription(`Sprawdź, gdzie wyrzucić ${waste.name}. ${categoryNames.length > 0 ? `Właściwe miejsce: ${categoryNames.join(", ")}.` : "Zobacz właściwy pojemnik lub punkt odbioru."}`),
    canonicalPath,
  })
  ctx.state.headerQuery = waste.name
  ctx.body = await renderResults({
    heading: `Gdzie wyrzucić: ${waste.name}?`,
    results: buildSearchResults([{
      item: waste,
      refIndex: 0,
    }])
  })
}

export const categoryPage: Middleware = async function (ctx) {
  const category = getCategoryBySlug(String((ctx as any).params?.slug || ""))

  if (!category) {
    return ctx.throw(404, new Error("Category does not exist"))
  }

  const canonicalPath = categoryPath(category)

  if (ctx.path !== canonicalPath) {
    ctx.status = 301
    return ctx.redirect(canonicalPath)
  }

  ctx.state.headerQuery = category.name;
  ctx.body = await Category(ctx, category)
}

function parseQueryParams(queryParams: any = {}) {
  const query = queryParams?.q ? String(queryParams.q).trim() : ""
  const wasteId = queryParams.wid ? String(queryParams.wid) : void 0
  const categoryId = queryParams.cid ? String(queryParams.cid) : void 0

  return {
    query,
    wasteId,
    categoryId
  }
}

function buildSearchResults(hits: ReturnType<typeof storage.search>) {
  return hits.map(function (hit) {
    const { id, name, categoryIds } = hit.item

    return {
      id: id,
      name: name,
      url: wastePath(hit.item),
      categories: categoryIds.map(categoryId => {
        const category = storage.getCategoryById(categoryId)
        const name = category?.name ?? "Unknown category"
        const url = category ? categoryPath(category) : "#"

        return {
          url,
          name
        }
      })
    }
  })
}

async function Category(ctx: Parameters<Middleware>[0], category: Category2) {
  const points = storage.findPointsByCategoryId(category.id)
  const mapUrl = points.length > 0 ? getMapURL(points) : void 0
  const description = category.description ? await renderMarkdown(category.description) : void 0
  const metaDescription = category.description
    ? truncateDescription(`${category.name}. ${category.description}`)
    : truncateDescription(`Zobacz, gdzie oddać odpady z kategorii ${category.name}. Sprawdź punkty odbioru i zasady segregacji.`)

  setPageMeta(ctx, {
    title: `${category.name} · Gdzie wyrzucić`,
    description: metaDescription,
    canonicalPath: categoryPath(category),
  })

  return renderCategory({
    description,
    category,
    points,
    mapUrl
  })
}

function getWasteBySlug(slug: string) {
  return getWasteById(idFromSlug(slug))
}

function getCategoryBySlug(slug: string) {
  return getCategoryById(idFromSlug(slug))
}

function getWasteById(id: string): Waste2 | undefined {
  return storage.getWastesById(id) ?? storage.getWastes().find(waste => waste.id.toLowerCase() === id.toLowerCase())
}

function getCategoryById(id: string): Category2 | undefined {
  return storage.getCategoryById(id) ?? storage.getCategories().find(category => category.id.toLowerCase() === id.toLowerCase())
}

function getMapURL(points: Point[]) {
  const markers = points
    .slice(0, 50)
    .reduce((result, point) => result + "|" + point.lat + "," + point.lng, "color:red|size:small")

  return "https://maps.googleapis.com/maps/api/staticmap?" + querystring.stringify({
    size: "600x300",
    scale: 2,
    maptype: "terrain",
    key: GOOGLE_MAPS_STATIC_API_KEY,
    markers: markers,
    format: "png",
  })
}
