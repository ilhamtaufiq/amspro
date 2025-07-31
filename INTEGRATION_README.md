# Integrasi Shadcn-Admin dengan AMSPRO

Dokumentasi ini menjelaskan integrasi komponen-komponen modern dari [shadcn-admin](https://github.com/satnaing/shadcn-admin) ke dalam proyek Laravel AMSPRO.

## Komponen yang Diintegrasikan

### 1. Global Search (`GlobalSearch`)
- **Lokasi**: `resources/js/components/global-search.tsx`
- **Fitur**: 
  - Pencarian global dengan keyboard shortcut (⌘K / Ctrl+K)
  - Navigasi cepat ke halaman-halaman utama
  - Command palette style interface
- **Penggunaan**: Sudah terintegrasi di header layout

### 2. Dashboard Stats (`DashboardStats`)
- **Lokasi**: `resources/js/components/dashboard-stats.tsx`
- **Fitur**:
  - Card statistik dengan ikon dan trend indicators
  - Warna yang berbeda untuk setiap kategori
  - Responsive grid layout
- **Penggunaan**: Digunakan di halaman dashboard

### 3. Dashboard Charts (`DashboardCharts`)
- **Lokasi**: `resources/js/components/dashboard-charts.tsx`
- **Fitur**:
  - Bar chart untuk progress pekerjaan
  - Pie chart untuk distribusi kegiatan
  - Area chart untuk trend bulanan
  - Menggunakan Recharts library
- **Penggunaan**: Digunakan di halaman dashboard

### 4. Recent Activity (`RecentActivity`)
- **Lokasi**: `resources/js/components/recent-activity.tsx`
- **Fitur**:
  - Timeline aktivitas terbaru
  - Avatar pengguna
  - Status badges
  - Timestamp formatting
- **Penggunaan**: Digunakan di halaman dashboard

### 5. Quick Actions (`QuickActions`)
- **Lokasi**: `resources/js/components/quick-actions.tsx`
- **Fitur**:
  - Grid aksi cepat untuk fitur utama
  - Ikon berwarna untuk setiap aksi
  - Hover effects
- **Penggunaan**: Digunakan di halaman dashboard

### 6. Notification Bell (`NotificationBell`)
- **Lokasi**: `resources/js/components/notification-bell.tsx`
- **Fitur**:
  - Dropdown notifications
  - Badge counter untuk notifikasi belum dibaca
  - Different notification types (info, warning, success, error)
  - User avatars
- **Penggunaan**: Terintegrasi di header layout

### 7. Calendar Widget (`CalendarWidget`)
- **Lokasi**: `resources/js/components/calendar-widget.tsx`
- **Fitur**:
  - Calendar picker dengan date-fns
  - Event management
  - Today's events dan upcoming events
  - Event type badges
- **Penggunaan**: Digunakan di halaman dashboard

## Dependencies yang Ditambahkan

### Frontend Dependencies
```json
{
  "date-fns": "^2.30.0",
  "cmdk": "^1.1.1"
}
```

### Komponen UI yang Diperlukan
- `Command` - untuk global search
- `Calendar` - untuk calendar widget
- `Popover` - untuk calendar picker
- `DropdownMenu` - untuk notification bell
- `Badge` - untuk status indicators
- `Avatar` - untuk user avatars

## Struktur File yang Diperbarui

### Layout
- `resources/js/layouts/authenticated-layout.tsx` - Menambahkan GlobalSearch dan NotificationBell di header

### Dashboard
- `resources/js/pages/dashboard.tsx` - Menggunakan semua komponen baru

### Komponen UI
- `resources/js/components/ui/command.tsx` - Komponen Command untuk global search

## Cara Penggunaan

### 1. Global Search
Tekan `⌘K` (Mac) atau `Ctrl+K` (Windows/Linux) untuk membuka global search, atau klik tombol search di header.

### 2. Dashboard Modern
Dashboard sekarang memiliki:
- Stats cards dengan trend indicators
- Interactive charts
- Recent activity timeline
- Quick actions grid
- Calendar widget
- Modern notification system

### 3. Notifications
Klik icon bell di header untuk melihat notifikasi terbaru.

## Konfigurasi

### 1. Data Integration
Untuk mengintegrasikan dengan data real, update props di komponen:

```typescript
// Di DashboardController.php
public function index()
{
    return Inertia::render('Dashboard', [
        'stats' => [
            'totalUsers' => User::count(),
            'totalKegiatan' => Kegiatan::count(),
            // ... more stats
        ],
        'recentActivities' => Activity::latest()->take(10)->get(),
        'calendarEvents' => Event::upcoming()->get(),
        // ... more data
    ]);
}
```

### 2. Customization
Setiap komponen dapat dikustomisasi dengan mengubah:
- Colors dan styling
- Data structure
- Layout dan positioning
- Functionality

## Fitur yang Dipertahankan

Semua fitur dan fungsi asli proyek AMSPRO tetap dipertahankan:
- ✅ Authentication system
- ✅ CRUD operations untuk semua model
- ✅ Map integration
- ✅ File uploads
- ✅ Role-based permissions
- ✅ Existing UI components
- ✅ Database structure
- ✅ API endpoints

## Browser Support

Komponen-komponen baru mendukung:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

- Komponen menggunakan React.memo untuk optimasi
- Lazy loading untuk charts
- Efficient re-rendering
- Minimal bundle size impact

## Troubleshooting

### 1. Global Search tidak berfungsi
- Pastikan `cmdk` dependency terinstall
- Check console untuk error JavaScript

### 2. Charts tidak muncul
- Pastikan `recharts` dependency terinstall
- Check data format yang dikirim ke komponen

### 3. Calendar tidak berfungsi
- Pastikan `date-fns` dependency terinstall
- Check locale configuration

### 4. Styling issues
- Pastikan Tailwind CSS terkonfigurasi dengan benar
- Check CSS variables untuk theme colors

## Contributing

Untuk menambahkan komponen baru dari shadcn-admin:

1. Copy komponen dari repository shadcn-admin
2. Adapt untuk Inertia.js dan Laravel
3. Update dependencies jika diperlukan
4. Test di berbagai browser
5. Update dokumentasi ini

## Credits

- [shadcn-admin](https://github.com/satnaing/shadcn-admin) - Komponen UI modern
- [shadcn/ui](https://ui.shadcn.com/) - Base UI components
- [Recharts](https://recharts.org/) - Chart library
- [date-fns](https://date-fns.org/) - Date utility library 