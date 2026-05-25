import { each, HTML, html } from "../html.js"

export function renderCategory({
  mapUrl,
  description,
  category,
  points,
}: {
  mapUrl?: string
  description?: string
  category: {
    name: string
  }
  points: {
    name: string
    address: string
  }[]
}) {
  return html`
<div class="main-container mb-3">
  <div class="card">
    ${mapUrl && html`<img src="${mapUrl}" class="d-block w-100 h-auto" />`}

    <div class="card-body">
      <h5 class="card-title mb-2">${category.name}</h5>
      ${description && html`<div>${new HTML(description)}</div>`}
    </div>

    <div class="list-group list-group-flush">
      ${each(points, point => html`
        <a href="#" class="list-group-item list-group-item-action">
          <div>${point.name}</div>
          <div class="text-muted">${point.address}</div>
        </a>
      `)}
    </div>
  </div>

</div>
`
}