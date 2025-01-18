type TranslationKeys = {
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    search: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    close: string;
    name: string;
    description: string;
    code: string;
  };
  features: {
    title: string;
    selected: string;
    select: string;
    categories: string;
    search: string;
    selectedCount: string;
    view: string;
    addCustom: string;
    favorite: string;
    unfavorite: string;
    backToSelection: string;
    clearSelected: string;
  };
  settings: {
    title: string;
    theme: {
      title: string;
      light: string;
      dark: string;
    };
    language: {
      title: string;
      tr: string;
      en: string;
    };
    fontSize: {
      title: string;
      small: string;
      medium: string;
      large: string;
    };
  };
  backup: {
    title: string;
    create: string;
    restore: string;
    delete: string;
    name: string;
    date: string;
    noBackups: string;
  };
  help: {
    title: string;
    documentation: string;
    about: string;
    contact: string;
  };
};

export const translations: Record<'tr' | 'en', TranslationKeys> = {
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      add: 'Ekle',
      search: 'Ara',
      loading: 'Yükleniyor...',
      success: 'Başarılı',
      error: 'Hata',
      warning: 'Uyarı',
      info: 'Bilgi',
      yes: 'Evet',
      no: 'Hayır',
      close: 'Kapat',
      name: 'İsim',
      description: 'Açıklama',
      code: 'Kod'
    },
    features: {
      title: 'Özellikler',
      selected: 'Seçili',
      select: 'Seç',
      categories: 'Kategoriler',
      search: 'Özellik ara...',
      selectedCount: '{count} özellik seçildi',
      view: 'Görüntüle',
      addCustom: 'Özel Özellik Ekle',
      favorite: 'Favorilere Ekle',
      unfavorite: 'Favorilerden Çıkar',
      backToSelection: 'Seçim Menüsüne Dön',
      clearSelected: 'Seçilenleri Temizle'
    },
    settings: {
      title: 'Ayarlar',
      theme: {
        title: 'Tema',
        light: 'Açık',
        dark: 'Koyu'
      },
      language: {
        title: 'Dil',
        tr: 'Türkçe',
        en: 'English'
      },
      fontSize: {
        title: 'Yazı Boyutu',
        small: 'Küçük',
        medium: 'Orta',
        large: 'Büyük'
      }
    },
    backup: {
      title: 'Yedekleme',
      create: 'Yedek Oluştur',
      restore: 'Yedeği Geri Yükle',
      delete: 'Yedeği Sil',
      name: 'Yedek Adı',
      date: 'Tarih',
      noBackups: 'Henüz yedek oluşturulmamış'
    },
    help: {
      title: 'Yardım',
      documentation: 'Dokümantasyon',
      about: 'Hakkında',
      contact: 'İletişim'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      name: 'Name',
      description: 'Description',
      code: 'Code'
    },
    features: {
      title: 'Features',
      selected: 'Selected',
      select: 'Select',
      categories: 'Categories',
      search: 'Search features...',
      selectedCount: '{count} features selected',
      view: 'View',
      addCustom: 'Add Custom Feature',
      favorite: 'Add to Favorites',
      unfavorite: 'Remove from Favorites',
      backToSelection: 'Back to Selection Menu',
      clearSelected: 'Clear Selected'
    },
    settings: {
      title: 'Settings',
      theme: {
        title: 'Theme',
        light: 'Light',
        dark: 'Dark'
      },
      language: {
        title: 'Language',
        tr: 'Turkish',
        en: 'English'
      },
      fontSize: {
        title: 'Font Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large'
      }
    },
    backup: {
      title: 'Backup',
      create: 'Create Backup',
      restore: 'Restore Backup',
      delete: 'Delete Backup',
      name: 'Backup Name',
      date: 'Date',
      noBackups: 'No backups created yet'
    },
    help: {
      title: 'Help',
      documentation: 'Documentation',
      about: 'About',
      contact: 'Contact'
    }
  }
}; 