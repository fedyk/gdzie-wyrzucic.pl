import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { escape, attrs } from "../helpers/html";

export const layout: Middleware<AppState, AppContext> = async function (ctx, next) {
  if (Array.isArray(ctx.state.styles)) {
    ctx.state.styles.push(
      "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
      "/css/main.css"
    )
  }

  if (Array.isArray(ctx.state.scripts)) {
    ctx.state.scripts.push(
      "https://code.jquery.com/jquery-3.4.1.slim.min.js",
      "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
      "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js",
    )
  }

  ctx.state.headerQuery = "";

  await next()

  ctx.body = render({
    body: ctx.body,
    query: ctx.state.headerQuery
  })
}

interface LayoutProps {
  query: string;
  body: string;
}

export const render = (props: LayoutProps) => `
  <div class="main-container">
    <header>
      <a href="/" class="d-block ml-auto mr-auto pt-3 pb-3 text-center">
        <img class="d" src="./img/logo.svg" height="19"/>
      </a>
    </header>
    <form action="/search" method="GET">
      <div class="input-group mb-3 px-3">
        <input class="form-control" ${attrs({ name: "q", value: props.query, placeholder: "gdzie wyrzucic ...", type: "search" })} required="">
        <div class="input-group-append">
          <button class="btn btn-dark" type="submit">Search</button>
        </div>
      </div>
    </form>
  </div>

  ${props.body}
`
