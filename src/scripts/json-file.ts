import fs from "node:fs";

export function readJsonFile<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, "utf8")) as T;
}

export function writeJsonFile(path: string, value: unknown): void {
  fs.writeFileSync(path, JSON.stringify(value, null, 2));
}
