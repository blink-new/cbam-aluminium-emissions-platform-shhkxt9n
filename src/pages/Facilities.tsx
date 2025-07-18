import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Factory,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blink } from '@/blink/client'
import type { Facility } from '@/types'

export function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newFacility, setNewFacility] = useState({
    name: '',
    country: '',
    installationId: '',
    address: '',
    facilityType: 'primary' as 'primary' | 'secondary'
  })

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.facilities.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setFacilities(data)
    } catch (error) {
      console.error('Failed to load facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFacility = async () => {
    try {
      const user = await blink.auth.me()
      await blink.db.facilities.create({
        ...newFacility,
        companyId: user.id, // Using user ID as company ID for now
        status: 'active',
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      
      setNewFacility({
        name: '',
        country: '',
        installationId: '',
        address: '',
        facilityType: 'primary'
      })
      setIsAddDialogOpen(false)
      loadFacilities()
    } catch (error) {
      console.error('Failed to add facility:', error)
    }
  }

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Facilities</h2>
          <p className="text-gray-600">Manage your aluminium production installations</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Facility</DialogTitle>
              <DialogDescription>
                Register a new aluminium production facility for CBAM compliance.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Facility Name</Label>
                <Input
                  id="name"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  placeholder="e.g., Primary Aluminium Smelter A"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="installationId">Installation ID</Label>
                <Input
                  id="installationId"
                  value={newFacility.installationId}
                  onChange={(e) => setNewFacility({ ...newFacility, installationId: e.target.value })}
                  placeholder="EU Installation Identifier"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={newFacility.country}
                  onValueChange={(value) => setNewFacility({ ...newFacility, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="NL">Netherlands</SelectItem>
                    <SelectItem value="BE">Belgium</SelectItem>
                    <SelectItem value="NO">Norway</SelectItem>
                    <SelectItem value="TR">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="facilityType">Facility Type</Label>
                <Select
                  value={newFacility.facilityType}
                  onValueChange={(value: 'primary' | 'secondary') => 
                    setNewFacility({ ...newFacility, facilityType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Aluminium</SelectItem>
                    <SelectItem value="secondary">Secondary Aluminium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newFacility.address}
                  onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                  placeholder="Full facility address"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFacility}>
                Add Facility
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {filteredFacilities.length} facilities
        </Badge>
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No facilities match your search criteria.' : 'Get started by adding your first facility.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Facility
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription className="text-sm">
                        ID: {facility.installationId}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Facility
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Facility
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{facility.country}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={facility.facilityType === 'primary' ? 'default' : 'secondary'}
                    className={facility.facilityType === 'primary' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                      : 'bg-green-100 text-green-800 border-green-200'
                    }
                  >
                    {facility.facilityType === 'primary' ? 'Primary' : 'Secondary'} Aluminium
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className={facility.status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {facility.status}
                  </Badge>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Map Process
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}