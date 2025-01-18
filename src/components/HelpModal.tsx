import { Dialog } from '@headlessui/react';
import { useSettings } from '../hooks/useSettings';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { settings } = useSettings();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${
          settings.theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900'
        }`}>
          <Dialog.Title className="text-2xl font-bold text-green-400 mb-4">
            Yardım ve İletişim
          </Dialog.Title>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Proje Hakkında</h3>
              <p className={`${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                HtaccessHub, Apache web sunucuları için .htaccess dosyalarını kolayca oluşturmanızı sağlayan açık kaynaklı bir araçtır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">GitHub</h3>
              <p className={`${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Projenin kaynak koduna ulaşmak, hata bildirmek veya katkıda bulunmak için:
                <br />
                <a 
                  href="https://github.com/efeokty/HtaccessHub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-500"
                >
                  github.com/efeokty/HtaccessHub
                </a>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">İletişim</h3>
              <p className={`${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Soru, öneri ve geri bildirimleriniz için:
                <br />
                <a 
                  href="mailto:efeoktay59@gmail.com"
                  className="text-green-400 hover:text-green-500"
                >
                  efeoktay59@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Nasıl Kullanılır?</h3>
              <ol className={`list-decimal list-inside space-y-2 ${
                settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>Sol menüden istediğiniz özellikleri seçin</li>
                <li>Seçtiğiniz özellikler için gerekli parametreleri ayarlayın</li>
                <li>Oluşturulan .htaccess kodunu görüntüleyin</li>
                <li>Kodu kopyalayın veya indirin</li>
              </ol>
            </section>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 