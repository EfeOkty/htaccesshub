import { useState, useEffect } from 'react';
import { cookieManager } from '../utils/cookieManager';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // İlk yüklemede ayarları çerezlerden al
  useEffect(() => {
    const savedSettings = cookieManager.get('userSettings');
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  // Ayarları güncelle ve çerezlere kaydet
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      cookieManager.set('userSettings', updated);
      return updated;
    });
  };

  // Özel özellik ekle
  const addCustomFeature = (feature: UserSettings['customFeatures'][0]) => {
    updateSettings({
      customFeatures: [...settings.customFeatures, feature]
    });
  };

  // Özel özellik sil
  const removeCustomFeature = (featureId: string) => {
    updateSettings({
      ...settings,
      customFeatures: settings.customFeatures.filter(f => f.id !== featureId),
      selectedFeatures: settings.selectedFeatures.filter(id => id !== featureId)
    });
  };

  // Favori ekle/çıkar
  const toggleFavorite = (featureId: string) => {
    const favorites = settings.favorites.includes(featureId)
      ? settings.favorites.filter(id => id !== featureId)
      : [...settings.favorites, featureId];
    updateSettings({ favorites });
  };

  // Son kullanılanları güncelle
  const addToRecentlyUsed = (featureId: string) => {
    const recentlyUsed = [
      featureId,
      ...settings.recentlyUsed.filter(id => id !== featureId)
    ].slice(0, 10); // Son 10 özelliği tut
    updateSettings({ recentlyUsed });
  };

  // Yedekleme oluştur
  const createBackup = (name: string, features: string[]) => {
    const backup = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      features,
      name
    };
    updateSettings({
      backups: [...settings.backups, backup]
    });
  };

  // Yedekten geri yükle
  const restoreBackup = (backupId: string) => {
    const backup = settings.backups.find(b => b.id === backupId);
    if (backup) {
      return backup.features;
    }
    return null;
  };

  return {
    settings,
    updateSettings,
    addCustomFeature,
    removeCustomFeature,
    toggleFavorite,
    addToRecentlyUsed,
    createBackup,
    restoreBackup
  };
} 