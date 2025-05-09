import { html } from "../html.js"

export function renderLayout(body: unknown, query: string) {
  return html`
<div class="main-container">
  <header>
    <a href="/" class="d-block ml-auto mr-auto pt-3 pb-3 text-center">
      <img class="d" src="./img/logo.svg" height="19" />
    </a>
  </header>
  <form action="/search" method="GET">
    <div class="input-group mb-3">
      <input class="form-control" name="q" value="${query}" placeholder="gdzie wyrzucic ..." type="search"
        required="">
      <div class="input-group-append">
        <button class="btn btn-dark" type="submit">Szukaj</button>
      </div>
    </div>
  </form>
</div>

${body}
`
}