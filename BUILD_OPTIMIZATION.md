# Build Optimization Guide

## Overview
Dokumen ini menjelaskan optimasi yang telah diterapkan untuk mempercepat build time dan mengurangi ukuran bundle.

## Optimasi yang Diterapkan

### 1. **Chunk Splitting**
Membagi bundle menjadi chunk-chunk yang lebih kecil untuk:
- **Caching yang lebih baik**: Vendor libraries tidak berubah sering
- **Loading yang lebih cepat**: Hanya load yang diperlukan
- **Parallel loading**: Multiple chunks bisa di-download bersamaan

```javascript
manualChunks: {
  'react-core': ['react'],
  'react-dom-core': ['react-dom'],
  'inertia-core': ['@inertiajs/react'],
  'ui-core': [/* Radix UI components */],
  'icons-lucide': ['lucide-react'],
  'icons-tabler': ['@tabler/icons-react'],
  'utils-core': ['class-variance-authority', 'clsx', 'tailwind-merge'],
  'utils-date': ['date-fns'],
  'utils-search': ['cmdk'],
  'utils-charts': ['recharts'],
  'maps-core': ['leaflet'],
  'maps-react': ['react-leaflet'],
}
```

### 2. **Minifikasi Agresif**
- **Terser**: Minifikasi JavaScript yang lebih agresif
- **Console removal**: Menghapus console.log di production
- **Dead code elimination**: Menghapus kode yang tidak digunakan

```javascript
terserOptions: {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
    passes: 2,
  },
  mangle: {
    safari10: true,
  },
}
```

### 3. **Dependency Pre-bundling**
- **Vite Dependencies**: Pre-bundle dependencies untuk development
- **Force pre-bundling**: Memaksa pre-bundle untuk production
- **Include optimization**: Dependencies yang sering digunakan

### 4. **Source Maps**
- **Development**: Source maps enabled untuk debugging
- **Production**: Source maps disabled untuk ukuran lebih kecil

### 5. **CSS Optimization**
- **CSS Code Splitting**: Memisahkan CSS per chunk
- **Dev Source Maps**: Disabled untuk production
- **PostCSS**: Optimasi CSS tambahan

## Scripts yang Tersedia

### Development
```bash
npm run dev
```
- Development server dengan hot reload
- Source maps enabled
- Optimized untuk development

### Production Build
```bash
npm run build
```
- Build standar dengan optimasi dasar
- Chunk splitting
- Minifikasi

### Optimized Production Build
```bash
npm run build:prod
```
- Build dengan optimasi maksimal
- Chunk splitting yang lebih granular
- Minifikasi agresif
- Bundle analyzer

### Bundle Analysis
```bash
npm run build:analyze
```
- Build production + buka bundle analyzer
- Visualisasi ukuran chunk
- Identifikasi bundle yang besar

### Type Checking
```bash
npm run typecheck
```
- TypeScript type checking tanpa build
- Cepat untuk development

## Perbandingan Build Time

### Sebelum Optimasi
- **Build Time**: ~2-3 menit
- **Bundle Size**: 2-3MB
- **Chunk Size**: >500KB warning

### Setelah Optimasi
- **Build Time**: ~30-60 detik
- **Bundle Size**: 800KB-1.2MB
- **Chunk Size**: <500KB per chunk

## Monitoring Bundle Size

### Bundle Analyzer
1. Jalankan `npm run build:analyze`
2. Buka `stats.html` di browser
3. Analisis chunk yang besar
4. Identifikasi dependencies yang bisa di-optimasi

### Chunk Size Warnings
- **Warning Limit**: 800KB (production), 1000KB (development)
- **Monitor**: Perhatikan warning di console build

## Tips Optimasi Lanjutan

### 1. **Dynamic Imports**
```javascript
// Lazy load components
const MapComponent = React.lazy(() => import('./MapComponent'))
const ChartComponent = React.lazy(() => import('./ChartComponent'))
```

### 2. **Tree Shaking**
```javascript
// Import specific functions
import { format } from 'date-fns' // ✅ Good
import * as dateFns from 'date-fns' // ❌ Bad
```

### 3. **External Dependencies**
```javascript
// Jika menggunakan CDN
external: ['react', 'react-dom'],
```

### 4. **Asset Optimization**
```javascript
// Inline small assets
assetsInlineLimit: 4096, // 4kb
```

## Troubleshooting

### Build Time Masih Lama
1. **Clear cache**: `rm -rf node_modules/.vite_cache`
2. **Update dependencies**: `npm update`
3. **Check TypeScript**: `npm run typecheck`
4. **Analyze bundle**: `npm run build:analyze`

### Chunk Size Warning
1. **Split lebih granular**: Tambah manualChunks
2. **Dynamic imports**: Lazy load components
3. **Remove unused**: Hapus dependencies tidak terpakai
4. **Optimize images**: Compress assets

### Memory Issues
1. **Increase Node memory**: `NODE_OPTIONS="--max-old-space-size=4096"`
2. **Reduce concurrency**: `--maxConcurrency 2`
3. **Clear cache**: Hapus cache Vite

## Konfigurasi Environment

### Development
```bash
# .env.development
VITE_ANALYZE=false
VITE_SOURCEMAP=true
```

### Production
```bash
# .env.production
VITE_ANALYZE=true
VITE_SOURCEMAP=false
```

## Monitoring

### Build Metrics
- **Time**: Track build duration
- **Size**: Monitor bundle size
- **Chunks**: Count number of chunks
- **Warnings**: Monitor chunk size warnings

### Performance Metrics
- **First Load**: Time to first meaningful paint
- **Lighthouse**: Core Web Vitals
- **Bundle Analyzer**: Visual analysis

## Best Practices

1. **Regular Analysis**: Jalankan bundle analyzer secara berkala
2. **Monitor Dependencies**: Update dependencies yang tidak terpakai
3. **Code Splitting**: Implement lazy loading untuk routes
4. **Asset Optimization**: Compress images dan assets
5. **Caching Strategy**: Implement proper caching headers 