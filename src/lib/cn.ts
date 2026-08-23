/**
 * Join class names, skipping falsy values. Deliberately tiny — this template
 * does not ship a CSS-in-JS runtime or a utility framework.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
