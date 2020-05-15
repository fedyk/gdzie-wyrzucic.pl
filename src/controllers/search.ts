import { format } from "util";
import { Middleware } from "koa";
import { RequestParams } from "@elastic/elasticsearch";
import { searchView } from "../views/search-view";
import { AppContext, AppState, Waste, Category } from "../types";
import { SearchHit } from "../elastic/types";
import { WASTES_INDEX, CATEGORIES_INDEX } from "../elastic/constants";

export const search: Middleware<AppState, AppContext> = async function(ctx) {
  const query = parseQueryParams(ctx.request.query)

  if (query.q.length === 0) {
    return ctx.redirect("/")
  }

  const response = await ctx.elastic.search(buildWasteSearchParams(query.q))

  const categoryIds = parseSearchResultCategoryIds(response.body);

  const categories = await ctx.elastic.search(buildCategoriesSearchParams(categoryIds)).then(function ({ body }) {
    return parseCategories(body)
  })

  const searchResults = buildSearchResults(response.body, categories);

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
    from: 0,
    size: 25
  }

  if (query && query.q) {
    queryParams.q = String(query.q).trim()
  }

  if (query && query.from) {
    const from = Number(query.from);

    if (!Number.isNaN(from) && from <= 1000 && from >= 0) {
      queryParams.from = from
    }
  }

  if (query && query.size) {
    const size = Number(query.size);

    if (!Number.isNaN(size) && size <= 25 && size >= 5) {
      queryParams.size = size
    }
  }

  return queryParams
}

/**
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html
 */
function buildWasteSearchParams(searchQuery: string, from = 0, size = 25): RequestParams.Search {
  return {
    index: WASTES_INDEX,
    from: 0,
    size: 25,
    body: {
      query: {
        fuzzy: {
          "name.pl": {
            value: searchQuery,
            fuzziness: "AUTO",
            prefix_length: 0
          }
        }
      }
    }
  }
}

function buildCategoriesSearchParams(categoryIds: Set<string>): RequestParams.Search {
  return {
    index: CATEGORIES_INDEX,
    body: {
      size: categoryIds.size,
      query: {
        ids: {
          values: Array.from(categoryIds)
        }
      }
    }
  }
}

function parseSearchResultCategoryIds(searchResults: any): Set<string> {
  const hits: SearchHit<Waste>[] = searchResults.hits.hits;
  const categoryIds = new Set<string>()

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const categories = hit._source.categories;

    for (let j = 0; j < categories.length; j++) {
      if (!categories[j].id) {
        console.warn("category", categories[j], "has no id")
      }

      categoryIds.add(categories[j].id)
    }
  }

  return categoryIds;
}

function parseCategories(response: any) {
  const hits: SearchHit<Category>[] = response.hits.hits
  const categories = new Map<string, Category>()

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];

    categories.set(hit._id, hit._source)
  }

  return categories;
}

function buildSearchResults(searchResults: any, categories: Map<string, Category>) {
  const hits: SearchHit<Waste>[] = searchResults.hits.hits;

  return hits.map(function (hit) {
    const { _id: id, _source: waste } = hit

    return {
      id: id,
      name: waste.name.pl,
      categories: waste.categories.map(function ({ id }) {
        const category = categories.get(id)
        const name = category ?category.name.pl :  "Unknown category"

        return {
          name
        }
      })
    }
  })
}
