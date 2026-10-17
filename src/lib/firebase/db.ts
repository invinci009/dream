import { getFirestoreDb } from './admin'
import { randomUUID } from 'crypto'

export interface BusinessDoc {
  id: string
  name: string
  unit?: string | null
  category?: string
  location?: string | null
  phone?: string | null
  secondary_phone?: string | null
  gst_number?: string | null
  fssai_number?: string | null
  timezone?: string
  primary_color?: string | null
  logo_url?: string | null
  welcome_message?: Record<string, string> | null
  google_review_url?: string | null
  place_id?: string | null
  owner_id?: string
  owner_email?: string
  default_language?: string
  created_at?: string
  updated_at?: string
}

export interface CampaignDoc {
  id: string
  business_id: string
  name: string
  slug: string
  active: boolean
  google_review_url_override?: string | null
  created_at: string
  updated_at?: string
}

export interface MenuItemDoc {
  id: string
  business_id: string
  name: string | { en: string; [key: string]: string }
  active: boolean
  position: number
  created_at?: string
}

export interface QuestionDoc {
  id: string
  business_id: string
  key: string
  type: string
  text: { en: string; [key: string]: string }
  position: number
  created_at?: string
}

export interface SessionDoc {
  id: string
  campaign_id: string
  business_id: string
  status: 'landed' | 'in_progress' | 'completed' | 'abandoned'
  ip_hash?: string
  ua_hash?: string
  created_at: string
  started_at?: string | null
  completed_at?: string | null
  last_activity_at: string
}

export interface AnswerDoc {
  id: string
  session_id: string
  question_id?: string
  question_key: string
  value: any
  created_at: string
  updated_at?: string
}

export interface ReviewDraftDoc {
  id: string
  session_id: string
  original_text: string
  final_text: string
  method: string
  created_at: string
  updated_at?: string
}

export interface EventDoc {
  id: string
  session_id: string
  business_id: string
  campaign_id?: string
  event_type: string
  client_event_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface PrivateFeedbackDoc {
  id: string
  session_id: string
  business_id: string
  category: string
  message: string
  contact_name?: string | null
  contact_value?: string | null
  contact_consent: boolean
  created_at: string
}

// In-Memory Fallback Store (protects app if Firestore API is disabled or pending setup)
export const DREAM_BAZAAR_DEFAULTS: BusinessDoc = {
  id: 'dream-bazaar',
  name: 'Dream Bazaar',
  unit: 'Clothing & Fashion Showroom',
  category: 'clothing_store',
  location: '1st Floor (Above Lenskart), Opposite Mausam Vibhag, Anisabad Khagaul Road, Patna, Bihar',
  place_id: 'ChIJfZJgPwBX7TkRU469KMlU5nM',
  phone: '9097602005',
  secondary_phone: '9097602005',
  gst_number: '10AABCD1234E1Z5',
  timezone: 'Asia/Kolkata',
  primary_color: '#0284c7',
  welcome_message: {
    en: 'Welcome to Dream Bazaar! Share your clothing & fashion shopping experience with us in 30 seconds. For queries call 9097602005.',
  },
  google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJfZJgPwBX7TkRU469KMlU5nM',
  owner_id: 'owner-dream-bazaar',
  owner_email: 'admin@dreambazaar.com',
  default_language: 'en',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

export const DREAM_BAZAAR_DEFAULT_CAMPAIGNS: CampaignDoc[] = [
  {
    id: 'dream-bazaar',
    business_id: 'dream-bazaar',
    name: 'Main Store Entrance & Counter QR',
    slug: 'dream-bazaar',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'counter-qr',
    business_id: 'dream-bazaar',
    name: 'Checkout & Billing Stand',
    slug: 'counter-qr',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fashion-floor',
    business_id: 'dream-bazaar',
    name: '1st Floor Fashion & Apparel Stand',
    slug: 'fashion-floor',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'motu-seth',
    business_id: 'dream-bazaar',
    name: 'Legacy QR Stand (Dream Bazaar)',
    slug: 'motu-seth',
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

export const DREAM_BAZAAR_ITEMS: MenuItemDoc[] = [
  { id: 'item-1', business_id: 'dream-bazaar', name: { en: "Men's Fashion & Shirts/Jeans" }, position: 1, active: true },
  { id: 'item-2', business_id: 'dream-bazaar', name: { en: "Women's Sarees & Ethnic Kurti" }, position: 2, active: true },
  { id: 'item-3', business_id: 'dream-bazaar', name: { en: "Kids Wear & Baby Outfits" }, position: 3, active: true },
  { id: 'item-4', business_id: 'dream-bazaar', name: { en: "Footwear & Daily Sandals" }, position: 4, active: true },
  { id: 'item-5', business_id: 'dream-bazaar', name: { en: "Bedding, Curtains & Home Linen" }, position: 5, active: true },
  { id: 'item-6', business_id: 'dream-bazaar', name: { en: "Kitchenware & Steel Essentials" }, position: 6, active: true },
  { id: 'item-7', business_id: 'dream-bazaar', name: { en: "Daily Essentials & Grocery" }, position: 7, active: true },
  { id: 'item-8', business_id: 'dream-bazaar', name: { en: "Beauty, Perfumes & Grooming" }, position: 8, active: true },
  { id: 'item-9', business_id: 'dream-bazaar', name: { en: "Handbags, Belts & Accessories" }, position: 9, active: true },
  { id: 'item-10', business_id: 'dream-bazaar', name: { en: "Toys, Stationery & Gifts" }, position: 10, active: true },
]

// In-memory memory caches for resilient offline fallback
const memorySessions = new Map<string, SessionDoc>()
const memoryAnswers = new Map<string, Record<string, any>>()
const memoryEvents: EventDoc[] = []
const memoryFeedback: PrivateFeedbackDoc[] = []

/**
 * Get active business or fallback cleanly to Dream Bazaar
 */
export async function getBusiness(businessId = 'dream-bazaar'): Promise<BusinessDoc> {
  try {
    const db = getFirestoreDb()
    const targetId =
      businessId === 'residence-inn' || businessId === 'motu-seth' ? 'dream-bazaar' : businessId

    const doc = await db.collection('businesses').doc(targetId).get()
    if (doc.exists) {
      return { id: doc.id, ...(doc.data() as any) }
    }

    // Try fallback check for motu-seth doc
    const altDoc = await db.collection('businesses').doc('motu-seth').get()
    if (altDoc.exists) {
      return { id: altDoc.id, ...(altDoc.data() as any) }
    }

    // Fallback to first business in collection
    const allBiz = await db.collection('businesses').limit(1).get()
    if (!allBiz.empty) {
      const first = allBiz.docs[0]
      return { id: first.id, ...(first.data() as any) }
    }

    // Attempt to seed default Dream Bazaar profile
    await db.collection('businesses').doc(DREAM_BAZAAR_DEFAULTS.id).set(DREAM_BAZAAR_DEFAULTS)
    return DREAM_BAZAAR_DEFAULTS
  } catch (err) {
    console.warn('Firestore getBusiness fallback to memory default:', (err as any)?.message || err)
    return DREAM_BAZAAR_DEFAULTS
  }
}

/**
 * Get campaign by slug with graceful fallbacks
 */
export async function getCampaignBySlug(slug: string): Promise<{
  campaign: CampaignDoc | null
  business: BusinessDoc | null
}> {
  try {
    const db = getFirestoreDb()

    // 1. Direct query by slug
    let snap = await db.collection('campaigns').where('slug', '==', slug).limit(1).get()

    // 2. Fallback to doc ID matching slug
    if (snap.empty) {
      const directDoc = await db.collection('campaigns').doc(slug).get()
      if (directDoc.exists) {
        const c = { id: directDoc.id, ...(directDoc.data() as any) } as CampaignDoc
        const b = await getBusiness(c.business_id)
        return { campaign: c, business: b }
      }
    }

    // 3. Fallback to any active campaign
    if (snap.empty) {
      snap = await db.collection('campaigns').where('active', '==', true).limit(1).get()
    }

    if (!snap.empty) {
      const campaign = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as CampaignDoc
      const business = await getBusiness(campaign.business_id)
      return { campaign, business }
    }
  } catch (err) {
    console.warn('Firestore getCampaignBySlug fallback to memory defaults:', (err as any)?.message || err)
  }

  // Graceful fallback to matching memory campaign
  const matched =
    DREAM_BAZAAR_DEFAULT_CAMPAIGNS.find((c) => c.slug === slug) ||
    DREAM_BAZAAR_DEFAULT_CAMPAIGNS[0]

  return {
    campaign: matched,
    business: DREAM_BAZAAR_DEFAULTS,
  }
}

/**
 * Get active menu/department items for a business
 */
export async function getMenuItems(businessId: string): Promise<MenuItemDoc[]> {
  try {
    const db = getFirestoreDb()
    const snap = await db
      .collection('menu_items')
      .where('business_id', 'in', [businessId, 'dream-bazaar', 'motu-seth'])
      .where('active', '==', true)
      .get()

    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as MenuItemDoc))
      items.sort((a, b) => (a.position || 0) - (b.position || 0))
      return items
    }
  } catch (err) {
    console.warn('Firestore getMenuItems fallback to default catalog:', (err as any)?.message || err)
  }

  return DREAM_BAZAAR_ITEMS
}

/**
 * Get all menu/catalog items for management
 */
export async function getAllMenuItems(businessId: string): Promise<MenuItemDoc[]> {
  try {
    const db = getFirestoreDb()
    const snap = await db.collection('menu_items').where('business_id', '==', businessId).get()
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as MenuItemDoc))
      items.sort((a, b) => (a.position || 0) - (b.position || 0))
      return items
    }
  } catch (err) {
    console.warn('Firestore getAllMenuItems fallback:', (err as any)?.message || err)
  }
  return DREAM_BAZAAR_ITEMS
}

/**
 * Get all campaigns for a business
 */
export async function getCampaigns(businessId: string): Promise<CampaignDoc[]> {
  try {
    const db = getFirestoreDb()
    const snap = await db.collection('campaigns').where('business_id', '==', businessId).get()
    if (!snap.empty) {
      const campaigns = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          created_at: data.created_at || new Date().toISOString(),
        } as CampaignDoc
      })
      campaigns.sort((a, b) => ((b.created_at || '') > (a.created_at || '') ? 1 : -1))
      return campaigns
    }
  } catch (err) {
    console.warn('Firestore getCampaigns fallback:', (err as any)?.message || err)
  }
  return DREAM_BAZAAR_DEFAULT_CAMPAIGNS
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<SessionDoc | null> {
  try {
    const db = getFirestoreDb()
    const doc = await db.collection('sessions').doc(sessionId).get()
    if (doc.exists) {
      return { id: doc.id, ...(doc.data() as any) } as SessionDoc
    }
  } catch (err) {
    console.warn('Firestore getSession fallback:', (err as any)?.message || err)
  }

  return memorySessions.get(sessionId) || null
}

/**
 * Create a new guest session
 */
export async function createSession(data: {
  campaign_id: string
  business_id: string
  ip_hash?: string
  ua_hash?: string
}): Promise<SessionDoc> {
  const id = randomUUID()
  const now = new Date().toISOString()
  const session: SessionDoc = {
    id,
    campaign_id: data.campaign_id,
    business_id: data.business_id,
    status: 'landed',
    ip_hash: data.ip_hash || '',
    ua_hash: data.ua_hash || '',
    created_at: now,
    last_activity_at: now,
  }

  try {
    const db = getFirestoreDb()
    await db.collection('sessions').doc(id).set(session)
  } catch (err) {
    console.warn('Firestore createSession fallback to memory:', (err as any)?.message || err)
  }

  memorySessions.set(id, session)
  return session
}

/**
 * Log an event in Firestore
 */
export async function recordEvent(data: {
  session_id: string
  business_id: string
  campaign_id?: string
  event_type: string
  client_event_id?: string
  metadata?: Record<string, any>
}): Promise<void> {
  const id = data.client_event_id ? `${data.session_id}_${data.client_event_id}` : randomUUID()
  const now = new Date().toISOString()
  const eventDoc: EventDoc = {
    id,
    session_id: data.session_id,
    business_id: data.business_id,
    campaign_id: data.campaign_id || undefined,
    event_type: data.event_type,
    client_event_id: data.client_event_id || undefined,
    metadata: data.metadata || {},
    created_at: now,
  }

  try {
    const db = getFirestoreDb()
    await db.collection('events').doc(id).set(eventDoc)
  } catch (err) {
    console.warn('Firestore recordEvent fallback to memory:', (err as any)?.message || err)
  }

  memoryEvents.push(eventDoc)
}

/**
 * Get all answers for a session
 */
export async function getSessionAnswers(sessionId: string): Promise<Record<string, any>> {
  try {
    const db = getFirestoreDb()
    const snap = await db.collection('answers').where('session_id', '==', sessionId).get()
    if (!snap.empty) {
      const answers: Record<string, any> = {}
      snap.docs.forEach((doc) => {
        const data = doc.data()
        answers[data.question_key] = data.value
      })
      return answers
    }
  } catch (err) {
    console.warn('Firestore getSessionAnswers fallback to memory:', (err as any)?.message || err)
  }

  return memoryAnswers.get(sessionId) || {}
}

/**
 * Save an answer for a session
 */
export async function saveAnswer(
  sessionId: string,
  questionKey: string,
  value: any,
  businessId?: string
): Promise<void> {
  const docId = `${sessionId}_${questionKey}`
  const now = new Date().toISOString()

  try {
    const db = getFirestoreDb()
    await db.collection('answers').doc(docId).set(
      {
        id: docId,
        session_id: sessionId,
        question_key: questionKey,
        value,
        updated_at: now,
        created_at: now,
      },
      { merge: true }
    )

    await db.collection('sessions').doc(sessionId).set(
      {
        last_activity_at: now,
      },
      { merge: true }
    )
  } catch (err) {
    console.warn('Firestore saveAnswer fallback to memory:', (err as any)?.message || err)
  }

  const existing = memoryAnswers.get(sessionId) || {}
  existing[questionKey] = value
  memoryAnswers.set(sessionId, existing)

  const s = memorySessions.get(sessionId)
  if (s) {
    s.last_activity_at = now
  }
}
