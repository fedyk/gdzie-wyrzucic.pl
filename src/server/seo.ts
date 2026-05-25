export const SITE_NAME = "Gdzie wyrzucić";

export function absoluteUrl(ctx: { request: { protocol: string; host: string } }, path: string) {
  return ctx.request.protocol + "://" + ctx.request.host + path;
}

export function wastePath(waste: { id: string; name: string }) {
  return "/odpady/" + slugWithId(waste.name, waste.id);
}

export function categoryPath(category: { id: string; name: string }) {
  return "/kategorie/" + slugWithId(category.name, category.id);
}

export function slugWithId(name: string, id: string) {
  return slugify(name) + "-" + id.toLowerCase();
}

export function idFromSlug(slug: string) {
  const match = slug.match(/-([a-z0-9]+)$/i);
  return match ? match[1] : "";
}

export function setPageMeta(ctx: {
  request: { protocol: string; host: string };
  state: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    robots?: string;
  };
}, options: {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: string;
}) {
  ctx.state.title = options.title;
  ctx.state.description = options.description;
  ctx.state.robots = options.robots;

  if (options.canonicalPath) {
    ctx.state.canonicalUrl = absoluteUrl(ctx, options.canonicalPath);
  }
}

export function truncateDescription(value: string, maxLength = 155) {
  const text = plainText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 1).trimEnd() + ".";
}

export function plainText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]+/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "strona";
}
