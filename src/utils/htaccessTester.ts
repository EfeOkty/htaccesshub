interface TestResult {
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
}

interface ValidationRule {
  pattern: RegExp;
  message: string;
  fix?: (line: string) => string;
  conflictsWith?: string[];
  securityRisk?: {
    risk: string;
    solution: string;
    severity: 'low' | 'medium' | 'high';
  };
}

const validationRules: Record<string, ValidationRule> = {
  'RewriteRule': {
    pattern: /^RewriteRule\s+(\S+)\s+(\S+)(\s+\[.*\])?$/,
    message: 'RewriteRule sözdizimi hatalı. Doğru format: RewriteRule Pattern Substitution [Flags]',
    fix: (line: string) => {
      // Temel düzeltmeler
      let fixed = line.replace(/rewriterule/i, 'RewriteRule');
      // Eksik boşlukları düzelt
      fixed = fixed.replace(/RewriteRule(\S)/, 'RewriteRule $1');
      return fixed;
    }
  },
  'RewriteCond': {
    pattern: /^RewriteCond\s+%\{[^\}]+\}\s+(\S+)(\s+\[.*\])?$/,
    message: 'RewriteCond sözdizimi hatalı. Doğru format: RewriteCond TestString CondPattern [Flags]',
    fix: (line: string) => {
      let fixed = line.replace(/rewritecond/i, 'RewriteCond');
      fixed = fixed.replace(/RewriteCond(\S)/, 'RewriteCond $1');
      return fixed;
    }
  },
  'Header': {
    pattern: /^Header\s+(set|append|add|unset)\s+[\w-]+\s+"[^"]*"$/,
    message: 'Header sözdizimi hatalı. Doğru format: Header [directive] name value',
    fix: (line: string) => {
      let fixed = line.replace(/header/i, 'Header');
      // Eksik tırnak işaretlerini ekle
      if (!line.match(/"[^"]*"$/)) {
        fixed = fixed.replace(/(\S+)$/, '"$1"');
      }
      return fixed;
    },
    securityRisk: {
      risk: 'Güvenlik başlıkları eksik olabilir',
      solution: 'X-Frame-Options, X-XSS-Protection gibi güvenlik başlıklarını ekleyin',
      severity: 'medium'
    }
  },
  'RedirectMatch': {
    pattern: /^RedirectMatch\s+\d{3}\s+(\S+)\s+(\S+)$/,
    message: 'RedirectMatch sözdizimi hatalı. Doğru format: RedirectMatch status-code regex URL',
    fix: (line: string) => line.replace(/redirectmatch/i, 'RedirectMatch'),
    conflictsWith: ['RewriteRule']
  }
};

const securityChecks = {
  'directory-listing': {
    pattern: /Options.*Indexes/i,
    risk: 'Dizin listeleme aktif',
    solution: 'Options -Indexes kullanarak dizin listelemeyi devre dışı bırakın',
    severity: 'high' as const
  },
  'server-signature': {
    pattern: /ServerSignature\s+On/i,
    risk: 'Sunucu bilgileri görünür durumda',
    solution: 'ServerSignature Off kullanarak sunucu bilgilerini gizleyin',
    severity: 'medium' as const
  }
};

export function testHtaccess(content: string): TestResult {
  const result: TestResult = {
    isValid: true,
    errors: [],
    suggestions: [],
    conflicts: [],
    securityIssues: []
  };

  if (!content.trim()) {
    result.isValid = false;
    result.errors.push('Htaccess dosyası boş olamaz.');
    return result;
  }

  const lines = content.split('\n');
  const activeRules = new Set<string>();

  lines.forEach((line, index) => {
    if (line.trim().startsWith('#')) return;

    // Her kural için kontrol
    Object.entries(validationRules).forEach(([ruleName, rule]) => {
      if (line.toLowerCase().includes(ruleName.toLowerCase())) {
        // Sözdizimi kontrolü
        if (!rule.pattern.test(line)) {
          result.isValid = false;
          result.errors.push(`Satır ${index + 1}: ${rule.message}`);
          if (rule.fix) {
            const fixed = rule.fix(line);
            result.suggestions?.push(`Önerilen düzeltme: ${fixed}`);
          }
        }

        // Çakışma kontrolü
        activeRules.add(ruleName);
        if (rule.conflictsWith) {
          rule.conflictsWith.forEach(conflictRule => {
            if (activeRules.has(conflictRule)) {
              result.conflicts?.push({
                rules: [ruleName, conflictRule],
                description: `${ruleName} ve ${conflictRule} kuralları birbiriyle çakışabilir.`,
                severity: 'warning'
              });
            }
          });
        }

        // Güvenlik kontrolü
        if (rule.securityRisk) {
          result.securityIssues?.push({
            rule: line,
            ...rule.securityRisk
          });
        }
      }
    });

    // Genel güvenlik kontrolleri
    Object.entries(securityChecks).forEach(([checkName, check]) => {
      // Eğer güvenlik özelliği zaten varsa kontrol etme
      const hasFeature = lines.some(l => {
        if (checkName === 'directory-listing' && l.includes('Options -Indexes')) return true;
        if (checkName === 'server-signature' && l.includes('ServerSignature Off')) return true;
        return false;
      });

      if (!hasFeature && check.pattern.test(line)) {
        result.securityIssues?.push({
          rule: line,
          risk: check.risk,
          solution: check.solution,
          severity: check.severity
        });
      }
    });

    // Header kontrolleri için de aynı mantık
    if (line.toLowerCase().includes('header')) {
      const hasSecurityHeaders = lines.some(l => 
        l.includes('X-Frame-Options') || 
        l.includes('X-XSS-Protection') ||
        l.includes('X-Content-Type-Options')
      );

      if (!hasSecurityHeaders) {
        result.securityIssues?.push({
          rule: line,
          risk: 'Güvenlik başlıkları eksik olabilir',
          solution: 'X-Frame-Options, X-XSS-Protection gibi güvenlik başlıklarını ekleyin',
          severity: 'medium'
        });
      }
    }
  });

  return result;
}

export function fixHtaccess(content: string, errors: string[]): string {
  let fixedContent = content;
  const lines = fixedContent.split('\n');
  const fixedLines = lines.map(line => {
    let newLine = line;

    // Her kural için düzeltme uygula
    Object.entries(validationRules).forEach(([ruleName, rule]) => {
      if (line.toLowerCase().includes(ruleName.toLowerCase()) && rule.fix) {
        newLine = rule.fix(newLine);
      }
    });

    return newLine;
  });

  // Güvenlik düzeltmeleri
  if (!fixedLines.some(line => line.includes('ServerSignature Off'))) {
    fixedLines.push('ServerSignature Off');
  }
  if (!fixedLines.some(line => line.includes('Options -Indexes'))) {
    fixedLines.push('Options -Indexes');
  }

  return fixedLines.join('\n');
} 