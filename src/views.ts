import * as ejs from "ejs";
import { existsSync } from "fs";
import * as path from "path";

const root = path.join(import.meta.dirname, "./../views")

if (!existsSync(root)) {
  throw new RangeError(`"${root}" not found`)
}

export function renderView(view: string, data = {}) {
  return ejs.renderFile(path.join(root, view), data)
}
