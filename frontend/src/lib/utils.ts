export type ClassValue = string | false | null | undefined

/**
 * Une clases condicionales y descarta las falsas.
 * Sustituye a `clsx`/`tailwind-merge`: ya no hay Tailwind que deduplicar.
 */
export function cx(...values: ClassValue[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ')
}
