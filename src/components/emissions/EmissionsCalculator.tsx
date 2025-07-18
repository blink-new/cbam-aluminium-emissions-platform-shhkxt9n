import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Calculator, Zap, Factory, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

interface EmissionInput {
  id: string
  name: string
  value: number
  unit: string
  emissionFactor: number
  source: 'measured' | 'calculated' | 'default'
}

interface Scope1Calculation {
  fuelCombustion: EmissionInput[]
  processEmissions: EmissionInput[]
  totalScope1: number
}

interface Scope2Calculation {
  electricityConsumption: number
  electricityEF: number
  electricitySource: 'supplier' | 'national' | 'default'
  totalScope2: number
}

interface CalculationResult {
  scope1: Scope1Calculation
  scope2: Scope2Calculation
  totalEmissions: number
  productionVolume: number
  specificEmissions: number
  complianceStatus: 'compliant' | 'warning' | 'non-compliant'
}

const DEFAULT_EMISSION_FACTORS = {
  'natural-gas': 0.0561, // tCO2/GJ
  'coal': 0.0946, // tCO2/GJ
  'fuel-oil': 0.0774, // tCO2/GJ
  'electricity-eu': 0.275, // tCO2/MWh (EU average)
  'bauxite-processing': 0.15, // tCO2/t bauxite
  'alumina-production': 1.2, // tCO2/t alumina
  'primary-aluminium': 1.8, // tCO2/t Al (process only)
  'secondary-aluminium': 0.6 // tCO2/t Al (melting)
}

const FUEL_TYPES = [
  { value: 'natural-gas', label: 'Natural Gas', unit: 'GJ' },
  { value: 'coal', label: 'Coal', unit: 'GJ' },
  { value: 'fuel-oil', label: 'Fuel Oil', unit: 'GJ' },
  { value: 'diesel', label: 'Diesel', unit: 'L' },
  { value: 'lpg', label: 'LPG', unit: 'kg' }
]

const PROCESS_TYPES = [
  { value: 'bauxite-processing', label: 'Bauxite Processing', unit: 't' },
  { value: 'alumina-production', label: 'Alumina Production', unit: 't' },
  { value: 'primary-aluminium', label: 'Primary Aluminium Electrolysis', unit: 't' },
  { value: 'secondary-aluminium', label: 'Secondary Aluminium Melting', unit: 't' },
  { value: 'casting', label: 'Casting Operations', unit: 't' },
  { value: 'rolling', label: 'Rolling/Extrusion', unit: 't' }
]

export default function EmissionsCalculator() {
  const [calculation, setCalculation] = useState<CalculationResult>({
    scope1: {
      fuelCombustion: [],
      processEmissions: [],
      totalScope1: 0
    },
    scope2: {
      electricityConsumption: 0,
      electricityEF: DEFAULT_EMISSION_FACTORS['electricity-eu'],
      electricitySource: 'default',
      totalScope2: 0
    },
    totalEmissions: 0,
    productionVolume: 0,
    specificEmissions: 0,
    complianceStatus: 'warning'
  })

  const [newFuelInput, setNewFuelInput] = useState({
    type: '',
    value: 0,
    source: 'calculated' as const
  })

  const [newProcessInput, setNewProcessInput] = useState({
    type: '',
    value: 0,
    source: 'calculated' as const
  })

  // Calculate totals whenever inputs change
  useEffect(() => {
    const scope1Total = 
      calculation.scope1.fuelCombustion.reduce((sum, input) => sum + (input.value * input.emissionFactor), 0) +
      calculation.scope1.processEmissions.reduce((sum, input) => sum + (input.value * input.emissionFactor), 0)

    const scope2Total = calculation.scope2.electricityConsumption * calculation.scope2.electricityEF / 1000 // Convert MWh to GWh

    const totalEmissions = scope1Total + scope2Total
    const specificEmissions = calculation.productionVolume > 0 ? totalEmissions / calculation.productionVolume : 0

    // Determine compliance status
    let complianceStatus: 'compliant' | 'warning' | 'non-compliant' = 'compliant'
    if (specificEmissions > 15) complianceStatus = 'non-compliant'
    else if (specificEmissions > 10) complianceStatus = 'warning'

    setCalculation(prev => ({
      ...prev,
      scope1: { ...prev.scope1, totalScope1: scope1Total },
      scope2: { ...prev.scope2, totalScope2: scope2Total },
      totalEmissions,
      specificEmissions,
      complianceStatus
    }))
  }, [calculation.scope1.fuelCombustion, calculation.scope1.processEmissions, calculation.scope2.electricityConsumption, calculation.scope2.electricityEF, calculation.productionVolume])

  const addFuelInput = () => {
    if (!newFuelInput.type || newFuelInput.value <= 0) return

    const fuelType = FUEL_TYPES.find(f => f.value === newFuelInput.type)
    if (!fuelType) return

    const emissionFactor = DEFAULT_EMISSION_FACTORS[newFuelInput.type as keyof typeof DEFAULT_EMISSION_FACTORS] || 0.05

    const newInput: EmissionInput = {
      id: `fuel-${Date.now()}`,
      name: fuelType.label,
      value: newFuelInput.value,
      unit: fuelType.unit,
      emissionFactor,
      source: newFuelInput.source
    }

    setCalculation(prev => ({
      ...prev,
      scope1: {
        ...prev.scope1,
        fuelCombustion: [...prev.scope1.fuelCombustion, newInput]
      }
    }))

    setNewFuelInput({ type: '', value: 0, source: 'calculated' })
  }

  const addProcessInput = () => {
    if (!newProcessInput.type || newProcessInput.value <= 0) return

    const processType = PROCESS_TYPES.find(p => p.value === newProcessInput.type)
    if (!processType) return

    const emissionFactor = DEFAULT_EMISSION_FACTORS[newProcessInput.type as keyof typeof DEFAULT_EMISSION_FACTORS] || 0.1

    const newInput: EmissionInput = {
      id: `process-${Date.now()}`,
      name: processType.label,
      value: newProcessInput.value,
      unit: processType.unit,
      emissionFactor,
      source: newProcessInput.source
    }

    setCalculation(prev => ({
      ...prev,
      scope1: {
        ...prev.scope1,
        processEmissions: [...prev.scope1.processEmissions, newInput]
      }
    }))

    setNewProcessInput({ type: '', value: 0, source: 'calculated' })
  }

  const removeInput = (inputId: string, type: 'fuel' | 'process') => {
    setCalculation(prev => ({
      ...prev,
      scope1: {
        ...prev.scope1,
        [type === 'fuel' ? 'fuelCombustion' : 'processEmissions']: 
          prev.scope1[type === 'fuel' ? 'fuelCombustion' : 'processEmissions'].filter(input => input.id !== inputId)
      }
    }))
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'non-compliant': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'non-compliant': return <AlertTriangle className="h-5 w-5" />
      default: return <Calculator className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculation.totalEmissions.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">tCO2e</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scope 1</p>
                <p className="text-2xl font-bold text-orange-600">
                  {calculation.scope1.totalScope1.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">tCO2e</p>
              </div>
              <Factory className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scope 2</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculation.scope2.totalScope2.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">tCO2e</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Specific Emissions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculation.specificEmissions.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500">tCO2e/t product</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Alert className={getComplianceColor(calculation.complianceStatus)}>
        <div className="flex items-center gap-2">
          {getComplianceIcon(calculation.complianceStatus)}
          <AlertDescription>
            <strong>CBAM Compliance Status: {calculation.complianceStatus.toUpperCase()}</strong>
            {calculation.complianceStatus === 'compliant' && ' - Your emissions are within acceptable ranges.'}
            {calculation.complianceStatus === 'warning' && ' - Emissions are elevated. Consider optimization.'}
            {calculation.complianceStatus === 'non-compliant' && ' - Emissions exceed recommended thresholds. Action required.'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Production Volume Input */}
      <Card>
        <CardHeader>
          <CardTitle>Production Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productionVolume">Annual Production Volume (tonnes)</Label>
              <Input
                id="productionVolume"
                type="number"
                step="0.1"
                value={calculation.productionVolume}
                onChange={(e) => setCalculation(prev => ({
                  ...prev,
                  productionVolume: parseFloat(e.target.value) || 0
                }))}
                placeholder="Enter total annual production"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <Label>Emissions Intensity</Label>
                <div className="text-2xl font-bold text-gray-900">
                  {calculation.specificEmissions.toFixed(3)} tCO2e/t
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emissions Calculation Tabs */}
      <Tabs defaultValue="scope1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scope1" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Scope 1 (Direct)
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Scope 2 (Indirect)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scope1" className="space-y-4">
          {/* Fuel Combustion */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Combustion Emissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={newFuelInput.type} onValueChange={(value) => setNewFuelInput(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        {fuel.label} ({fuel.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Consumption"
                  value={newFuelInput.value || ''}
                  onChange={(e) => setNewFuelInput(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
                <Select value={newFuelInput.source} onValueChange={(value: any) => setNewFuelInput(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="measured">Measured</SelectItem>
                    <SelectItem value="calculated">Calculated</SelectItem>
                    <SelectItem value="default">Default EF</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addFuelInput}>Add Fuel</Button>
              </div>

              {calculation.scope1.fuelCombustion.length > 0 && (
                <div className="space-y-2">
                  {calculation.scope1.fuelCombustion.map(input => (
                    <div key={input.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{input.name}</div>
                          <div className="text-sm text-gray-600">
                            {input.value} {input.unit} × {input.emissionFactor} tCO2/{input.unit}
                          </div>
                        </div>
                        <Badge variant={input.source === 'measured' ? 'default' : 'secondary'}>
                          {input.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold">{(input.value * input.emissionFactor).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">tCO2e</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInput(input.id, 'fuel')}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Emissions */}
          <Card>
            <CardHeader>
              <CardTitle>Process Emissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={newProcessInput.type} onValueChange={(value) => setNewProcessInput(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCESS_TYPES.map(process => (
                      <SelectItem key={process.value} value={process.value}>
                        {process.label} ({process.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Production volume"
                  value={newProcessInput.value || ''}
                  onChange={(e) => setNewProcessInput(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
                <Select value={newProcessInput.source} onValueChange={(value: any) => setNewProcessInput(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="measured">Measured</SelectItem>
                    <SelectItem value="calculated">Calculated</SelectItem>
                    <SelectItem value="default">Default EF</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addProcessInput}>Add Process</Button>
              </div>

              {calculation.scope1.processEmissions.length > 0 && (
                <div className="space-y-2">
                  {calculation.scope1.processEmissions.map(input => (
                    <div key={input.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{input.name}</div>
                          <div className="text-sm text-gray-600">
                            {input.value} {input.unit} × {input.emissionFactor} tCO2/{input.unit}
                          </div>
                        </div>
                        <Badge variant={input.source === 'measured' ? 'default' : 'secondary'}>
                          {input.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold">{(input.value * input.emissionFactor).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">tCO2e</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInput(input.id, 'process')}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scope2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Electricity Consumption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="electricityConsumption">Annual Electricity Consumption (MWh)</Label>
                  <Input
                    id="electricityConsumption"
                    type="number"
                    step="0.1"
                    value={calculation.scope2.electricityConsumption}
                    onChange={(e) => setCalculation(prev => ({
                      ...prev,
                      scope2: {
                        ...prev.scope2,
                        electricityConsumption: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="electricityEF">Emission Factor (tCO2/MWh)</Label>
                  <Input
                    id="electricityEF"
                    type="number"
                    step="0.001"
                    value={calculation.scope2.electricityEF}
                    onChange={(e) => setCalculation(prev => ({
                      ...prev,
                      scope2: {
                        ...prev.scope2,
                        electricityEF: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="electricitySource">Emission Factor Source</Label>
                  <Select 
                    value={calculation.scope2.electricitySource} 
                    onValueChange={(value: any) => setCalculation(prev => ({
                      ...prev,
                      scope2: {
                        ...prev.scope2,
                        electricitySource: value
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier-specific (indSEE)</SelectItem>
                      <SelectItem value="national">National/Regional (SEE)</SelectItem>
                      <SelectItem value="default">Default EU Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>CBAM Requirement:</strong> Use supplier-specific emission factors (indSEE) when available. 
                  National/regional factors (SEE) are acceptable as fallback. Default factors should only be used when no other data is available.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Scope 2 Emissions Calculation</div>
                    <div className="text-sm text-gray-600">
                      {calculation.scope2.electricityConsumption} MWh × {calculation.scope2.electricityEF} tCO2/MWh
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculation.scope2.totalScope2.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">tCO2e</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}