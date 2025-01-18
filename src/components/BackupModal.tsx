import { Dialog } from '@headlessui/react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../hooks/useSettings';
import { useState } from 'react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFeatures: string[];
  onRestore: (features: string[]) => void;
}

export function BackupModal({ isOpen, onClose, selectedFeatures, onRestore }: BackupModalProps) {
  const { t } = useTranslation();
  const { settings, createBackup, restoreBackup } = useSettings();
  const [backupName, setBackupName] = useState('');

  const handleCreateBackup = () => {
    if (!backupName.trim()) return;
    createBackup(backupName, selectedFeatures);
    setBackupName('');
  };

  const handleRestore = (backupId: string) => {
    const features = restoreBackup(backupId);
    if (features) {
      onRestore(features);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-green-400 mb-4">
            {t('backup.title')}
          </Dialog.Title>

          {/* Yeni Yedek Oluştur */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('backup.create')}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder={t('backup.name')}
                className="flex-1 px-3 py-1 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleCreateBackup}
                disabled={!backupName.trim()}
                className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.save')}
              </button>
            </div>
          </div>

          {/* Yedek Listesi */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {t('backup.restore')}
            </h3>
            {settings.backups.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {t('backup.noBackups')}
              </p>
            ) : (
              <ul className="space-y-2">
                {settings.backups.map((backup) => (
                  <li
                    key={backup.id}
                    className="flex items-center justify-between p-2 bg-gray-700 rounded-md"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {backup.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(backup.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(backup.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        {t('backup.restore')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 