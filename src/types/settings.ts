export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  customFeatures: Array<{
    id: string;
    name: string;
    description: string;
    code: string;
    category: string;
  }>;
  favorites: string[]; // Favori özellik ID'leri
  recentlyUsed: string[]; // Son kullanılan özellik ID'leri
  selectedFeatures: string[]; // Seçili özellik ID'leri
  backups: Array<{
    id: string;
    date: string;
    features: string[];
    name: string;
  }>;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'tr',
  fontSize: 'medium',
  customFeatures: [],
  favorites: [],
  recentlyUsed: [],
  selectedFeatures: [],
  backups: []
}; 