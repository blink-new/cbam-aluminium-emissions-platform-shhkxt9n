import React from 'react'
import CBAMExport from '@/components/reports/CBAMExport'

export default function CBAMReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CBAM Reports & Export</h1>
        <p className="text-gray-600 mt-2">
          Generate and export CBAM-compliant XML reports for EU regulatory submission
        </p>
      </div>
      
      <CBAMExport />
    </div>
  )
}