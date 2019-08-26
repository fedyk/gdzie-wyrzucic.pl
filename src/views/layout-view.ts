import { escape } from "../helpers/html";

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
  return /*html*/`<form action="/search" method="GET">
    <div class="header">
      <input class="header__input" type="search" name="q" value="${escape(props.query)}" placeholder="gdzie wyrzucic ..." />
      <button type="submit" class="header__btn">Search</button>
    </div>
  </form>`
}
