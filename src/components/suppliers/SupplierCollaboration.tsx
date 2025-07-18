import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Upload, 
  Download,
  Building2,
  FileText,
  Send
} from 'lucide-react'
import { blink } from '@/blink/client'

interface Supplier {
  id: string
  name: string
  email: string
  country: string
  status: 'invited' | 'pending' | 'active' | 'completed'
  invitedAt: string
  respondedAt?: string
  materials: SupplierMaterial[]
}

interface SupplierMaterial {
  id: string
  materialName: string
  materialType: 'bauxite' | 'alumina' | 'primary-aluminium' | 'secondary-aluminium' | 'semi-finished'
  annualVolume: number
  unit: string
  embeddedEmissions?: number
  emissionFactor?: number
  seeSource?: 'supplier' | 'national' | 'default'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  documentation?: string
}

interface SupplierInvitation {
  supplierEmail: string
  supplierName: string
  materials: string[]
  message: string
  dueDate: string
}

const MATERIAL_TYPES = [
  { value: 'bauxite', label: 'Bauxite', unit: 'tonnes' },
  { value: 'alumina', label: 'Alumina', unit: 'tonnes' },
  { value: 'primary-aluminium', label: 'Primary Aluminium', unit: 'tonnes' },
  { value: 'secondary-aluminium', label: 'Secondary Aluminium', unit: 'tonnes' },
  { value: 'semi-finished', label: 'Semi-finished Products', unit: 'tonnes' }
]

export default function SupplierCollaboration() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [invitation, setInvitation] = useState<SupplierInvitation>({
    supplierEmail: '',
    supplierName: '',
    materials: [],
    message: '',
    dueDate: ''
  })
  const [loading, setLoading] = useState(false)

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const user = await blink.auth.me()
      const suppliersData = await blink.db.suppliers.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Failed to load suppliers:', error)
    }
  }

  const sendInvitation = async () => {
    if (!invitation.supplierEmail || !invitation.supplierName) return

    setLoading(true)
    try {
      const user = await blink.auth.me()
      
      // Create supplier record
      const newSupplier = await blink.db.suppliers.create({
        id: `supplier-${Date.now()}`,
        name: invitation.supplierName,
        email: invitation.supplierEmail,
        country: '',
        status: 'invited',
        invitedAt: new Date().toISOString(),
        userId: user.id,
        materials: invitation.materials
      })

      // Send invitation email (simulated)
      await simulateEmailInvitation(invitation)

      setSuppliers(prev => [...prev, newSupplier])
      setShowInviteDialog(false)
      setInvitation({
        supplierEmail: '',
        supplierName: '',
        materials: [],
        message: '',
        dueDate: ''
      })
    } catch (error) {
      console.error('Failed to send invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateEmailInvitation = async (invitation: SupplierInvitation) => {
    // In a real implementation, this would send an actual email
    console.log('Sending invitation email to:', invitation.supplierEmail)
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const updateSupplierStatus = async (supplierId: string, status: Supplier['status']) => {
    try {
      await blink.db.suppliers.update(supplierId, { status })
      setSuppliers(prev => prev.map(s => 
        s.id === supplierId ? { ...s, status } : s
      ))
    } catch (error) {
      console.error('Failed to update supplier status:', error)
    }
  }

  const addMaterialToInvitation = (materialType: string) => {
    if (!invitation.materials.includes(materialType)) {
      setInvitation(prev => ({
        ...prev,
        materials: [...prev.materials, materialType]
      }))
    }
  }

  const removeMaterialFromInvitation = (materialType: string) => {
    setInvitation(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== materialType)
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invited': return <Mail className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'active': return <AlertTriangle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const calculateCompletionRate = () => {
    if (suppliers.length === 0) return 0
    const completed = suppliers.filter(s => s.status === 'completed').length
    return (completed / suppliers.length) * 100
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {suppliers.filter(s => s.status === 'pending' || s.status === 'active').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculateCompletionRate().toFixed(0)}%
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Progress value={calculateCompletionRate()} className="w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Supplier Management</h2>
          <p className="text-gray-600">Collaborate with suppliers to collect embedded emissions data</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite Supplier for Emissions Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={invitation.supplierName}
                    onChange={(e) => setInvitation(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Enter supplier company name"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierEmail">Contact Email</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={invitation.supplierEmail}
                    onChange={(e) => setInvitation(prev => ({ ...prev, supplierEmail: e.target.value }))}
                    placeholder="supplier@company.com"
                  />
                </div>
              </div>

              <div>
                <Label>Materials Requested</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {MATERIAL_TYPES.map(material => (
                    <div key={material.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={material.value}
                        checked={invitation.materials.includes(material.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addMaterialToInvitation(material.value)
                          } else {
                            removeMaterialFromInvitation(material.value)
                          }
                        }}
                      />
                      <Label htmlFor={material.value} className="text-sm">
                        {material.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Response Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invitation.dueDate}
                  onChange={(e) => setInvitation(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="message">Custom Message</Label>
                <Textarea
                  id="message"
                  value={invitation.message}
                  onChange={(e) => setInvitation(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a custom message for your supplier..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvitation} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Status</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No suppliers invited yet</p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Your First Supplier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.email}</p>
                        <p className="text-xs text-gray-500">
                          Invited: {new Date(supplier.invitedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(supplier.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(supplier.status)}
                          {supplier.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {supplier.status === 'invited' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSupplierStatus(supplier.id, 'pending')}
                        >
                          Mark as Responded
                        </Button>
                      )}
                      {supplier.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSupplierStatus(supplier.id, 'completed')}
                        >
                          Mark as Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {supplier.materials && supplier.materials.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Requested Materials:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.materials.map((material, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {MATERIAL_TYPES.find(m => m.value === material)?.label || material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CBAM Compliance Info */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>CBAM Compliance:</strong> Suppliers must provide embedded emissions data with supporting documentation. 
          Prefer supplier-specific emission factors (indSEE) over national/regional factors (SEE). 
          All data must be verifiable and traceable for EU reporting requirements.
        </AlertDescription>
      </Alert>
    </div>
  )
}