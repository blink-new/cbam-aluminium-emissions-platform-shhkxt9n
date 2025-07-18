export interface User {
  id: string
  email: string
  displayName?: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  companyId: string
}

export interface Company {
  id: string
  name: string
  country: string
  registrationNumber?: string
  createdAt: string
  userId: string
}

export interface Facility {
  id: string
  name: string
  companyId: string
  country: string
  installationId: string
  address: string
  facilityType: 'primary' | 'secondary'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  userId: string
}

export interface ProductionProcess {
  id: string
  facilityId: string
  name: string
  processType: 'electrolysis' | 'casting' | 'rolling' | 'extrusion' | 'other'
  position: { x: number; y: number }
  inputs: ProcessInput[]
  outputs: ProcessOutput[]
  userId: string
}

export interface ProcessInput {
  id: string
  materialType: string
  quantity: number
  unit: string
  emissionFactor?: number
}

export interface ProcessOutput {
  id: string
  productType: string
  quantity: number
  unit: string
  cnCode?: string
}

export interface EmissionsData {
  id: string
  facilityId: string
  reportingYear: number
  directEmissions: number // Scope 1
  indirectEmissions: number // Scope 2
  embeddedEmissions: number
  calculationMethod: 'calculation-based' | 'measurement-based'
  status: 'draft' | 'submitted' | 'approved'
  createdAt: string
  userId: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  country: string
  status: 'invited' | 'active' | 'inactive'
  companyId: string
  userId: string
}

export interface SupplierEmission {
  id: string
  supplierId: string
  productType: string
  embeddedEmissions: number
  seeValue?: number
  indSeeValue?: number
  validFrom: string
  validTo: string
  userId: string
}