import { each, html } from "../html.js"

export function renderWelcome(queries: {
  url: string
  text: string
}[]) {
  return html`
<div class="main-container text-center">
  <nav class="my-2 my-md-0 mr-md-3">
    ${each(queries, query => html`<a class="pb-2 d-block" href="${query.url}">${query.text}</a>`)}
  </nav>
</div>
`
}