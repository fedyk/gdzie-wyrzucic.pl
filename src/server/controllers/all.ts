import * as storage from "../storage.js"
import { Middleware } from "../types.js";
import { renderResults } from "../views/results.js";
import { categoryPath, setPageMeta, wastePath } from "../seo.js";

export const all: Middleware = async function (ctx) {
  const wastes = storage.getWastes()

  setPageMeta(ctx, {
    title: "Lista odpadów · Gdzie wyrzucić",
    description: "Pełna lista odpadów z informacją, do jakiego pojemnika lub punktu odbioru je oddać.",
    canonicalPath: "/all",
  })

  ctx.body = await renderResults({
    heading: "Lista odpadów",
    results: getResults(wastes)
  })
}

function getResults(wastes: ReturnType<typeof storage.getWastes>) {
  return wastes.map(function (waste) {
    return {
      id: waste.id,
      name: waste.name,
      url: wastePath(waste),
      categories: waste.categoryIds.map(categoryId => {
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
