import React from 'react'
import EmissionsCalculator from '@/components/emissions/EmissionsCalculator'

export default function EmissionsCalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CBAM Emissions Calculator</h1>
        <p className="text-gray-600 mt-2">
          Calculate Scope 1 and Scope 2 emissions following EU CBAM methodology for aluminium production
        </p>
      </div>
      
      <EmissionsCalculator />
    </div>
  )
}