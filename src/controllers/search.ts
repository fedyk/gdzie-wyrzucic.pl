import { format } from "util";
import { Middleware } from "koa";
import * as storage from "../storage"
import { AppContext, AppState } from "../types";
import { fastMapJoin } from "../helpers/fast-map-join";
import { escape } from "../helpers/html";

export const search: Middleware<AppState, AppContext> = async function (ctx) {
  const query = parseQueryParams(ctx.request.query)

  if (query.q.length === 0) {
    return ctx.redirect("/")
  }

  const hits = storage.search(query.q)
  const searchResults = buildSearchResults(hits);

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), query.q)
  ctx.state.headerQuery = query.q;
  ctx.body = render({
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

interface Props {
  query: string
  results: {
    id: string
    name: string
    categories: {
      name: string
    }[]
  }[]
}

function render(props: Props) {
  return /*html*/ `
    <div class="main-container px-3">
    ${props.results.length === 0 ? `<h4 class="text-center text-muted font-weight-light">Nothing found</h4>` : ``}

    ${fastMapJoin(props.results, result => /*html*/`
      <p>
        <h5>${escape(result.name)}</h6>
        <div>
          ${fastMapJoin(result.categories, category => /*html*/`
            <a class="btn btn-sm btn-outline-primary" href="/search?q=${decodeURIComponent(category.name)}">${escape(category.name)}</a>
          `)}
        </div>
      </p>
    `)}
    </div>
  `
}
