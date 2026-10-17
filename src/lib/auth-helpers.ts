/**
 * Dream Bazaar Authentication & Alias Helpers
 */

export const DREAM_BAZAAR_PRIMARY_EMAIL = 'admin@dreambazaar.com'
export const MOTU_SETH_PRIMARY_EMAIL = 'admin@dreambazaar.com'
export const RESIDENCE_INN_PRIMARY_EMAIL = 'admin@dreambazaar.com'

const DREAM_ALIASES = new Set([
  'admin',
  'owner',
  'dream',
  'dreambazaar',
  'dream-bazaar',
  'admin@dreambazaar.com',
  'owner@dreambazaar.com',
  'motu',
  'motuseth',
  'motu-seth',
  'admin@motuseth.com',
  'owner@motuseth.com',
  'residency',
  'admin@residency.com',
  'owner@residency.com',
])

/**
 * Resolves any administrator alias or custom email
 * to the registered Dream Bazaar admin email.
 */
export function resolveZaikaEmail(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()
  if (DREAM_ALIASES.has(lower)) {
    return DREAM_BAZAAR_PRIMARY_EMAIL
  }

  return trimmed
}
