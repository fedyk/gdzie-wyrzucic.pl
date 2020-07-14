const { Remarkable } = require('remarkable');
const md = new Remarkable()

export function renderMarkdown(markdown: string): string {
  return md.render(markdown)
}

