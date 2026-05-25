import { each, html } from "../html.js";

export function renderResults({
  heading,
  emptyMessage,
  results
}: {
  heading: string
  emptyMessage?: string
  results: {
    name: string
    url: string
    categories: {
      name: string
      url: string
    }[]
  }[]
}) {
  return html`
    <div class="main-container">
      <h1 class="h4 mb-3">${heading}</h1>

      ${results.length === 0 && html`<p class="text-center text-muted font-weight-light">${emptyMessage || "Nic nie znaleziono"}</p>`}

      ${each(results, result => html`
        <a class="d-block h6" href="${result.url}">${result.name}</a>
        <div class="mb-2">
          ${each(result.categories, category => html`
            <a class="btn btn-sm btn-outline-dark mb-2 mr-2" href="${category.url}">${category.name}</a>  
          `)}
        </div>  
      `)}
    </div>
  `
}
