export function cleanProfessorName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(Prof\.|Professor|Dr\.)\s+/i, "")
}

export function isPlaceholder(name: string): boolean {
  return !name || /^(staff|tba|to be announced|tbd|unknown)$/i.test(name)
}
