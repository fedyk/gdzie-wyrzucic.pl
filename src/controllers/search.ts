import { format } from "util";
import { Middleware } from "koa";
import * as querystring from "querystring";
import * as storage from "../storage"
import { AppContext, AppState, Category2, Point } from "../types";
import { renderView } from "../views";
import { GOOGLE_MAPS_STATIC_API_KEY } from "../config";
import { renderMarkdown } from "../remarkable";

export const search: Middleware<AppState, AppContext> = async function (ctx) {
  const queryParams = parseQueryParams(ctx.request.query)

  if (queryParams.wasteId) {
    const waste = storage.getWastesById(queryParams.wasteId)

    if (!waste) {
      return ctx.throw(new Error("Page doesn't exist"), 404)
    }

    ctx.state.headerQuery = waste.name
    ctx.body = await renderView("search/results.ejs", {
      results: buildSearchResults([{
        item: waste,
        refIndex: 0,
      }])
    })
    return
  }

  if (queryParams.categoryId) {
    const category = storage.getCategoryById(queryParams.categoryId)
    const points = storage.findPointsByCategoryId(queryParams.categoryId)

    if (!category) {
      return ctx.throw(new Error("Category does not exist"), 404)
    }

    ctx.state.title = format(ctx.i18n("Gdzie wyrzucić · %s"), queryParams.query)
    ctx.state.headerQuery = category.name;
    ctx.body = await renderCategory(category, points)
    return
  }

  if (queryParams.query.length === 0) {
    return ctx.redirect("/")
  }

  const hits = storage.search(queryParams.query)

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), queryParams.query)
  ctx.state.headerQuery = queryParams.query;
  ctx.body = await renderView("search/results.ejs", {
    results: buildSearchResults(hits)
  })
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
      url: "/search?" + querystring.stringify({ wid: id }),
      categories: categoryIds.map(categoryId => {
        const category = storage.getCategoryById(categoryId)
        const name = category?.name ?? "Unknown category"
        const url = "/search?" + querystring.stringify({ q: name, cid: categoryId, })

        return {
          url,
          name
        }
      })
    }
  })
}

function renderCategory(category: Category2, points: Point[]) {
  const mapUrl = points.length > 0 ? getMapURL(points) : void 0
  const description = category.description ? renderMarkdown(category.description) : void 0

  return renderView("search/category.ejs", {
    description,
    category,
    points,
    mapUrl
  })
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