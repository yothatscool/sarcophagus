'use client'

import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'

const TestDashboardContent = dynamicImport(() => import('./TestDashboardContent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
})

export default function TestDashboardPage() {
  return <TestDashboardContent />;
} 