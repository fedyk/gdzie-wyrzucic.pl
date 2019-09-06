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
    <h1>Search ${escape(props.query)}</h1>
    <div class="results">
      ${fastMapJoin(props.results, result => /*html*/`
        <div class="result-item">
          <h6 class="result-item-name">${escape(result.name)}</h6>
          <div class="result-item-categories">
            ${fastMapJoin(result.categories, category => /*html*/`
              <span class="result-item-category">${escape(category.name)}</span>
            `)}
          </div>
        </div>
      `)}
    </div>
  `
}