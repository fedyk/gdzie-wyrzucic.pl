import { each, html } from "../html.js"

export function renderTemplate({
  title,
  description,
  canonicalUrl,
  robots,
  body,
  styles,
scripts,
}: {
  title: string,
  description?: string
  canonicalUrl?: string
  robots?: string
  body: string
  styles?: string[]
  scripts?: string[]
}) {
  return html`
<!doctype html>
<html lang="pl">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" href="/img/favicon.png" type="image/png">
  <title>${title}</title>
  ${description && html`<meta name="description" content="${description}">`}
  ${canonicalUrl && html`<link rel="canonical" href="${canonicalUrl}">`}
  ${robots && html`<meta name="robots" content="${robots}">`}
  ${each(styles || [], style => html`<link rel="stylesheet" href="${style}">`)} 
</head>

<body>
  ${body}

  ${each(scripts || [], script => html`<script src="${script}"></script>`)}

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-98471166-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-98471166-1');
  </script>
</body>
</html>
`
}
