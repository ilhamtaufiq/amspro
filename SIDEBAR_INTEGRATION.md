# Sidebar Integration Documentation

## Overview
This document describes the integration of modern sidebar components from shadcn-admin into the Laravel AMSPRO project using Inertia.js.

## Components Integrated

### 1. AppSidebar (`resources/js/layouts/layout/app-sidebar.tsx`)
The main sidebar component that orchestrates all sidebar elements.

**Features:**
- Collapsible sidebar with icon-only mode
- Floating variant for modern look
- Integrates TeamSwitcher, NavGroups, and NavUser
- Accepts user data from Laravel

**Props:**
```typescript
interface AppSidebarProps {
  user?: any  // User data from Laravel
  // ... other Sidebar props
}
```

### 2. NavGroup (`resources/js/layouts/layout/nav-group.tsx`)
Handles navigation groups and menu items.

**Features:**
- Supports both simple links and collapsible menus
- Responsive dropdown for collapsed state
- Active state detection
- Inertia.js integration for navigation

**Key Functions:**
- `handleNavigation(url)`: Uses `router.visit()` for navigation
- `checkIsActive()`: Determines if a menu item is active
- `SidebarMenuLink`: Simple navigation links
- `SidebarMenuCollapsible`: Collapsible menu groups
- `SidebarMenuCollapsedDropdown`: Dropdown for collapsed state

### 3. TeamSwitcher (`resources/js/layouts/layout/team-switcher.tsx`)
Team selection component in sidebar header.

**Features:**
- Team switching functionality
- Add team option
- Keyboard shortcuts (⌘1, ⌘2, etc.)
- Responsive positioning

**Key Functions:**
- `handleTeamSwitch(team)`: Switches active team
- `handleAddTeam()`: Navigates to team creation

### 4. NavUser (`resources/js/layouts/layout/nav-user.tsx`)
User profile and actions in sidebar footer.

**Features:**
- User avatar with fallback initials
- Profile and settings navigation
- Logout functionality
- Laravel authentication integration

**Key Functions:**
- `handleLogout()`: Posts to `/logout` route
- `handleProfile()`: Navigates to profile page
- `getInitials(name)`: Generates avatar initials

## Data Structure

### Sidebar Data (`resources/js/layouts/layout/data/sidebar-data.ts`)
Contains the navigation structure and team information.

**Structure:**
```typescript
export const sidebarData: SidebarData = {
  user: {
    name: string
    email: string
    avatar: string
  },
  teams: [
    {
      name: string
      logo: React.ElementType
      plan: string
    }
  ],
  navGroups: [
    {
      title: string
      items: NavItem[]
    }
  ]
}
```

**Navigation Groups:**
1. **Dashboard**: Dashboard, Peta Interaktif
2. **Master Data**: Kegiatan, Pekerjaan, Kontrak, Penyedia, Status
3. **Management**: Progress, Keuangan, Output, Todos
4. **System**: Users, Roles, Permissions, Settings
5. **Pages**: Auth, Errors
6. **Other**: Help Center, Documentation

## Integration with Laravel

### User Data Integration
The sidebar components accept user data from Laravel's authentication system:

```typescript
// In authenticated-layout.tsx
<AppSidebar user={user} />

// In app-sidebar.tsx
const currentUser = user || sidebarData.user
<NavUser user={currentUser} />
```

### Navigation Integration
All navigation uses Inertia.js router:

```typescript
import { router } from '@inertiajs/react'

// Navigation
router.visit('/dashboard')

// Logout
router.post('/logout')
```

### Active State Detection
The sidebar automatically detects active routes:

```typescript
function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav && href.split('/')[1] === item?.url?.split('/')[1])
  )
}
```

## Styling and Theming

### CSS Variables
The sidebar uses CSS custom properties for theming:

```css
:root {
  --sidebar-width: 280px;
  --sidebar-width-icon: 64px;
  --sidebar-accent: hsl(var(--accent));
  --sidebar-accent-foreground: hsl(var(--accent-foreground));
  --sidebar-primary: hsl(var(--primary));
  --sidebar-primary-foreground: hsl(var(--primary-foreground));
}
```

### Responsive Behavior
- **Desktop**: Full sidebar with text labels
- **Collapsed**: Icon-only mode with tooltips
- **Mobile**: Floating sidebar with overlay

## Usage Examples

### Basic Usage
```typescript
import { AppSidebar } from '@/layouts/layout/app-sidebar'

<AppSidebar user={auth.user} />
```

### Custom Navigation
```typescript
// Update sidebar-data.ts
export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'Custom Group',
      items: [
        {
          title: 'Custom Page',
          url: '/custom-page',
          icon: CustomIcon,
        }
      ]
    }
  ]
}
```

### Team Switching
```typescript
// In team-switcher.tsx
const handleTeamSwitch = (team) => {
  // Add your team switching logic here
  router.post('/switch-team', { team: team.name })
}
```

## Troubleshooting

### Common Issues

1. **Navigation not working**
   - Ensure `router` is imported from `@inertiajs/react`
   - Check that URLs match your Laravel routes

2. **Active state not detected**
   - Verify `window.location.pathname` is correct
   - Check URL matching logic in `checkIsActive()`

3. **User data not showing**
   - Ensure user prop is passed from Laravel
   - Check user object structure matches expected format

4. **Styling issues**
   - Verify CSS variables are defined
   - Check Tailwind CSS classes are available

### Debug Tips
- Use browser dev tools to inspect sidebar state
- Check console for navigation events
- Verify Inertia.js events are firing correctly

## Future Enhancements

1. **Dynamic Navigation**: Load navigation from Laravel backend
2. **Permission-based Menu**: Show/hide items based on user permissions
3. **Custom Themes**: Additional theme options
4. **Search Integration**: Add search functionality to sidebar
5. **Notifications**: Integrate notification system with sidebar

## Dependencies

- `@inertiajs/react`: Navigation and routing
- `@tabler/icons-react`: Icons
- `lucide-react`: Additional icons
- `@/components/ui/sidebar`: Shadcn UI sidebar components
- `@/components/ui/dropdown-menu`: Dropdown components
- `@/components/ui/avatar`: Avatar component 