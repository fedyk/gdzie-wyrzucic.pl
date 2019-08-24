
import { fastMapJoin } from "../helpers/fast-map-join";
import { escape } from "../helpers/html";

interface Props {
  query: string;
}

export function searchView(props: Props) {
  return /*html*/ `
    <h1>Search ${escape(props.query)}</h1>
  `
}