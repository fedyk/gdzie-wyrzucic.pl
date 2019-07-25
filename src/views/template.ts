import { AppState } from "../types/app-state";
import { fastMapJoin } from "../helpers/fast-map-join";
import { stylesheet, script } from "../helpers/html";

interface Props {
  title: string;
  description: string;
  styles: string[];
  scripts: string[];
  body: string;
}

export const templateView = (props: Props) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${escape(props.title)}</title>
    <meta name="description" content="${escape(props.description)}">
    ${fastMapJoin(props.styles, (href => stylesheet(href)))}
  </head>
  <body>
    ${props.body}
    ${fastMapJoin(props.scripts, (src => script(src)))}
  </body>
</html>`
