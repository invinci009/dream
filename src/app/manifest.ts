import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dream Bazaar — Customer Feedback & Reviews',
    short_name: 'Dream Bazaar',
    description: 'Instant QR customer feedback, smart AI reviews & live store dashboard for Dream Bazaar, Anisabad Khagaul Road, Patna',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#020617',
    theme_color: '#0f172a',
    categories: ['shopping', 'business', 'lifestyle'],
    lang: 'en',
    dir: 'ltr',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Customer Feedback Survey',
        short_name: 'Feedback',
        description: 'Open customer survey experience for Dream Bazaar',
        url: '/r/dream-bazaar',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Store Dashboard',
        short_name: 'Dashboard',
        description: 'View live customer feedback, stats & customer contacts',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Customer Responses',
        short_name: 'Responses',
        description: 'See latest customer ratings and drafts',
        url: '/dashboard?tab=responses',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
