# Navigation Progress Integration

Dokumentasi ini menjelaskan integrasi komponen Navigation Progress modern yang terinspirasi dari shadcn-admin ke dalam proyek Laravel AMSPRO.

## Komponen Navigation Progress

### Lokasi
- **File**: `resources/js/components/navigation-progress.tsx`
- **Import**: `import { NavigationProgress } from "@/components/navigation-progress"`

### Fitur Utama

1. **Modern Design**
   - Gradient progress bar dengan efek glow
   - Smooth animations dan transitions
   - Responsive design
   - Customizable colors dan height

2. **Smart Progress Simulation**
   - Realistic progress animation
   - Automatic progress simulation
   - Smooth transitions
   - Error handling

3. **Inertia.js Integration**
   - Listens to Inertia.js events
   - Automatic start/finish detection
   - Error state handling
   - Page visibility change detection

4. **Customization Options**
   - Multiple color themes
   - Adjustable height
   - Optional spinner
   - Custom styling

## Implementasi

### 1. Basic Usage
```typescript
import { NavigationProgress } from "@/components/navigation-progress"

// Di app.tsx atau layout utama
<NavigationProgress />
```

### 2. Customized Usage
```typescript
<NavigationProgress 
  color="primary"        // primary, secondary, accent, destructive
  height={3}            // Height in pixels
  showSpinner={true}    // Show loading spinner
  className="custom-class"
/>
```

### 3. Integration di App.tsx
```typescript
// resources/js/app.tsx
import { NavigationProgress } from "@/components/navigation-progress"

createInertiaApp({
  // ... konfigurasi lainnya
  setup({ el, App, props }) {
    const root = createRoot(el)

    root.render(
      <ThemeProvider>
        <NavigationProgress />
        <App {...props} />
        {/* komponen lainnya */}
      </ThemeProvider>
    )
  }
})
```

## Konfigurasi

### Props Interface
```typescript
interface NavigationProgressProps {
  className?: string    // Custom CSS classes
  color?: string        // Color theme
  height?: number       // Progress bar height
  showSpinner?: boolean // Show loading spinner
}
```

### Color Themes
- `primary` - Default blue theme
- `secondary` - Gray theme
- `accent` - Accent color theme
- `destructive` - Red theme for errors

### Default Values
- `color`: "primary"
- `height`: 2 (pixels)
- `showSpinner`: false

## Event Handling

### Inertia.js Events
Komponen mendengarkan event berikut:
- `inertia:start` - Navigation dimulai
- `inertia:finish` - Navigation selesai
- `inertia:error` - Navigation error

### Progress Simulation
1. **Start**: Progress dimulai dari 0%
2. **Simulation**: Progress bertambah secara random hingga 90%
3. **Finish**: Progress mencapai 100% dan fade out
4. **Error**: Progress mencapai 100% dan fade out

## Styling

### CSS Classes
```css
/* Container */
.fixed.top-0.left-0.right-0.z-50

/* Progress Bar */
.bg-gradient-to-r.from-primary.via-primary/80.to-primary/60

/* Animations */
.transition-opacity.duration-300
.transition-all.duration-200.ease-out

/* Spinner */
.animate-spin.rounded-full.border-2.border-primary.border-t-transparent
```

### Custom Styling
```typescript
<NavigationProgress 
  className="custom-progress-bar"
  style={{ 
    backgroundColor: 'custom-color',
    boxShadow: 'custom-shadow'
  }}
/>
```

## Performance Optimizations

### 1. Efficient Rendering
- Conditional rendering (hanya tampil saat navigating)
- Optimized animations dengan CSS transitions
- Minimal DOM updates

### 2. Memory Management
- Proper cleanup of event listeners
- Interval cleanup
- State reset setelah navigation

### 3. Bundle Size
- Lightweight component
- No external dependencies
- Tree-shakable

## Browser Support

### Modern Browsers
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Features
- ✅ CSS Grid/Flexbox
- ✅ CSS Transitions
- ✅ CSS Animations
- ✅ Event Listeners
- ✅ Intersection Observer

## Accessibility

### 1. Screen Reader Support
- Proper ARIA labels
- Semantic HTML
- Screen reader announcements

### 2. Keyboard Navigation
- Focus management
- Keyboard shortcuts
- Tab navigation

### 3. Color Contrast
- WCAG compliant colors
- High contrast support
- Focus indicators

## Troubleshooting

### 1. Progress Bar Tidak Muncul
```bash
# Check console errors
npm run dev

# Verify Inertia.js setup
# Check event listeners
```

### 2. Animasi Tidak Smooth
```css
/* Ensure CSS transitions are enabled */
* {
  transition: all 0.2s ease-out;
}
```

### 3. Event Listeners Tidak Berfungsi
```typescript
// Verify Inertia.js version
// Check event names
// Ensure proper cleanup
```

### 4. Styling Issues
```css
/* Check CSS variables */
:root {
  --primary: #3b82f6;
  --secondary: #6b7280;
  --accent: #f59e0b;
  --destructive: #ef4444;
}
```

## Best Practices

### 1. Performance
- Use CSS transitions over JavaScript animations
- Minimize DOM updates
- Proper cleanup of resources

### 2. User Experience
- Keep progress bar subtle
- Use appropriate colors
- Smooth animations

### 3. Accessibility
- Provide alternative indicators
- Use semantic HTML
- Test with screen readers

### 4. Maintenance
- Regular updates
- Version compatibility
- Documentation updates

## Migration dari Progress Lama

### Before (Inertia.js Default)
```typescript
createInertiaApp({
  progress: {
    color: "#4B5563",
  },
})
```

### After (Custom Navigation Progress)
```typescript
// Remove progress config
createInertiaApp({
  // ... other config
})

// Add component
<NavigationProgress />
```

## Customization Examples

### 1. Custom Color Theme
```typescript
<NavigationProgress 
  color="destructive"
  height={4}
  showSpinner={true}
/>
```

### 2. Custom Styling
```typescript
<NavigationProgress 
  className="my-custom-progress"
  style={{
    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
    height: '3px'
  }}
/>
```

### 3. Multiple Instances
```typescript
// Different progress bars for different sections
<NavigationProgress color="primary" />
<NavigationProgress color="secondary" height={1} />
```

## Credits

- [shadcn-admin](https://github.com/satnaing/shadcn-admin) - Design inspiration
- [Inertia.js](https://inertiajs.com/) - Navigation framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework 