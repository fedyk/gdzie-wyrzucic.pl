import { ParameterizedContext } from "koa";
import { searchView } from "../views/search-view";
import { AppContext, AppState } from "../types";
import { searchWaste } from "../elastic";

export async function search(ctx: ParameterizedContext<AppState, AppContext>) {
  const searchQuery = (ctx.query.q + "").trim()
  const searchHits = await searchWaste(ctx.elasticClient, searchQuery);

  const searchResults = searchHits.map(hit => {
    const categories = hit._source.categories.map(category => {
      return {
        name: category.categoryName
      }
    });

    return {
      id: hit._id,
      name: hit._source.name,
      categories
    }
  });

  ctx.state.headerQuery = searchQuery;

  ctx.body = searchView({
    query: ctx.query.q,
    results: searchResults
  })
}