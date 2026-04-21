// Root redirect — middleware handles auth + redirects to /login or dashboard
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/')
}
