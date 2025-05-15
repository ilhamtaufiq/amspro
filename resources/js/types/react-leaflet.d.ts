declare module '@react-leaflet/core/lib/context' {
  import { LayerGroup } from 'leaflet';
  
  export interface ControlledLayer {
    addLayer(layer: LayerGroup): void;
    removeLayer(layer: LayerGroup): void;
  }
} 