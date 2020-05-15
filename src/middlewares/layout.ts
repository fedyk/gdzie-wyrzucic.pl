import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { escape, attrs } from "../helpers/html";

export const layoutMiddleware: Middleware<AppState, AppContext> = async function (ctx, next) {
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

  ctx.body = renderLayout({
    body: ctx.body,
    query: ctx.state.headerQuery
  })
}

interface LayoutProps {
  query: string;
  body: string;
}

export const renderLayout = (props: LayoutProps) => `
  ${renderLayoutHeader2(props.query)}

  ${props.body}
`

function renderLayoutHeader2(query: string) {
  return /*html*/`
    <div class="px-3 py-2 mb-3 bg-white border-bottom shadow-sm">
      <div class="main-container">
        <form action="/search" method="GET">
          <input class="form-control form-control-lg d-block" type="search" name="q" ${attrs({ value: query, placeholder: "gdzie wyrzucic ..." })}>
        </form>
      </div>
    </div>
  `
}
