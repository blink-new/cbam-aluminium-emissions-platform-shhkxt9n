import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Building2,
  Zap,
  Factory,
  Upload
} from 'lucide-react'
import { blink } from '@/blink/client'

interface CBAMReport {
  id: string
  reportingPeriod: string
  facilityId: string
  facilityName: string
  installationId: string
  products: CBAMProduct[]
  totalEmissions: number
  status: 'draft' | 'validated' | 'submitted'
  createdAt: string
  submittedAt?: string
}

interface CBAMProduct {
  id: string
  cnCode: string
  productName: string
  productionVolume: number
  unit: string
  directEmissions: number
  indirectEmissions: number
  embeddedEmissions: number
  specificEmissions: number
  emissionFactors: EmissionFactorData[]
}

interface EmissionFactorData {
  type: 'fuel' | 'electricity' | 'process'
  source: 'measured' | 'calculated' | 'default'
  value: number
  unit: string
  documentation?: string
}

const CN_CODES = [
  { code: '7601.10.00', name: 'Unwrought aluminium, not alloyed' },
  { code: '7601.20.91', name: 'Unwrought aluminium alloys' },
  { code: '7604.10.10', name: 'Bars, rods and profiles of aluminium, not alloyed' },
  { code: '7604.29.10', name: 'Bars, rods and profiles of aluminium alloys' },
  { code: '7606.11.10', name: 'Rectangular plates, sheets and strip, of aluminium, not alloyed' },
  { code: '7606.12.10', name: 'Rectangular plates, sheets and strip, of aluminium alloys' }
]

export default function CBAMExport() {
  const [reports, setReports] = useState<CBAMReport[]>([])
  const [selectedReport, setSelectedReport] = useState<CBAMReport | null>(null)
  const [newReport, setNewReport] = useState({
    reportingPeriod: '2024',
    facilityId: '',
    installationId: ''
  })
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<any[]>([])

  useEffect(() => {
    loadReports()
    loadFacilities()
  }, [])

  const loadReports = async () => {
    try {
      const user = await blink.auth.me()
      const reportsData = await blink.db.cbamReports.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setReports(reportsData)
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  const loadFacilities = async () => {
    try {
      const user = await blink.auth.me()
      const facilitiesData = await blink.db.facilities.list({
        where: { userId: user.id }
      })
      setFacilities(facilitiesData)
    } catch (error) {
      console.error('Failed to load facilities:', error)
    }
  }

  const createNewReport = async () => {
    if (!newReport.facilityId || !newReport.installationId) return

    setLoading(true)
    try {
      const user = await blink.auth.me()
      const facility = facilities.find(f => f.id === newReport.facilityId)
      
      const report: CBAMReport = {
        id: `cbam-${Date.now()}`,
        reportingPeriod: newReport.reportingPeriod,
        facilityId: newReport.facilityId,
        facilityName: facility?.name || 'Unknown Facility',
        installationId: newReport.installationId,
        products: [],
        totalEmissions: 0,
        status: 'draft',
        createdAt: new Date().toISOString()
      }

      await blink.db.cbamReports.create({
        ...report,
        userId: user.id
      })

      setReports(prev => [report, ...prev])
      setNewReport({ reportingPeriod: '2024', facilityId: '', installationId: '' })
    } catch (error) {
      console.error('Failed to create report:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateXMLReport = (report: CBAMReport) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMReport xmlns="http://ec.europa.eu/cbam/2024" version="1.0">
  <ReportHeader>
    <ReportingPeriod>${report.reportingPeriod}</ReportingPeriod>
    <SubmissionDate>${new Date().toISOString().split('T')[0]}</SubmissionDate>
    <ReportStatus>${report.status}</ReportStatus>
  </ReportHeader>
  
  <Installation>
    <InstallationID>${report.installationId}</InstallationID>
    <FacilityName>${report.facilityName}</FacilityName>
    <TotalEmissions unit="tCO2e">${report.totalEmissions.toFixed(3)}</TotalEmissions>
  </Installation>
  
  <Products>
    ${report.products.map(product => `
    <Product>
      <CNCode>${product.cnCode}</CNCode>
      <ProductName>${product.productName}</ProductName>
      <ProductionVolume unit="${product.unit}">${product.productionVolume}</ProductionVolume>
      <DirectEmissions unit="tCO2e">${product.directEmissions.toFixed(3)}</DirectEmissions>
      <IndirectEmissions unit="tCO2e">${product.indirectEmissions.toFixed(3)}</IndirectEmissions>
      <EmbeddedEmissions unit="tCO2e">${product.embeddedEmissions.toFixed(3)}</EmbeddedEmissions>
      <SpecificEmissions unit="tCO2e/t">${product.specificEmissions.toFixed(6)}</SpecificEmissions>
      <EmissionFactors>
        ${product.emissionFactors.map(ef => `
        <EmissionFactor type="${ef.type}" source="${ef.source}">
          <Value unit="${ef.unit}">${ef.value}</Value>
          ${ef.documentation ? `<Documentation>${ef.documentation}</Documentation>` : ''}
        </EmissionFactor>`).join('')}
      </EmissionFactors>
    </Product>`).join('')}
  </Products>
  
  <Verification>
    <VerificationStatus>pending</VerificationStatus>
    <GeneratedBy>CBAM Aluminium Emissions Platform</GeneratedBy>
    <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
  </Verification>
</CBAMReport>`

    return xmlContent
  }

  const downloadXMLReport = (report: CBAMReport) => {
    const xmlContent = generateXMLReport(report)
    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CBAM_Report_${report.installationId}_${report.reportingPeriod}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validateReport = async (reportId: string) => {
    try {
      await blink.db.cbamReports.update(reportId, { 
        status: 'validated',
        validatedAt: new Date().toISOString()
      })
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: 'validated' as const } : r
      ))
    } catch (error) {
      console.error('Failed to validate report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'validated': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />
      case 'validated': return <CheckCircle className="h-4 w-4" />
      case 'submitted': return <Upload className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const calculateCompletionRate = () => {
    if (reports.length === 0) return 0
    const completed = reports.filter(r => r.status === 'submitted').length
    return (completed / reports.length) * 100
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validated</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'validated' || r.status === 'submitted').length}
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
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'submitted').length}
                </p>
              </div>
              <Upload className="h-8 w-8 text-blue-500" />
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

      {/* Create New Report */}
      <Card>
        <CardHeader>
          <CardTitle>Create New CBAM Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportingPeriod">Reporting Period</Label>
              <Select 
                value={newReport.reportingPeriod} 
                onValueChange={(value) => setNewReport(prev => ({ ...prev, reportingPeriod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="facilityId">Facility</Label>
              <Select 
                value={newReport.facilityId} 
                onValueChange={(value) => setNewReport(prev => ({ ...prev, facilityId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(facility => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="installationId">Installation ID</Label>
              <Input
                id="installationId"
                value={newReport.installationId}
                onChange={(e) => setNewReport(prev => ({ ...prev, installationId: e.target.value }))}
                placeholder="EU-CBAM-XXXX"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createNewReport} disabled={loading} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>CBAM Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No CBAM reports created yet</p>
              <p className="text-sm text-gray-400">Create your first report to start the CBAM compliance process</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {report.facilityName} - {report.reportingPeriod}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Installation ID: {report.installationId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          {report.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => validateReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadXMLReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download XML
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Products:</span>
                      <span className="ml-2 font-medium">{report.products.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Emissions:</span>
                      <span className="ml-2 font-medium">{report.totalEmissions.toFixed(2)} tCO2e</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium capitalize">{report.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CBAM Requirements */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>CBAM XML Requirements:</strong> Reports must include installation ID, embedded emissions per product, 
          CN codes, emission factors with sources (measured/calculated/default), and supporting documentation. 
          All data must be verifiable and comply with Commission Implementing Regulation (EU) 2023/1773.
        </AlertDescription>
      </Alert>

      {/* CN Codes Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Aluminium CN Codes Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CN_CODES.map(code => (
              <div key={code.code} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-mono text-sm font-medium">{code.code}</div>
                  <div className="text-sm text-gray-600">{code.name}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}