import { fastMapJoin } from "../helpers/fast-map-join";
import { escape } from "../helpers/html";

interface Props {
  query: string
  results: {
    id: string
    name: string
    categories: {
      name: string
    }[]
  }[]
}

export function searchView(props: Props) {
  return /*html*/ `
    <div class="main-container">
    ${props.results.length === 0 ? `<h4 class="text-center text-muted font-weight-light">Nothing found</h4>` : ``}

    ${fastMapJoin(props.results, result => /*html*/`
      <p>
        <h5>${escape(result.name)}</h6>
        <div>
          ${fastMapJoin(result.categories, category => /*html*/`
            <a class="btn btn-sm btn-outline-primary" href="/search?q=${decodeURIComponent(category.name)}">${escape(category.name)}</a>
          `)}
        </div>
      </p>
    `)}
    </div>
  `
}