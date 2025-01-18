import { Dialog } from '@headlessui/react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../hooks/useSettings';
import { useState } from 'react';
import { CATEGORIES } from '../features';

interface CustomFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomFeatureModal({ isOpen, onClose }: CustomFeatureModalProps) {
  const { t } = useTranslation();
  const { addCustomFeature } = useSettings();
  const [feature, setFeature] = useState({
    name: '',
    description: '',
    code: '',
    category: Object.keys(CATEGORIES)[0]
  });

  const handleSubmit = () => {
    if (!feature.name.trim() || !feature.description.trim() || !feature.code.trim()) return;

    addCustomFeature({
      id: `custom-${Date.now()}`,
      ...feature
    });

    setFeature({
      name: '',
      description: '',
      code: '',
      category: Object.keys(CATEGORIES)[0]
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-green-400 mb-4">
            {t('features.addCustom')}
          </Dialog.Title>

          <div className="space-y-4">
            {/* İsim */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('common.name')}
              </label>
              <input
                type="text"
                value={feature.name}
                onChange={(e) => setFeature(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('common.description')}
              </label>
              <textarea
                value={feature.description}
                onChange={(e) => setFeature(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('features.categories')}
              </label>
              <select
                value={feature.category}
                onChange={(e) => setFeature(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* .htaccess Kodu */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                .htaccess {t('common.code')}
              </label>
              <textarea
                value={feature.code}
                onChange={(e) => setFeature(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none font-mono"
                rows={6}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feature.name.trim() || !feature.description.trim() || !feature.code.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.save')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 