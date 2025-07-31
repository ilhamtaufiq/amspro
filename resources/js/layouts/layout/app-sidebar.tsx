import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/layouts/layout/nav-group'
import { NavUser } from '@/layouts/layout/nav-user'
import { TeamSwitcher } from '@/layouts/layout/team-switcher'
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { Menu as MenuType } from '@/types/models'
import { sidebarData } from './data/sidebar-data'

interface AppSidebarProps {
  user?: any
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  className?: string
}

export function AppSidebar({ user, ...sidebarProps }: AppSidebarProps) {
  const { props } = usePage<PageProps>()
  const { menu } = props

  const currentUser = user || sidebarData.user
  const currentTeams = sidebarData.teams

  const filteredNavGroups = sidebarData.navGroups.map(group => {
    const filteredItems = group.items.filter(item => {
      if (item.url) {
        const menuName = item.url === '/' ? 'dashboard' : item.url.substring(1) // Convert / to dashboard, /users to users
        return menu.some(m => m.name === menuName)
      } else if (item.items) {
        // Handle nested items
        item.items = item.items.filter(subItem => {
          if (subItem.url) {
            const menuName = subItem.url.substring(1)
            return menu.some(m => m.name === menuName)
          }
          return false
        })
        return item.items.length > 0
      }
      return false
    })
    return { ...group, items: filteredItems }
  }).filter(group => group.items.length > 0)

  return (
    <Sidebar collapsible='icon' variant='floating' className='peer' {...sidebarProps}>
      <SidebarHeader>
        <TeamSwitcher teams={currentTeams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
