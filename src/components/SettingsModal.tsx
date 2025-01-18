import { Dialog } from '@headlessui/react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [tempSettings, setTempSettings] = useState(settings);

  // Modal açıldığında temp ayarları güncelle
  useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(tempSettings);
    window.location.reload();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-green-400 mb-4">
            {t('settings.title')}
          </Dialog.Title>

          {/* Tema Seçimi */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('settings.theme.title')}
            </h3>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setTempSettings(prev => ({ ...prev, theme }))}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tempSettings.theme === theme
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(`settings.theme.${theme}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Dil Seçimi */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('settings.language.title')}
            </h3>
            <div className="flex gap-2">
              {(['tr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTempSettings(prev => ({ ...prev, language: lang }))}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tempSettings.language === lang
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(`settings.language.${lang}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Yazı Boyutu */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('settings.fontSize.title')}
            </h3>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTempSettings(prev => ({ ...prev, fontSize: size }))}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tempSettings.fontSize === size
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(`settings.fontSize.${size}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 