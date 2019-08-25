import { fastMapJoin } from "../helpers/fast-map-join";
import { escape } from "../helpers/html";

interface Props {
  query: string;
  results: {
    name: string;
    id: string;
    categories: {
      name: string
    }[]
  }[]
}

export function searchView(props: Props) {
  return /*html*/ `
    <h1>Search ${escape(props.query)}</h1>
    <div>
      ${fastMapJoin(props.results, result => /*html*/`
        <code>${JSON.stringify(result, null, 2)}</code>
      `)}
    </div>
  `
}