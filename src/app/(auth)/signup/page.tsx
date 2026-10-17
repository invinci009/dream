import { redirect } from 'next/navigation'

// Registration is disabled — this is a single-tenant app for Dream Bazaar only.
export default function SignupPage() {
  redirect('/login')
}
