import { escape, attrs } from "../helpers/html";

interface Props {
  query: string;
  body: string;
}

export const layoutView = (props: Props) => `<!doctype html>
  <div class="layout">
    <div class="layout__header">
      <div class="container">
        ${renderHeader({
          query: props.query
        })}
      </div>
    </div>

    <div class="layout__body">
      <div class="container">
        ${props.body}
      </div>
    </div>
  </div>
`

function renderHeader(props: { query: string | null }) {
  return /*html*/`
    <div class="search">
      <form action="/search" method="GET">
        <input class="search__input" name="q" ${attrs({
          value: props.query,
          placeholder: "gdzie wyrzucic ..."
        })}/>
        <button type="submit" class="search__btn">Search</button>
      </form>
    </div>
  `
}
