export interface ViewerSettings {
  autoRotate: boolean;
  shadows: boolean;
  contactShadow: boolean;
  intensity: number;
  preset: EnvironmentPreset;
  envRotation: number;
  grid: boolean;
  axes: boolean;
  backgroundColor: string;
  wireframe: boolean;
  showStats: boolean;
  materialConfig: MaterialConfig;
  scale: number;
  showEnvBackground: boolean;
}

export interface MaterialConfig {
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  blending: 'normal' | 'additive' | 'subtractive' | 'multiply';
  transparent: boolean;
}

export type EnvironmentPreset = 
  | 'studio' 
  | 'royal_esplanade' 
  | 'venice_sunset' 
  | 'moonless_golf' 
  | 'peppermint_powerplant' 
  | 'forest_slope' 
  | 'brown_photostudio' 
  | 'aerodynamics_workshop'
  | 'city';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export type ViewMode = 'monitor' | 'editor';

export interface ModelStats {
  triangles: string;
  materials: number;
  dimensions: string;
}
