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
import { sidebarData } from './data/sidebar-data'

interface AppSidebarProps {
  user?: any
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  className?: string
}

export function AppSidebar({ user, ...sidebarProps }: AppSidebarProps) {
  // Use user data from Laravel if available, otherwise fallback to sidebarData
  const currentUser = user || sidebarData.user
  const currentTeams = sidebarData.teams

  return (
    <Sidebar collapsible='icon' variant='floating' className='peer' {...sidebarProps}>
      <SidebarHeader>
        <TeamSwitcher teams={currentTeams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
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
