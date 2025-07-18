import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Settings, ArrowRight, Factory, Zap, Flame, Recycle } from 'lucide-react'

interface ProcessNode {
  id: string
  type: 'input' | 'process' | 'output'
  name: string
  category: string
  x: number
  y: number
  inputs: string[]
  outputs: string[]
  emissionFactor?: number
  energyConsumption?: number
}

interface Connection {
  id: string
  from: string
  to: string
}

const PROCESS_CATEGORIES = {
  'bauxite-mining': { name: 'Bauxite Mining', icon: Factory, color: 'bg-amber-100 text-amber-800' },
  'alumina-refining': { name: 'Alumina Refining', icon: Factory, color: 'bg-orange-100 text-orange-800' },
  'electrolysis': { name: 'Primary Electrolysis', icon: Zap, color: 'bg-blue-100 text-blue-800' },
  'casting': { name: 'Casting', icon: Factory, color: 'bg-green-100 text-green-800' },
  'rolling': { name: 'Rolling/Extrusion', icon: Factory, color: 'bg-purple-100 text-purple-800' },
  'melting': { name: 'Secondary Melting', icon: Flame, color: 'bg-red-100 text-red-800' },
  'recycling': { name: 'Recycling', icon: Recycle, color: 'bg-emerald-100 text-emerald-800' }
}

const PREDEFINED_PROCESSES = [
  { name: 'Bauxite Extraction', category: 'bauxite-mining', type: 'input' as const },
  { name: 'Bayer Process', category: 'alumina-refining', type: 'process' as const },
  { name: 'Hall-Héroult Process', category: 'electrolysis', type: 'process' as const },
  { name: 'Primary Aluminium', category: 'electrolysis', type: 'output' as const },
  { name: 'Continuous Casting', category: 'casting', type: 'process' as const },
  { name: 'Hot Rolling', category: 'rolling', type: 'process' as const },
  { name: 'Cold Rolling', category: 'rolling', type: 'process' as const },
  { name: 'Scrap Melting', category: 'melting', type: 'process' as const },
  { name: 'Secondary Aluminium', category: 'melting', type: 'output' as const },
  { name: 'Aluminium Sheets', category: 'rolling', type: 'output' as const },
  { name: 'Aluminium Billets', category: 'casting', type: 'output' as const }
]

export default function ProcessFlowBuilder() {
  const [nodes, setNodes] = useState<ProcessNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null)
  const [draggedNode, setDraggedNode] = useState<ProcessNode | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addNode = useCallback((processTemplate: typeof PREDEFINED_PROCESSES[0]) => {
    const newNode: ProcessNode = {
      id: `node-${Date.now()}`,
      type: processTemplate.type,
      name: processTemplate.name,
      category: processTemplate.category,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      inputs: [],
      outputs: []
    }
    setNodes(prev => [...prev, newNode])
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent, node: ProcessNode) => {
    if (isConnecting) {
      if (connectionStart === null) {
        setConnectionStart(node.id)
      } else if (connectionStart !== node.id) {
        // Create connection
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectionStart,
          to: node.id
        }
        setConnections(prev => [...prev, newConnection])
        setConnectionStart(null)
        setIsConnecting(false)
      }
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      })
      setDraggedNode(node)
    }
  }, [isConnecting, connectionStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const newX = e.clientX - rect.left - dragOffset.x
      const newY = e.clientY - rect.top - dragOffset.y
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode.id 
          ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
          : node
      ))
    }
  }, [draggedNode, dragOffset])

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  const updateNodeProperties = useCallback((nodeId: string, updates: Partial<ProcessNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }, [])

  const getConnectionPath = useCallback((from: ProcessNode, to: ProcessNode) => {
    const startX = from.x + 120
    const startY = from.y + 40
    const endX = to.x
    const endY = to.y + 40
    
    const midX = (startX + endX) / 2
    
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
  }, [])

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Production Line Mapper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={isConnecting ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsConnecting(!isConnecting)
                setConnectionStart(null)
              }}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {isConnecting ? 'Cancel Connect' : 'Connect Processes'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNodes([])
                setConnections([])
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {PREDEFINED_PROCESSES.map((process, index) => {
              const categoryInfo = PROCESS_CATEGORIES[process.category as keyof typeof PROCESS_CATEGORIES]
              const Icon = categoryInfo.icon
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => addNode(process)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs text-center">{process.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <div
            ref={canvasRef}
            className="relative w-full h-full bg-gray-50 overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map(connection => {
                const fromNode = nodes.find(n => n.id === connection.from)
                const toNode = nodes.find(n => n.id === connection.to)
                if (!fromNode || !toNode) return null
                
                return (
                  <path
                    key={connection.id}
                    d={getConnectionPath(fromNode, toNode)}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#3b82f6"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const categoryInfo = PROCESS_CATEGORIES[node.category as keyof typeof PROCESS_CATEGORIES]
              const Icon = categoryInfo.icon
              
              return (
                <div
                  key={node.id}
                  className={`absolute bg-white border-2 rounded-lg shadow-md cursor-move select-none transition-all hover:shadow-lg ${
                    connectionStart === node.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: '120px',
                    minHeight: '80px'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode(node)
                              }}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Process: {node.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="name">Process Name</Label>
                                <Input
                                  id="name"
                                  value={node.name}
                                  onChange={(e) => updateNodeProperties(node.id, { name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="emissionFactor">Emission Factor (tCO2e/t)</Label>
                                <Input
                                  id="emissionFactor"
                                  type="number"
                                  step="0.001"
                                  value={node.emissionFactor || ''}
                                  onChange={(e) => updateNodeProperties(node.id, { emissionFactor: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="energyConsumption">Energy Consumption (kWh/t)</Label>
                                <Input
                                  id="energyConsumption"
                                  type="number"
                                  step="0.1"
                                  value={node.energyConsumption || ''}
                                  onChange={(e) => updateNodeProperties(node.id, { energyConsumption: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNode(node.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {node.name}
                    </div>
                    <Badge className={`text-xs ${categoryInfo.color}`}>
                      {categoryInfo.name}
                    </Badge>
                    {node.emissionFactor && (
                      <div className="text-xs text-gray-500 mt-1">
                        {node.emissionFactor} tCO2e/t
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Instructions */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Build Your Production Line</p>
                  <p className="text-sm">Add processes from the toolbar above to start mapping your facility</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Process Summary */}
      {nodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Process Flow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
                <div className="text-sm text-gray-600">Total Processes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{connections.length}</div>
                <div className="text-sm text-gray-600">Process Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {nodes.filter(n => n.emissionFactor).length}
                </div>
                <div className="text-sm text-gray-600">Configured Emissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}