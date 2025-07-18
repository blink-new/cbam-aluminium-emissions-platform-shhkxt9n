import React from 'react'
import SupplierCollaboration from '@/components/suppliers/SupplierCollaboration'

export default function SupplierCollaborationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier Collaboration</h1>
        <p className="text-gray-600 mt-2">
          Collaborate with upstream suppliers to collect embedded emissions data for CBAM compliance
        </p>
      </div>
      
      <SupplierCollaboration />
    </div>
  )
}