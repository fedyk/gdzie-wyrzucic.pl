import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { fastMapJoin } from "../helpers/fast-map-join";
import { stylesheet, script, escape } from "../helpers/html";

/**
 * @example
 * 
 * Code:
 * ```
 * router.get("/", templateMiddleware, async (ctx) => {
 *   ctx.body = "Hello";
 * })
 * ```
 */
export const templateMiddleware: Middleware<AppState, AppContext> = async function(ctx, next) {
  ctx.state.title = ""   
  ctx.state.description = ""
  ctx.state.scripts = []
  ctx.state.styles = []

  await next()

  ctx.response.type = "html"

  ctx.body = render({
    title: ctx.state.title,
    description: ctx.state.description,
    scripts: ctx.state.scripts,
    styles: ctx.state.styles,
    body: ctx.body,
  })
}

interface Props {
  title: string;
  description: string;
  styles: string[];
  scripts: string[];
  body: string;
}

export const render = (props: Props) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" href="/img/favicon.png" type="image/png">
    <title>${escape(props.title)}</title>
    ${props.description ? `<meta name="description" content="${escape(props.description)}">` : ""}
    ${fastMapJoin(props.styles, (href => stylesheet(href)))}
  </head>
  <body>
    ${props.body}
    ${fastMapJoin(props.scripts, (src => script(src)))}
  </body>
</html>`
