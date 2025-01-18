import { useState, useEffect, Suspense, lazy, useMemo } from 'react'
import { MagnifyingGlassIcon, ClipboardIcon, ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Transition } from '@headlessui/react'
import { FEATURES, CATEGORIES, generateHtaccess } from './features'
import { ErrorBoundary } from './components/ErrorBoundary'
import Prism from 'prismjs'
import { testHtaccess, fixHtaccess } from './utils/htaccessTester'
import { analyzeHtaccess, type AnalysisResults } from './utils/htaccessAnalyzer'
import './styles/prism-custom.css'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { BackupModal } from './components/BackupModal'
import { CustomFeatureModal } from './components/CustomFeatureModal'
import { useSettings } from './hooks/useSettings'
import { useTranslation } from './hooks/useTranslation'

// Prism.js'i lazy loading ile yükleyelim
const PrismHighlight = lazy(() => import('./components/PrismHighlight'))
const PrismDiff = lazy(() => import('./components/PrismDiff'))

// Loading komponenti
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  </div>
)

export default function App() {
  const { settings, updateSettings, removeCustomFeature } = useSettings();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(settings.selectedFeatures || [])
  const [generatedCode, setGeneratedCode] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isViewMode, setIsViewMode] = useState(false)
  const [testResults, setTestResults] = useState<{
    isValid: boolean;
    errors: string[];
    suggestions?: string[];
    conflicts?: {
      rules: string[];
      description: string;
      severity: 'warning' | 'error';
    }[];
    securityIssues?: {
      rule: string;
      risk: string;
      solution: string;
      severity: 'low' | 'medium' | 'high';
    }[];
  } | null>(null);
  const [originalCode, setOriginalCode] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [showCorrections, setShowCorrections] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCustomFeatureModal, setShowCustomFeatureModal] = useState(false);
  const { t } = useTranslation();

  // Tüm özellikleri birleştir (varsayılan + özel)
  const allFeatures = useMemo(() => {
    return [...settings.customFeatures, ...FEATURES];
  }, [settings.customFeatures]);

  // Seçili özellikleri güncelle ve kaydet
  const handleFeatureSelect = (featureId: string) => {
    const newSelected = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
    
    setSelectedFeatures(newSelected);
    updateSettings({ selectedFeatures: newSelected });
  };

  // Filtrelenmiş özellikleri hesapla
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter(feature => {
      const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategories.includes('selected')) {
        return selectedFeatures.includes(feature.id);
      }
      
      const matchesCategory = selectedCategories.length === 0 || 
                          (feature.category && selectedCategories.includes(feature.category));
      
      return matchesSearch && matchesCategory;
    });
  }, [allFeatures, searchQuery, selectedCategories, selectedFeatures]);

  useEffect(() => {
    try {
      const code = generateHtaccess(selectedFeatures)
      const results = testHtaccess(code)
      const analysis = analyzeHtaccess(code)
      setTestResults(results)
      setAnalysisResults(analysis)
      
      if (results.isValid) {
        setGeneratedCode(code)
        setOriginalCode(code)
        setShowDiff(false)
      } else {
        setOriginalCode(code)
        const fixedCode = fixHtaccess(code, results.errors)
        setGeneratedCode(fixedCode)
        setShowDiff(true)
      }
    } catch (error) {
      console.error('Kod oluşturma hatası:', error)
      showNotification('Kod oluşturulurken bir hata oluştu!')
    }
  }, [selectedFeatures])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (category === 'selected') {
        return prev.includes(category) ? [] : [category]
      }
      const newCategories = prev.filter(c => c !== 'selected')
      return newCategories.includes(category)
        ? newCategories.filter(c => c !== category)
        : [...newCategories, category]
    })
  }

  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    showNotification('Kod panoya kopyalandı!')
  }

  const downloadFile = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.htaccess'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification('.htaccess dosyası indirildi!')
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen p-8 ${
        settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-lg' : ''
      } ${
        settings.theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-green-400">HtaccessHub</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomFeatureModal(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('features.addCustom')}
              </button>
              <button
                onClick={() => setShowBackupModal(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('backup.title')}
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('settings.title')}
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('help.title')}
              </button>
              {isViewMode && (
                <button
                  onClick={() => setIsViewMode(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 rotate-90" />
                  {t('features.backToSelection')}
                </button>
              )}
            </div>
          </div>

          {!isViewMode ? (
            <>
              {/* Kategori Seçimi */}
              <div className="mb-8">
                <h2 className={`text-xl font-semibold mb-4 ${
                  settings.theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>Kategoriler</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleCategory(key)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        selectedCategories.includes(key)
                          ? 'bg-green-500 text-white'
                          : settings.theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Arama ve Seçili Özellik Sayısı */}
              <div className="mb-8 flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t('features.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${
                      settings.theme === 'dark'
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-green-500'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-green-600'
                    }`}
                  />
                  <MagnifyingGlassIcon className={`h-5 w-5 absolute right-3 top-2.5 ${
                    settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className={`px-4 py-2 rounded-lg border ${
                  settings.theme === 'dark'
                    ? 'bg-gray-800 text-gray-400 border-gray-700'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}>
                  {t('features.selectedCount', { count: selectedFeatures.length })}
                </div>
                <button
                  onClick={() => {
                    setSelectedFeatures([]);
                    updateSettings({ selectedFeatures: [] });
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('features.clearSelected')}
                </button>
                <button
                  onClick={() => {
                    setIsViewMode(true)
                    Prism.highlightAll()
                  }}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    settings.theme === 'dark'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={selectedFeatures.length === 0}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  {t('features.view')}
                </button>
              </div>

              {/* Özellik Listesi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className={`${
                      settings.theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    } rounded-lg p-4 border hover:border-green-500 transition-colors duration-200 relative`}
                  >
                    {feature.id.startsWith('custom-') && (
                      <button
                        onClick={() => removeCustomFeature(feature.id)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                        title={t('common.delete')}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                    <h3 className="text-lg font-semibold mb-2 text-green-400">{feature.name}</h3>
                    <p className={`mb-4 ${
                      settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{feature.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                      }`}>{CATEGORIES[feature.category as keyof typeof CATEGORIES]}</span>
                      <button
                        onClick={() => handleFeatureSelect(feature.id)}
                        className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                          selectedFeatures.includes(feature.id)
                            ? 'bg-green-500 text-white'
                            : settings.theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedFeatures.includes(feature.id) ? t('features.selected') : t('features.select')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Kod Görüntüleme Alanı */
            <div className="bg-gray-800 rounded-lg shadow-xl animate-fade-in">
              <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-green-400">Oluşturulan .htaccess</h2>
                <div className="flex gap-2">
                  {testResults && !testResults.isValid && (
                    <button
                      onClick={() => setShowCorrections(!showCorrections)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-700 transition-colors duration-200"
                    >
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <span>{showCorrections ? 'İyileştirmeleri gizle' : 'İyileştirmeleri göster'}</span>
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                    Kopyala
                  </button>
                  <button
                    onClick={downloadFile}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    İndir
                  </button>
                </div>
              </div>
              <ErrorBoundary>
                <div className="p-4">
                  {testResults && !testResults.isValid && testResults.suggestions && showCorrections && (
                    <div className="mb-4 p-4 bg-gray-700 rounded-lg space-y-4">
                      <div>
                        <h3 className="text-yellow-400 font-semibold mb-2">Yapılan İyileştirmeler:</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                          {/* Tekrarlanan önerileri tekilleştir */}
                          {(() => {
                            // Benzersiz güvenlik önerileri
                            const uniqueSecurityIssues = new Set(
                              testResults.securityIssues?.map(issue => issue.solution) || []
                            );
                            // Benzersiz sözdizimi önerileri
                            const uniqueSuggestions = new Set(
                              testResults.suggestions.map(suggestion => 
                                suggestion.replace('Önerilen düzeltme: ', 'Düzeltme: ')
                              )
                            );

  return (
    <>
                                {/* Güvenlik düzeltmeleri */}
                                {Array.from(uniqueSecurityIssues).map((solution, index) => (
                                  <li key={`security-${index}`}>
                                    Güvenlik iyileştirmesi: {solution}
                                  </li>
                                ))}
                                {/* Sözdizimi düzeltmeleri */}
                                {Array.from(uniqueSuggestions).map((suggestion, index) => (
                                  <li key={`syntax-${index}`}>
                                    {suggestion}
                                  </li>
                                ))}
                              </>
                            );
                          })()}
                        </ul>
                      </div>

                      {/* Gerekli Apache Modülleri */}
                      {analysisResults && analysisResults.moduleRequirements.size > 0 && (
      <div>
                          <h3 className="text-purple-400 font-semibold mb-2">Gerekli Apache Modülleri</h3>
                          <ul className="list-disc list-inside text-gray-300">
                            {Array.from(analysisResults.moduleRequirements.entries()).map(([module, description], index) => (
                              <li key={index}>
                                <span className="font-semibold">{module}</span>
                                {description && <span className="text-gray-400"> - {description}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Kod Karşılaştırması */}
                      {showDiff && (
                        <div className="mt-4">
                          <h3 className="text-yellow-400 font-semibold mb-2">Yapılan Değişiklikler:</h3>
                          <Suspense fallback={<LoadingSpinner />}>
                            <PrismDiff originalCode={originalCode} newCode={generatedCode} />
                          </Suspense>
                        </div>
                      )}
                    </div>
                  )}
                  <Suspense fallback={<LoadingSpinner />}>
                    <PrismHighlight code={generatedCode || '# Henüz özellik seçilmedi'} />
                  </Suspense>
                </div>
              </ErrorBoundary>
            </div>
          )}
        </div>

        {/* Toast Bildirimi */}
        <div
          aria-live="assertive"
          className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            <Transition
              show={showToast}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="max-w-sm w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
      </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-100">
                        {toastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        {/* Modaller */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
        <BackupModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          selectedFeatures={selectedFeatures}
          onRestore={setSelectedFeatures}
        />
        <CustomFeatureModal
          isOpen={showCustomFeatureModal}
          onClose={() => setShowCustomFeatureModal(false)}
        />
      </div>
    </ErrorBoundary>
  )
}
