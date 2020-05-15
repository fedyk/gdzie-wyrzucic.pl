import { format } from "util";
import { Middleware } from "koa";
import * as storage from "../storage"
import { searchView } from "../views/search-view";
import { AppContext, AppState } from "../types";

export const search: Middleware<AppState, AppContext> = async function (ctx) {
  const query = parseQueryParams(ctx.request.query)

  if (query.q.length === 0) {
    return ctx.redirect("/")
  }

  const hits = storage.search(query.q)
  const searchResults = buildSearchResults(hits);

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), query.q)
  ctx.state.headerQuery = query.q;
  ctx.body = searchView({
    query: ctx.query.q,
    results: searchResults
  })
}

function parseQueryParams(query: any) {
  const queryParams = {
    q: "",
  }

  if (query && query.q) {
    queryParams.q = String(query.q).trim()
  }

  return queryParams
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
          name
        }
      })
    }
  })
}
