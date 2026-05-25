export class HTML {
  constructor(private html: string) { }

  toString() {
    return this.html
  }

  toJSON() {
    throw new RangeError("HTML can't be serialized")
  }
}

export function html(strings: TemplateStringsArray, ...values: unknown[]) {
  let result = ""

  for (let i = 0; i < strings.length; i++) {
    result += leftLineTrim(strings[i])

    const value = values[i]

    if (typeof value === "string") {
      result += escapeHTML(value)
    }
    else if (value === false) {
      // do nothing
    }
    else if (value == null) {
      // do nothing
    }
    else {
      result += String(value)
    }
  }

  return new HTML(result)
}

export function each<T>(items: T[], callback: (item: T, index: number, items: T[]) => HTML) {
  let result = ""

  for (let i = 0; i < items.length; i++) {
    result += String(callback(items[i], i, items))
  }

  return new HTML(result)
}

/**
 * @example html`<a data="${json({ a: "b" })}">...</a>`
 */
export function json(value: any) {
  return new HTML(JSON.stringify(value))
}

function escapeHTML(str: string) {
  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function leftLineTrim(str: string) {
  return str.replace(/\n\s+/ig, "\n")
}
