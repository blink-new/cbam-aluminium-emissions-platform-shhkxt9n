import { Building2, Calculator, Factory, FileText, Home, Settings, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Facilities', href: '/facilities', icon: Building2 },
    ]
  },
  {
    title: 'Emissions Management',
    items: [
      { name: 'Production Mapper', href: '/production', icon: Factory },
      { name: 'Emissions Calculator', href: '/emissions', icon: Calculator },
      { name: 'Supplier Collaboration', href: '/suppliers', icon: Users },
    ]
  },
  {
    title: 'Compliance',
    items: [
      { name: 'Reports & Export', href: '/reports', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">CBAM Platform</h2>
              <p className="text-xs text-muted-foreground">EU Compliance</p>
            </div>
          </div>
        </div>

        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}