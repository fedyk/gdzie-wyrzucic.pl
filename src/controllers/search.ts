import { format } from "util";
import { Middleware } from "koa";
import * as querystring from "querystring";
import * as storage from "../storage"
import { AppContext, AppState, Category2, Point } from "../types";
import { fastMapJoin } from "../helpers/fast-map-join";
import { escapeHtml } from "../helpers/html";
import { renderView } from "../views";
import { GOOGLE_MAPS_STATIC_API_KEY } from "../config";

export const search: Middleware<AppState, AppContext> = async function (ctx) {
  const queryParams = parseQueryParams(ctx.request.query)

  if (queryParams.query.length === 0) {
    return ctx.redirect("/")
  }

  if (queryParams.categoryId) {
    const category = storage.getCategoryById(queryParams.categoryId)
    const points = storage.findPointsByCategoryId(queryParams.categoryId)

    if (!category) {
      return ctx.throw(new Error("Category does not exist"), 404)
    }

    ctx.state.title = format(ctx.i18n("Gdzie wyrzucić · %s"), queryParams.query)
    ctx.state.headerQuery = queryParams.query;
    ctx.body = await renderCategory(category, points)
    return
  }

  const hits = storage.search(queryParams.query)

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), queryParams.query)
  ctx.state.headerQuery = queryParams.query;
  ctx.body = renderResults(buildSearchResults(hits))
}

function parseQueryParams(queryParams: any = {}) {
  const query = queryParams?.q ? String(queryParams.q).trim() : ""
  const categoryId = queryParams.cid ? String(queryParams.cid) : void 0

  return {
    query,
    categoryId
  }
}

function buildSearchResults(hits: ReturnType<typeof storage.search>) {
  return hits.map(function (hit) {
    const { id, name, categoryIds } = hit.item

    return {
      id: id,
      name: name,
      categories: categoryIds.map(categoryId => {
        const category = storage.getCategoryById(categoryId)
        const name = category?.name ?? "Unknown category"

        return {
          id: categoryId,
          name
        }
      })
    }
  })
}

function renderResults(results: ReturnType<typeof buildSearchResults>) {
  return /*html*/ `
    <div class="main-container px-3">
    ${results.length === 0 ? `<h4 class="text-center text-muted font-weight-light">Nothing found</h4>` : ``}

    ${fastMapJoin(results, result => /*html*/`
      <p>
        <h6>${escapeHtml(result.name)}</h6>
        <div>
          ${fastMapJoin(result.categories, c => renderCategoryItem(c.id, c.name))}
        </div>
      </p>
    `)}
    </div>
  `
}

function renderCategoryItem(id: string, name: string) {
  const query = querystring.stringify({
    q: name,
    cid: id,
  })
  return `<a class="btn btn-sm btn-outline-primary" href="/search?${query}">${escapeHtml(name)}</a>`
}

function renderCategory(category: Category2, points: Point[]) {
  const markers = points.slice(0, 50).reduce((result, point) => result + "|" + point.lat + "," + point.lng, "color:red|size:small")
  const mapUrl = "https://maps.googleapis.com/maps/api/staticmap?" + querystring.stringify({
    center: points.length > 0 ? void 0 : "51.11328,17.0144343",
    zoom: points.length > 0 ? void 0 : 13,
    size: "600x300",
    scale: 2,
    maptype: "terrain",
    key: GOOGLE_MAPS_STATIC_API_KEY,
    markers: points.length > 0 ? markers : void 0,
    format: "png",
  })

  return renderView("search/category.ejs", { category, points, mapUrl })
}
