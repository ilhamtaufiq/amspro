# Integrasi Layout dengan Shadcn-Admin

Dokumentasi ini menjelaskan integrasi komponen layout modern dari shadcn-admin ke dalam proyek Laravel AMSPRO.

## Struktur Layout yang Diintegrasikan

### 1. Header (`Header`)
- **Lokasi**: `resources/js/layouts/layout/header.tsx`
- **Fitur**:
  - Global Search terintegrasi
  - Notification Bell dengan badge counter
  - Appearance dropdown (dark/light mode)
  - Tahun selector
  - Responsive design
  - Scroll effects
- **Komponen Terintegrasi**:
  - `GlobalSearch` - Pencarian global dengan keyboard shortcut
  - `NotificationBell` - Sistem notifikasi dropdown
  - `AppearanceDropdown` - Toggle tema
  - `PilihTahun` - Selector tahun aktif

### 2. Top Navigation (`TopNav`)
- **Lokasi**: `resources/js/layouts/layout/top-nav.tsx`
- **Fitur**:
  - Navigation links dengan active states
  - Mobile responsive dengan dropdown menu
  - Inertia.js routing integration
  - Hover effects dan transitions
- **Routing**: Terintegrasi dengan Laravel routes melalui Inertia.js

### 3. User Navigation (`NavUser`)
- **Lokasi**: `resources/js/layouts/layout/nav-user.tsx`
- **Fitur**:
  - User avatar dengan initials fallback
  - Dropdown menu dengan user actions
  - Profile, Settings, Notifications, Billing links
  - Logout functionality
  - Laravel authentication integration
- **Actions**:
  - Profile management
  - Settings access
  - Logout dengan CSRF protection

### 4. Modern Breadcrumb (`ModernBreadcrumb`)
- **Lokasi**: `resources/js/components/modern-breadcrumb.tsx`
- **Fitur**:
  - Hierarchical navigation
  - Home icon dengan dashboard link
  - Clickable breadcrumb items
  - Responsive design
  - Inertia.js navigation
- **Styling**: Modern design dengan hover effects

### 5. Page Header (`PageHeader`)
- **Lokasi**: `resources/js/components/page-header.tsx`
- **Fitur**:
  - Page title dan description
  - Action buttons area
  - Optional breadcrumb integration
  - Flexible layout
- **Penggunaan**: Untuk halaman-halaman yang memerlukan header dengan actions

### 6. Authenticated Layout (`AuthenticatedLayout`)
- **Lokasi**: `resources/js/layouts/layout/authenticated-layout.tsx`
- **Fitur**:
  - Sidebar integration
  - Header dengan semua komponen modern
  - Main content area
  - Responsive sidebar state
  - Cookie-based sidebar state persistence
- **Komponen Terintegrasi**:
  - `AppSidebar` - Sidebar utama
  - `Header` - Header dengan search dan notifications
  - `TopNav` - Top navigation
  - `ModernBreadcrumb` - Breadcrumb navigation

## Struktur File Layout

```
resources/js/layouts/
├── authenticated-layout.tsx          # Layout utama (wrapper)
├── guest-layout.tsx                  # Layout untuk guest users
└── layout/
    ├── authenticated-layout.tsx      # Layout modern terintegrasi
    ├── header.tsx                    # Header dengan komponen modern
    ├── top-nav.tsx                   # Top navigation
    ├── nav-user.tsx                  # User navigation
    ├── main.tsx                      # Main content wrapper
    ├── app-sidebar.tsx               # Sidebar component
    ├── nav-group.tsx                 # Navigation groups
    ├── team-switcher.tsx             # Team switcher
    ├── types.ts                      # TypeScript types
    └── data/
        └── sidebar-data.ts           # Sidebar navigation data
```

## Komponen Layout yang Diperbarui

### Header Integration
```typescript
// Header dengan semua komponen modern
<Header>
  <div className="flex items-center gap-2">
    <TopNav links={navigationLinks} />
    <ModernBreadcrumb items={breadcrumbItems} />
  </div>
</Header>
```

### Navigation Links
```typescript
const navigationLinks = [
  { title: 'Dashboard', href: '/dashboard', isActive: true },
  { title: 'Kegiatan', href: '/kegiatan', isActive: false },
  { title: 'Pekerjaan', href: '/pekerjaan', isActive: false },
  { title: 'Users', href: '/users', isActive: false },
  { title: 'Settings', href: '/settings', isActive: false },
]
```

### Breadcrumb Items
```typescript
const breadcrumbItems = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Kegiatan', href: '/kegiatan' },
  { title: 'Detail Kegiatan', isActive: true }
]
```

## Fitur Layout yang Ditambahkan

### 1. Global Search Integration
- Keyboard shortcut (⌘K/Ctrl+K)
- Command palette style interface
- Quick navigation ke semua halaman utama
- Search suggestions

### 2. Notification System
- Real-time notification badges
- Dropdown notification list
- Different notification types (info, warning, success, error)
- User avatars dalam notifications

### 3. Modern Navigation
- Responsive top navigation
- Active state indicators
- Mobile-friendly dropdown menu
- Smooth transitions

### 4. User Management
- User avatar dengan initials
- Profile management
- Settings access
- Secure logout

### 5. Breadcrumb Navigation
- Hierarchical navigation
- Clickable breadcrumb items
- Home icon integration
- Responsive design

## Responsive Design

### Mobile (< 768px)
- Collapsible sidebar
- Dropdown navigation menu
- Stacked header elements
- Touch-friendly interactions

### Tablet (768px - 1024px)
- Semi-expanded sidebar
- Horizontal navigation
- Balanced layout

### Desktop (> 1024px)
- Full sidebar
- Horizontal navigation
- Optimal spacing

## Theme Integration

### Dark Mode Support
- All layout components support dark mode
- Automatic theme switching
- Persistent theme preference
- Smooth transitions

### Color Scheme
- Consistent with shadcn/ui design system
- CSS variables for easy customization
- Accessible color contrasts

## Performance Optimizations

### 1. Lazy Loading
- Components loaded on demand
- Efficient re-rendering
- Minimal bundle impact

### 2. State Management
- Cookie-based sidebar state
- Local storage for preferences
- Efficient state updates

### 3. Routing
- Inertia.js integration
- Client-side navigation
- Optimized page transitions

## Accessibility Features

### 1. Keyboard Navigation
- Tab navigation support
- Keyboard shortcuts
- Focus management

### 2. Screen Reader Support
- ARIA labels
- Semantic HTML
- Screen reader announcements

### 3. Color Contrast
- WCAG compliant colors
- High contrast support
- Focus indicators

## Customization Options

### 1. Navigation Links
```typescript
// Customize navigation links
const customNavigation = [
  { title: 'Custom Page', href: '/custom', isActive: false },
  // ... more links
]
```

### 2. Header Actions
```typescript
// Add custom actions to header
<Header>
  <CustomActionButton />
  <AnotherAction />
</Header>
```

### 3. Sidebar Content
```typescript
// Customize sidebar content
<AppSidebar customItems={customSidebarItems} />
```

## Integration dengan Existing Components

### 1. Laravel Authentication
- User data integration
- CSRF protection
- Session management
- Role-based access

### 2. Inertia.js Routing
- Client-side navigation
- Page transitions
- Form handling
- Error handling

### 3. Existing UI Components
- Compatible dengan semua komponen existing
- Consistent styling
- Shared design system

## Troubleshooting

### 1. Navigation tidak berfungsi
- Check Inertia.js setup
- Verify route definitions
- Check console errors

### 2. Sidebar tidak responsive
- Check CSS variables
- Verify breakpoint settings
- Check JavaScript errors

### 3. Notifications tidak muncul
- Check notification data structure
- Verify API endpoints
- Check network requests

### 4. Theme switching tidak bekerja
- Check theme provider setup
- Verify CSS variables
- Check localStorage permissions

## Best Practices

### 1. Layout Structure
- Use consistent layout patterns
- Maintain responsive design
- Follow accessibility guidelines

### 2. Component Composition
- Compose components modularly
- Use TypeScript interfaces
- Maintain separation of concerns

### 3. Performance
- Optimize bundle size
- Use lazy loading
- Minimize re-renders

### 4. Accessibility
- Use semantic HTML
- Provide ARIA labels
- Test with screen readers

## Credits

- [shadcn-admin](https://github.com/satnaing/shadcn-admin) - Layout inspiration
- [shadcn/ui](https://ui.shadcn.com/) - Base components
- [Inertia.js](https://inertiajs.com/) - Client-side routing
- [Laravel](https://laravel.com/) - Backend framework 