import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { fastMapJoin } from "../helpers/fast-map-join";

export const welcome: Middleware<AppState, AppContext> = function(ctx) {
  ctx.state.title = ctx.i18n("Jak prawidłowo segregować śmieci?")

  ctx.body = renderWelcomeView(["baterie", "maski", "rekawicyki lateksowe", ""])
}

function renderWelcomeView(recentQuery: string[]) {
  return /*html*/`
    <div class="main-container text-center">
      <nav class="my-2 my-md-0 mr-md-3">
        ${fastMapJoin(recentQuery, v => `<a class="p-2 d-block" href="/search?q=${decodeURIComponent(v)}">${v}</a>`)}
      </nav>

    </div>
  `

}
