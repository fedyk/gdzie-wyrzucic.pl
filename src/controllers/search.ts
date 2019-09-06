import { format } from "util";
import { ParameterizedContext } from "koa";
import { RequestParams } from "@elastic/elasticsearch";
import { searchView } from "../views/search-view";
import { AppContext, AppState, Waste } from "../types";
import { SearchHit } from "../elastic/types";
import { WASTES_INDEX, WASTE_CATEGORIES_INDEX } from "../elastic/constants";

export async function search(ctx: ParameterizedContext<AppState, AppContext>) {
  const searchQuery = (ctx.query.q + "").trim()
  
  /**
   * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html
   */
  const { body: response } = await ctx.elasticClient.search({
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
  } as RequestParams.Search)

  const hits: SearchHit<Waste>[] = response.hits.hits;

  const categoriesIdsSet = hits.reduce(function(acc, hit) {
    (hit._source.categories || []).forEach(function(categoryId) {
      acc.add(categoryId)
    })

    return acc
  }, new Set())
  
  const categoriesResponse = await ctx.elasticClient.search({
    index: WASTE_CATEGORIES_INDEX,
    body: {
      size: categoriesIdsSet.size,
      query: {
        ids: {
          values: Array.from(categoriesIdsSet)
        }
      }
    }
  } as RequestParams.Search)

  const categories = categoriesResponse.body.hits.hits.reduce(function(acc, hit) {
    return acc.set(hit._id, hit._source), acc
  }, new Map())

  const searchResults = hits.map(function(hit) {
    return {
      id: hit._id,
      name: hit._source.name,
      categories: hit._source.categories.map(function(id) {
        const name = categories.has(id) && categories.get(id).name || "Unknown"

        return {
          name
        }
      })
    }
  })
    
  ctx.state.title = format(ctx.i18n("Gdzie wyrzucić \"%s\"?"), searchQuery)
  ctx.state.headerQuery = searchQuery;
  ctx.state.styles.push('/css/search.css');

  ctx.body = searchView({
    query: ctx.query.q,
    results: searchResults
  })
}
