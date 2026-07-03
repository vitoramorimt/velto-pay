export function createProductSlug(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "produto";
}

export function appendSlugSuffix(slug: string, suffix: number): string {
  return `${slug}-${suffix}`;
}

const randomSlugAlphabet = "abcdefghijkmnopqrstuvwxyz23456789";

export function createRandomProductSlug(length = 8): string {
  const values = crypto.getRandomValues(new Uint8Array(length));
  const token = Array.from(values, (value) => {
    return randomSlugAlphabet[value % randomSlugAlphabet.length];
  }).join("");

  return `vp-${token}`;
}
