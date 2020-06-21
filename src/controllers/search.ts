import { format } from "util";
import { Middleware } from "koa";
import * as querystring from "querystring";
import * as storage from "../storage"
import { AppContext, AppState } from "../types";
import { fastMapJoin } from "../helpers/fast-map-join";
import { escapeHtml } from "../helpers/html";

export const search: Middleware<AppState, AppContext> = async function (ctx) {
  const queryParams = parseQueryParams(ctx.request.query)

  if (queryParams.query.length === 0) {
    return ctx.redirect("/")
  }

  const hits = storage.search(queryParams.query)

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), queryParams.query)
  ctx.state.headerQuery = queryParams.query;
  ctx.body = render(buildSearchResults(hits))
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

function render(results: ReturnType<typeof buildSearchResults>) {
  return /*html*/ `
    <div class="main-container px-3">
    ${results.length === 0 ? `<h4 class="text-center text-muted font-weight-light">Nothing found</h4>` : ``}

    ${fastMapJoin(results, result => /*html*/`
      <p>
        <h5>${escapeHtml(result.name)}</h6>
        <div>
          ${fastMapJoin(result.categories, c => renderCategory(c.id, c.name))}
        </div>
      </p>
    `)}
    </div>
  `
}

function renderCategory(id: string, name: string) {
  const query = querystring.stringify({
    q: name,
    cid: id,
  })
  return `<a class="btn btn-sm btn-outline-primary" href="/search?${query}">${escapeHtml(name)}</a>`
}
