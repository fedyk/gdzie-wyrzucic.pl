interface Props {
  body: string;
}

export const layoutView = (props: Props) => `<!doctype html>
  <div class="layout">
    <div class="layout__header">
      <div class="container">
        <div class="header">Header</div>
      </div>
    </div>

    <div class="layout__body">
      <div class="container">
        ${props.body}
      </div>
    </div>
  </div>
`
