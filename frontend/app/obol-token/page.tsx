'use client'

import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'

const OBOLTokenContent = dynamicImport(() => import('./OBOLTokenContent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
})

export default function OBOLTokenPage() {
  return <OBOLTokenContent />;
} 