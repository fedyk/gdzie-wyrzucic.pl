import * as ejs from "ejs";
import * as path from "path";

const root = path.join(__dirname, "/../views")

export function renderView(view: string, data = {}) {
  return ejs.renderFile(path.join(root, view), data)
}