import { getCampaignBySlug, getMenuItems, getSession, getSessionAnswers } from '@/lib/firebase/db'
import { getFirestoreDb } from '@/lib/firebase/admin'
import QuizFlow from '@/components/quiz/QuizFlow'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { cookies } from 'next/headers'

interface PublicQuizPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ new?: string }>
}

export const dynamic = 'force-dynamic'

export default async function PublicQuizPage({ params, searchParams }: PublicQuizPageProps) {
  const { slug } = await params
  const { new: forceNew } = await searchParams

  // 1. Look up campaign and business in Firestore
  const { campaign, business } = await getCampaignBySlug(slug)

  // Fallback screen if no campaign exists
  if (!campaign) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">QR Code Not Found</h1>
          <p className="text-sm text-stone-500">
            This QR code is not valid or has been removed. Please ask a store assistant at Dream Bazaar for assistance.
          </p>
          <div className="pt-2">
            <a
              href="tel:9097602005"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-900 hover:bg-sky-100 transition-colors"
            >
              📞 Call: +91 90976 02005
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Inactive campaign fallback screen
  if (!campaign.active) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Survey Temporarily Inactive</h1>
          <p className="text-sm text-stone-500">
            This feedback code is currently paused by Dream Bazaar. Please check with customer care.
          </p>
          <div className="pt-2">
            <a
              href="tel:9097602005"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-900 hover:bg-sky-100 transition-colors"
            >
              📞 Call: +91 90976 02005
            </a>
          </div>
        </div>
      </div>
    )
  }

  const googleReviewUrl =
    campaign.google_review_url_override ||
    business?.google_review_url ||
    'https://search.google.com/local/writereview?placeid=ChIJfZJgPwBX7TkRU469KMlU5nM'

  // 2. Fetch menu items for the ordered items step
  const menuItems = await getMenuItems(campaign.business_id)

  // 3. Resume existing session if cookie is present and ?new=1 is NOT passed
  let existingSessionId: string | null = null
  let existingStatus: string | null = null
  let existingAnswers: Record<string, any> = {}
  let existingDraftText: string | null = null

  if (forceNew !== '1') {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(`session_${slug}`)
    if (sessionCookie?.value) {
      const session = await getSession(sessionCookie.value)
      if (session && session.campaign_id === campaign.id) {
        existingSessionId = session.id
        existingStatus = session.status
        existingAnswers = await getSessionAnswers(session.id)

        if (session.status === 'completed') {
          const db = getFirestoreDb()
          const draftDoc = await db.collection('review_drafts').doc(session.id).get()
          if (draftDoc.exists) {
            const draftData = draftDoc.data()
            existingDraftText = draftData?.final_text || draftData?.original_text || null
          }
        }
      }
    }
  }

  const restaurantName = business?.name ?? 'Dream Bazaar'
  const welcomeText =
    (business?.welcome_message?.en as string | undefined) ??
    'Welcome to Dream Bazaar! Share your honest shopping experience with us in 30 seconds. For helpline call 9097602005.'

  return (
    <div className="min-h-screen min-h-[100dvh] min-h-safe-screen bg-[#faf8f5] bg-gradient-to-b from-[#fdfbf7] via-[#fbf7ee] to-[#f6efe0] text-stone-900 flex flex-col justify-between px-3 sm:px-6 pt-safe pb-safe py-3 sm:py-6 selection:bg-sky-600 selection:text-white relative overflow-x-hidden font-sans">
      {/* Ambient warm lighting */}
      <div className="fixed -top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <header className="relative z-10 flex items-center justify-center pt-1 sm:pt-2">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-xs backdrop-blur-md">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-sky-600 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold text-sky-950 tracking-wide">
            {restaurantName} • Customer Feedback
          </span>
        </div>
      </header>

      {/* Quiz Flow Orchestration */}
      <QuizFlow
        slug={campaign.slug}
        restaurantName={restaurantName}
        logoUrl={business?.logo_url || null}
        primaryColor={business?.primary_color || '#d97706'}
        welcomeMessage={welcomeText}
        googleReviewUrl={googleReviewUrl}
        initialSessionId={existingSessionId}
        initialStatus={existingStatus}
        initialAnswers={existingAnswers}
        initialDraftText={existingDraftText}
        menuItems={menuItems.map((m) => ({ id: m.id, name: m.name }))}
      />

      {/* Mobile-Friendly Footer */}
      <footer className="relative z-10 text-center py-2 sm:py-3 text-[10px] sm:text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1.5">
          <span>Powered by</span>
          <span className="font-bold text-stone-700">ReviewPulse</span>
          <span>•</span>
          <span className="font-semibold text-stone-800">{restaurantName}, Patna</span>
        </div>
        <div className="flex items-center gap-1 text-amber-800 font-medium">
          <span>•</span>
          <a href="tel:6201699943" className="hover:underline flex items-center gap-1">
            <span>Helpline:</span>
            <strong>+91 62016 99943</strong>
          </a>
        </div>
      </footer>
    </div>
  )
}
