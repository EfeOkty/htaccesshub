interface DirectiveTest {
  name: string;
  pattern: RegExp;
  dependencies?: string[];
  description?: string;
}

const apacheDirectiveTests: Record<string, DirectiveTest> = {
  'mod_rewrite': {
    name: 'URL Yönlendirme (mod_rewrite)',
    pattern: /^RewriteRule|^RewriteCond|^RewriteEngine/,
    dependencies: ['mod_rewrite'],
    description: 'URL yönlendirme ve yeniden yazma işlemleri için gerekli'
  },
  'mod_headers': {
    name: 'HTTP Başlıkları (mod_headers)',
    pattern: /^Header\s+/,
    dependencies: ['mod_headers'],
    description: 'HTTP başlıklarını düzenlemek için gerekli'
  },
  'mod_expires': {
    name: 'İçerik Önbellekleme (mod_expires)',
    pattern: /^Expires|^ExpiresByType|^ExpiresDefault/,
    dependencies: ['mod_expires'],
    description: 'Tarayıcı önbellekleme ayarları için gerekli'
  },
  'mod_deflate': {
    name: 'İçerik Sıkıştırma (mod_deflate)',
    pattern: /^(Add|Insert)OutputFilterByType\s+DEFLATE/,
    dependencies: ['mod_deflate'],
    description: 'İçerik sıkıştırma işlemleri için gerekli'
  }
};

export interface AnalysisResults {
  moduleRequirements: Map<string, string>;
}

export function analyzeHtaccess(content: string): AnalysisResults {
  const lines = content.split('\n');
  const results = {
    moduleRequirements: new Map<string, string>() // modül adı -> açıklama
  };

  // Her satır için test
  lines.forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;

    // Her direktif için kontrol
    Object.entries(apacheDirectiveTests).forEach(([key, test]) => {
      if (test.pattern.test(line)) {
        // Modül bilgilerini ekle
        test.dependencies?.forEach(dep => {
          if (!results.moduleRequirements.has(dep)) {
            results.moduleRequirements.set(dep, test.description || '');
          }
        });
      }
    });
  });

  return results;
} 