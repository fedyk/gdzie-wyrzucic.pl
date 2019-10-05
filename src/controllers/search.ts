import { format } from "util";
import { ParameterizedContext } from "koa";
import { RequestParams } from "@elastic/elasticsearch";
import { searchView } from "../views/search-view";
import { AppContext, AppState, Waste, WasteCategory } from "../types";
import { SearchHit } from "../elastic/types";
import { WASTES_INDEX, WASTE_CATEGORIES_INDEX } from "../elastic/constants";

export async function search(ctx: ParameterizedContext<AppState, AppContext>) {
  const query = parseQueryParams(ctx.request.query)

  if (query.q.length === 0) {
    return ctx.redirect("/")
  }

  const { body: response } = await ctx.elasticClient.search(buildWasteSearchParams(query.q))
  const categoryIds = parseSearchResultCategoryIds(response);

  const categories = await ctx.elasticClient.search(buildCategoriesSearchParams(categoryIds)).then(function ({ body }) {
    return parseCategories(body)
  })

  const searchResults = buildSearchResults(response, categories);

  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), query.q)
  ctx.state.headerQuery = query.q;
  ctx.state.styles.push('/css/result.css');
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
          name: {
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
    index: WASTE_CATEGORIES_INDEX,
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

function parseSearchResultCategoryIds(searchResults): Set<string> {
  const hits: SearchHit<Waste>[] = searchResults.hits.hits;
  const categoryIds = new Set<string>()

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const categories = hit._source.categories;

    for (let j = 0; j < categories.length; j++) {
      categoryIds.add(categories[j])
    }
  }

  return categoryIds;
}

function parseCategories(response: any) {
  const hits: SearchHit<WasteCategory>[] = response.hits.hits
  const categories = new Map<string, WasteCategory>()

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];

    categories.set(hit._id, hit._source)
  }

  return categories;
}

function buildSearchResults(searchResults: any, categories: Map<string, WasteCategory>) {
  const hits: SearchHit<Waste>[] = searchResults.hits.hits;

  return hits.map(function (hit) {
    const { _id: id, _source: waste } = hit

    return {
      id: id,
      name: waste.name,
      categories: waste.categories.map(function (id) {
        const name = categories.has(id) ? categories.get(id).name : "Unknown"
  
        return {
          name
        }
      })
    }
  })
}
