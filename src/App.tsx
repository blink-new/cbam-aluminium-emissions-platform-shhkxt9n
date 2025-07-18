import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Facilities } from '@/pages/Facilities'
import ProductionMapper from '@/pages/ProductionMapper'
import EmissionsCalculator from '@/pages/EmissionsCalculator'
import SupplierCollaboration from '@/pages/SupplierCollaboration'
import CBAMReports from '@/pages/CBAMReports'
import { blink } from '@/blink/client'
import { Toaster } from '@/components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CBAM Platform...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CBAM Platform</h1>
          <p className="text-gray-600 mb-6">
            EU Carbon Border Adjustment Mechanism compliance for aluminium manufacturers
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/production" element={<div className="p-6"><ProductionMapper /></div>} />
                <Route path="/emissions" element={<div className="p-6"><EmissionsCalculator /></div>} />
                <Route path="/suppliers" element={<div className="p-6"><SupplierCollaboration /></div>} />
                <Route path="/reports" element={<div className="p-6"><CBAMReports /></div>} />
                <Route path="/settings" element={<div className="p-6"><h2 className="text-2xl font-bold">Settings</h2><p className="text-gray-600">Coming soon...</p></div>} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  )
}

export default App