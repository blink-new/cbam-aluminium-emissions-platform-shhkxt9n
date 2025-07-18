import React from 'react'
import ProcessFlowBuilder from '@/components/production/ProcessFlowBuilder'

export default function ProductionMapper() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Production Line Mapper</h1>
        <p className="text-gray-600 mt-2">
          Design your facility's production flow and configure emission factors for CBAM compliance
        </p>
      </div>
      
      <ProcessFlowBuilder />
    </div>
  )
}