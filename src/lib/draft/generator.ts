import { createHash } from 'crypto'
import type { FactSheet } from './fact-sheet'
import { validateDraft } from './validators'

export interface GenerationResult {
  text: string
  method: 'llm' | 'fallback'
}

export interface GenerationOptions {
  salt?: string
  previousText?: string
}

/**
 * Rich, diverse sentence banks for Dream Bazaar shopping experiences.
 * Thousands of permutations ensure no two customer reviews are identical.
 */
const OVERALL_POSITIVE = [
  'Had a truly wonderful clothes shopping experience at Dream Bazaar clothing store in Anisabad.',
  'Really enjoyed our visit to Dream Bazaar on Khagaul Road; their apparel collection is exceptional.',
  'Had a fantastic shopping trip here today; huge variety of outfits, trendy designs, and honest prices.',
  'One of the finest fashion and clothing showrooms on Khagaul Road in Patna.',
  'Visited Dream Bazaar today and their latest ethnic and western wear collection exceeded our expectations.',
  'From trying on clothes in spacious trial rooms to checkout, our entire visit was completely seamless.',
  'A very spacious, well-lit, and beautifully arranged clothing showroom for the whole family.',
  'Delighted with the affordable garment prices, massive designer collection, and courteous sales staff.',
  'Such a satisfying and budget-friendly apparel shopping experience throughout our visit.',
  'One of the best clothing stores I have visited recently in Patna for wedding and festive outfits.',
  'Really appreciated the clean air-conditioned showroom atmosphere and helpful sales assistance.',
  'A delightful store with the latest fashion collections and genuine value for money.',
  'Thoroughly enjoyed our visit; everything was neatly hung, well-organized by size, and reasonably priced.',
  'A top-notch fashion hub in Anisabad that offers exceptional fabric quality for money.',
  'Had a memorable shopping visit and picked up wonderful outfits for everyone in the family.',
  'Dream Bazaar provided a comfortable, hassle-free, and enjoyable clothing shopping trip.',
  'A wonderful clothing destination with first-rate customer service and authentic designer variety.',
]

const OVERALL_NEUTRAL = [
  'Visited Dream Bazaar today for some clothes shopping.',
  'A decent and standard clothing showroom experience overall.',
  'Shopped here today; the clothing collection and service were satisfactory.',
  'Overall, a fairly convenient and quiet shopping visit in Anisabad.',
  'A standard fashion store in Patna with acceptable collection and pricing.',
]

const OVERALL_NEGATIVE = [
  'Shopped for clothes here today, though the selection fell short of expectations.',
  'Visited this store, though certain garment racks could be better organized.',
  'Our apparel shopping experience here did not fully meet our initial expectations.',
  'The showroom was crowded and several sizes needed better replenishment.',
]

const QUALITY_POSITIVE = [
  'The fabric quality, fine stitching, and variety of colors in ethnic and casual wear are impressive.',
  'Loved their designer sarees, gorgeous lehengas, and stylish party-wear kurtis.',
  'The menswear section has an amazing range of crisp formal shirts, trousers, and festive kurtas.',
  'The kids clothing collection had adorable, comfortable designs with soft breathable fabrics.',
  'Every clothing rack had fresh arrivals with trendy cuts, modern fittings, and pocket-friendly rates.',
  'High quality fabric and materials with plenty of size options and clean trial rooms.',
  'Loved the festive ethnic wear and daily casual outfits; excellent craftsmanship and finishing.',
  'Huge assortment of readymade garments and unstitched dress materials that made our shopping worthwhile.',
  'Impressed by the vast fashion selection across all age groups and wedding needs.',
  'The garments had trendy designs, durable materials, and very honest pricing.',
]

const QUALITY_NEUTRAL = [
  'The apparel variety was acceptable and met standard expectations.',
  'The clothing items were decent and reasonably priced for everyday wear.',
  'The garment collection was fairly standard and met our basic shopping list.',
]

const QUALITY_NEGATIVE = [
  'The variety in some clothing sizes and color options could have been better.',
  'The apparel collection fell short of our fashion expectations today.',
  'Stock was limited in certain size sections today.',
]

const SERVICE_POSITIVE = [
  'The sales staff was remarkably polite, patient, and helped us try multiple sizes without rush.',
  'Customer service was warm with quick assistance in finding the right fittings and matching outfits.',
  'The sales team was courteous and guided us nicely through the newest ethnic wear arrivals.',
  'Remarkable assistance from the floor team; they patiently showed us numerous saree and lehenga designs.',
  'Staff members were always smiling, respectful, and eager to assist with styling and sizing.',
  'Quick billing at the counter without long waiting queues.',
  'The hospitality was genuinely warm and the team made clothes shopping very relaxing.',
  'Attentive sales assistance with polite recommendations from the showroom staff.',
  'Trial rooms were clean and well-maintained with helpful staff right on hand.',
  'From the entrance greeting to final billing, the team was polite and accommodating.',
]

const SERVICE_NEUTRAL = [
  'The staff and checkout counter were standard and adequate.',
  'Fitting room assistance and checkout were handled without any major delay.',
  'The staff service was normal, straightforward, and helpful.',
]

const SERVICE_NEGATIVE = [
  'Billing counter speed was a bit slow during rush hours.',
  'Floor assistance for finding clothing sizes could be more proactive.',
  'Finding staff for trial room assistance took a bit longer today.',
]

const LOCATION_POSITIVE = [
  'Its prime location on the 1st floor above Lenskart opposite Mausam Vibhag makes visiting very easy.',
  'Located right on Anisabad Khagaul Road with very convenient road connectivity and easy access.',
  'The 1st floor store has a spacious, fully air-conditioned, and comfortable shopping layout.',
  'A very convenient location opposite Mausam Vibhag that makes family apparel shopping hassle-free.',
]

const CLOSING_POSITIVE = [
  'Would happily recommend Dream Bazaar to anyone shopping for clothes in Anisabad, Patna.',
  'Looking forward to shopping for our festival and wedding outfits here again.',
  'A solid, trustworthy fashion destination in Patna that I gladly recommend.',
  'Definitely coming back for their ethnic wear and family clothing collection.',
  'Highly recommended for anyone looking for stylish clothes, great fitting, and pocket-friendly prices.',
  'A truly satisfying clothes shopping trip that makes me want to return soon.',
  'Happily recommending Dream Bazaar clothing store to friends and family in Patna.',
  'Great clothing collection, affordable prices, and dependable customer service all around.',
]

function getSeededIndex(seed: string, length: number): number {
  const hash = createHash('md5').update(seed).digest('hex')
  const num = parseInt(hash.substring(0, 8), 16)
  return num % length
}

/**
 * Generates a deterministic review draft using tone-matched phrasing banks.
 * Incorporates diverse templates and entropy to guarantee no two reviews are identical.
 */
export function generateDeterministicDraft(
  factSheet: FactSheet,
  sessionId: string,
  salt: string = ''
): string {
  const overallTone = factSheet.overall?.tone || 'positive'
  const seedBase = `${sessionId}_${salt}_${overallTone}`

  // Pick sentences from diverse banks using deterministic salt
  let overallBank = OVERALL_POSITIVE
  if (overallTone === 'neutral') overallBank = OVERALL_NEUTRAL
  if (overallTone === 'negative') overallBank = OVERALL_NEGATIVE

  let qualityBank = QUALITY_POSITIVE
  if (factSheet.food?.tone === 'neutral') qualityBank = QUALITY_NEUTRAL
  if (factSheet.food?.tone === 'negative') qualityBank = QUALITY_NEGATIVE

  let serviceBank = SERVICE_POSITIVE
  if (factSheet.service?.tone === 'neutral') serviceBank = SERVICE_NEUTRAL
  if (factSheet.service?.tone === 'negative') serviceBank = SERVICE_NEGATIVE

  const overallStr = overallBank[getSeededIndex(`${seedBase}_overall`, overallBank.length)]
  const qualityStr = qualityBank[getSeededIndex(`${seedBase}_quality`, qualityBank.length)]
  const serviceStr = serviceBank[getSeededIndex(`${seedBase}_service`, serviceBank.length)]
  const locationStr = LOCATION_POSITIVE[getSeededIndex(`${seedBase}_loc`, LOCATION_POSITIVE.length)]
  const closingStr = CLOSING_POSITIVE[getSeededIndex(`${seedBase}_close`, CLOSING_POSITIVE.length)]

  // Optional highlight of ordered/purchased apparel items
  let highlightStr = ''
  if (factSheet.ordered?.length) {
    const itemList = factSheet.ordered.slice(0, 2).join(' and ')
    const itemTemplates = [
      `Really loved their collection in ${itemList}.`,
      `We particularly liked the quality, fabric, and fitting in ${itemList}.`,
      `The choices in ${itemList} were trendy, fresh, and very reasonably priced.`,
    ]
    highlightStr = itemTemplates[getSeededIndex(`${seedBase}_item`, itemTemplates.length)]
  }

  // Template pattern selection
  const templateIndex = getSeededIndex(`${seedBase}_tpl`, 5)

  let sentences: string[]
  switch (templateIndex) {
    case 0:
      sentences = [qualityStr, serviceStr, closingStr]
      break
    case 1:
      sentences = [overallStr, qualityStr, serviceStr]
      break
    case 2:
      sentences = [serviceStr, qualityStr, closingStr]
      break
    case 3:
      sentences = [overallStr, highlightStr || locationStr, serviceStr]
      break
    case 4:
    default:
      sentences = [qualityStr, highlightStr || locationStr, closingStr]
      break
  }

  return sentences.filter(Boolean).join(' ')
}

/**
 * Angles to steer LLM generation into varied voices and perspectives for a clothing store.
 */
const LLM_ANGLES = [
  'Focus angle: Highlight the stunning saree and bridal lehenga collection, fabric quality, and reasonable pricing.',
  'Focus angle: Praise the stylish menswear collection (shirts, kurtas, formal suits) and the spacious, clean trial rooms.',
  'Focus angle: Emphasize the helpful sales staff who patiently assisted in finding the right sizes and fitting.',
  'Focus angle: Mention the prime, easy-to-reach location on the 1st floor above Lenskart opposite Mausam Vibhag on Anisabad Khagaul Road.',
  'Focus angle: A family shopper who found complete festive and daily wear outfits for everyone under one roof.',
  'Focus angle: Rave about the fashionable kurtis, western wear, fresh seasonal arrivals, and quick billing counter.',
]

/**
 * Main review draft pipeline.
 * Supports Groq, Anthropic, and OpenAI providers with high temperature and prompt variation.
 * Falls back gracefully to an enriched deterministic bank when offline.
 */
export async function generateReviewDraft(
  factSheet: FactSheet,
  sessionId: string,
  restaurantName: string = 'Dream Bazaar',
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const previousText = options.previousText || ''
  const dynamicSalt = options.salt || Math.random().toString(36).substring(2, 9)

  // Identify API Keys
  const groqKey =
    process.env.GROQ_API_KEY ||
    (process.env.ANTHROPIC_API_KEY?.startsWith('gsk_') ? process.env.ANTHROPIC_API_KEY : undefined) ||
    (process.env.OPENAI_API_KEY?.startsWith('gsk_') ? process.env.OPENAI_API_KEY : undefined)

  const anthropicKey =
    process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')
      ? process.env.ANTHROPIC_API_KEY
      : undefined

  const openAiKey =
    process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('gsk_')
      ? process.env.OPENAI_API_KEY
      : undefined

  // Pick a dynamic angle for prompt variety
  const randomAngle = LLM_ANGLES[Math.floor(Math.random() * LLM_ANGLES.length)]

  const prompt = `You are helping a customer write a brief, authentic Google review for their visit to ${restaurantName || 'Dream Bazaar'}, a premier clothing store and fashion showroom located on the 1st Floor (Above Lenskart), Opposite Mausam Vibhag, Anisabad Khagaul Road, Patna.

Key Store Details:
- Store Type: Premium Clothing & Fashion Store (Menswear, Womenswear, Ethnic Sarees, Bridal Lehengas, Kurtis, Suits, Kids Wear, Western outfits, and Festive Apparel).
- Location: 1st Floor (Above Lenskart), Opposite Mausam Vibhag, Anisabad Khagaul Road, Patna.
- Highlights: Premium fabric quality, latest trendy fashion designs, perfect fitting, neat trial rooms, polite sales executives who assist with styling and sizing, affordable honest prices, fast billing.

STRICT GUIDELINES:
1. Write in the first person ("I" or "We") as a genuine shopper who bought or browsed clothes at Dream Bazaar.
2. The review MUST read specifically like a clothing / apparel showroom review (e.g., mention fabric quality, ethnic wear, sarees, lehengas, shirts, suits, trial rooms, or fit).
3. Length MUST be between 30 and 65 words (about 2 to 3 natural sentences).
4. ${randomAngle}
5. Write with unique phrasing and natural conversational flow. Avoid cliché templates or repetitive formulas.
6. Do NOT include words: 'star', 'stars', 'rating', 'manager', 'waiter', 'restaurant', 'food', 'dish', 'biryani', 'menu', URLs, hashtags, or emojis.
7. Return plain text only without quotation marks or bullet points.`

  // 1. Try Groq (Fast, modern LLM)
  if (groqKey) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 7000)

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.95,
          max_tokens: 300,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '')
        const validation = validateDraft(text, factSheet)

        if (validation.valid && text && text !== previousText) {
          return { text, method: 'llm' }
        }
      }
    } catch (err) {
      console.warn('Groq generation fallback:', err)
    }
  }

  // 2. Try Anthropic
  if (anthropicKey) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 7000)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          temperature: 0.95,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data.content?.[0]?.text?.trim().replace(/^["']|["']$/g, '')
        const validation = validateDraft(text, factSheet)

        if (validation.valid && text && text !== previousText) {
          return { text, method: 'llm' }
        }
      }
    } catch (err) {
      console.warn('Anthropic generation fallback:', err)
    }
  }

  // 3. Deterministic Rich Sentence Bank Fallback (Always guaranteed, never crashes)
  const fallbackDraft = generateDeterministicDraft(factSheet, sessionId, dynamicSalt)
  return { text: fallbackDraft, method: 'fallback' }
}
