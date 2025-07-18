import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  Calculator, 
  FileCheck, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { blink } from '@/blink/client'

export function Dashboard() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load facilities data
        const facilitiesData = await blink.db.facilities.list({
          orderBy: { createdAt: 'desc' },
          limit: 10
        })
        setFacilities(facilitiesData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const stats = [
    {
      title: 'Active Facilities',
      value: facilities.length,
      icon: Building2,
      description: 'Registered installations',
      trend: '+2 this month'
    },
    {
      title: 'Compliance Status',
      value: '85%',
      icon: FileCheck,
      description: 'Reports completed',
      trend: 'On track for deadline'
    },
    {
      title: 'Total Emissions',
      value: '12.4k',
      icon: TrendingUp,
      description: 'tCO₂e calculated',
      trend: '-5% vs last year'
    },
    {
      title: 'Supplier Network',
      value: '24',
      icon: Users,
      description: 'Connected suppliers',
      trend: '+8 new connections'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'calculation',
      message: 'Emissions calculated for Facility A - Primary Aluminium',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'supplier',
      message: 'New supplier invitation sent to Nordic Metals Ltd',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'report',
      message: 'CBAM XML file generated for Q4 2024',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'validation',
      message: 'Mass balance validation completed - 2 warnings found',
      time: '2 days ago',
      status: 'warning'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CBAM Platform</h2>
        <p className="text-gray-600">
          Monitor your aluminium production emissions and ensure EU compliance across all facilities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-xs text-gray-600 mb-2">{stat.description}</p>
              <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              2024 Compliance Progress
            </CardTitle>
            <CardDescription>
              Track your progress towards CBAM reporting deadline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Facility Registration</span>
                <span className="text-green-600 font-medium">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production Line Mapping</span>
                <span className="text-blue-600 font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Emissions Calculations</span>
                <span className="text-orange-600 font-medium">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Supplier Data Collection</span>
                <span className="text-red-600 font-medium">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Deadline: March 31, 2025</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  73 days left
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your facilities and calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {activity.status === 'pending' && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t mt-4">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you stay compliant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <Calculator className="w-6 h-6" />
              <span>Calculate Emissions</span>
              <span className="text-xs opacity-75">Start new calculation</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Invite Supplier</span>
              <span className="text-xs opacity-75">Collect upstream data</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileCheck className="w-6 h-6" />
              <span>Generate Report</span>
              <span className="text-xs opacity-75">Export CBAM XML</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}