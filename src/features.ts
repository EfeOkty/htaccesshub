export type Feature = {
  id: string;
  name: string;
  description: string;
  code: string;
  category: keyof typeof CATEGORIES;
  parameters?: Array<{
    name: string;
    description: string;
    default?: string;
  }>;
};

// Kategori sıralama öncelikleri için tip tanımı
type CategoryPriority = Exclude<keyof typeof CATEGORIES, 'selected'>;

export const CATEGORIES = {
  urlRewriting: 'URL Yönlendirme',
  security: 'Güvenlik',
  performance: 'Performans',
  errorPages: 'Hata Sayfaları',
  caching: 'Önbellek',
  compression: 'Sıkıştırma',
  headers: 'HTTP Başlıkları',
  seo: 'SEO',
  auth: 'Kimlik Doğrulama',
  mediaHandling: 'Medya İşleme',
  monitoring: 'İzleme ve Loglama',
  spam: 'Spam Koruması',
  ssl: 'SSL/TLS Yapılandırması',
  proxy: 'Proxy ve Yük Dengeleme',
  development: 'Geliştirme Araçları',
  misc: 'Diğer',
  selected: 'Seçili Özellikler'
} as const;

export const CATEGORY_PRIORITIES: Record<CategoryPriority, number> = {
  security: 1,        // Güvenlik kuralları en üstte olmalı
  ssl: 2,            // SSL ayarları güvenlikten hemen sonra
  auth: 3,           // Kimlik doğrulama üst sıralarda olmalı
  urlRewriting: 4,   // URL yönlendirmeleri erken uygulanmalı
  proxy: 5,          // Proxy kuralları erken uygulanmalı
  headers: 6,        // HTTP başlıkları erken set edilmeli
  performance: 7,    // Performans ayarları
  compression: 8,    // Sıkıştırma ayarları
  caching: 9,        // Önbellek ayarları
  mediaHandling: 10, // Medya işleme kuralları
  seo: 11,          // SEO kuralları
  spam: 12,         // Spam koruması
  monitoring: 13,    // İzleme ve loglama
  errorPages: 14,    // Hata sayfaları
  development: 15,   // Geliştirme araçları
  misc: 16          // Diğer kurallar en sonda
};

// Özellik sıralama fonksiyonu
export function sortFeaturesByPriority(features: Feature[]): Feature[] {
  // Önce tüm özellikleri kategori önceliğine göre sırala
  const sortedFeatures = [...features].sort((a, b) => {
    const priorityA = CATEGORY_PRIORITIES[a.category as CategoryPriority] || 999;
    const priorityB = CATEGORY_PRIORITIES[b.category as CategoryPriority] || 999;
    return priorityA - priorityB;
  });

  // RewriteEngine On'u içeren özellikleri en başa al
  const rewriteFeatures = sortedFeatures.filter(f => f.code.includes('RewriteEngine On'));
  const otherFeatures = sortedFeatures.filter(f => !f.code.includes('RewriteEngine On'));

  return [...rewriteFeatures, ...otherFeatures];
}

// Seçili özellikleri öncelik sırasına göre sırala
export function getSelectedFeaturesSorted(selectedFeatureIds: string[]): Feature[] {
  // Seçili özellikleri bul
  const selectedFeatures = FEATURES.filter(feature => 
    selectedFeatureIds.includes(feature.id)
  );
  
  // Öncelik sırasına göre sırala
  return sortFeaturesByPriority(selectedFeatures);
}

// .htaccess oluşturma fonksiyonu
export function generateHtaccess(selectedFeatureIds: string[]): string {
  try {
    const selectedFeatures = FEATURES.filter(feature => selectedFeatureIds.includes(feature.id))
    
    if (!selectedFeatures.length) {
      return '# Henüz özellik seçilmedi'
    }

    let output = ''

    // Her zaman en başa ekle
    output += '# HtaccessHub tarafından oluşturuldu\n'
    output += 'RewriteEngine On\n\n'

    // Özellikleri kategoriye göre sırala
    const sortedFeatures = sortFeaturesByPriority(selectedFeatures)

    // Önceki RewriteEngine On satırlarını kaldır
    for (const feature of sortedFeatures) {
      if (!feature.code) {
        throw new Error(`${feature.name} için kod tanımlanmamış.`)
      }

      output += `# ${feature.name}\n`
      output += `# ${feature.description}\n`
      // RewriteEngine On satırını atla
      output += `${feature.code.replace(/RewriteEngine\s+On\n?/g, '')}\n\n`
    }

    return output.trim()
  } catch (error) {
    console.error('Htaccess oluşturma hatası:', error)
    throw new Error('Htaccess dosyası oluşturulurken bir hata oluştu.')
  }
}

export const FEATURES: Feature[] = [
  {
    id: 'hide-php',
    name: 'PHP Uzantılarını Gizle',
    description: '.php uzantılarını URL\'den gizler',
    code: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^(.*)$ $1.php [L]`,
    category: 'urlRewriting'
  },
  {
    id: 'force-https',
    name: 'HTTPS\'e Yönlendir',
    description: 'Tüm HTTP trafiğini HTTPS\'e yönlendirir',
    code: `RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]`,
    category: 'security'
  },
  {
    id: 'password-protect',
    name: 'Dizin Şifre Koruması',
    description: 'Belirli bir dizini şifre ile korur',
    code: `AuthType Basic
AuthName "Restricted Area"
AuthUserFile /path/to/.htpasswd
Require valid-user`,
    category: 'auth',
    parameters: [
      {
        name: 'authName',
        description: 'Şifre sorulduğunda gösterilecek mesaj',
        default: 'Restricted Area'
      }
    ]
  },
  {
    id: 'block-country',
    name: 'Ülke Bazlı Engelleme',
    description: 'Belirli ülkelerden erişimi engeller',
    code: `SetEnvIf GEOIP_COUNTRY_CODE "TR" AllowCountry
Deny from all
Allow from env=AllowCountry`,
    category: 'security',
    parameters: [
      {
        name: 'countries',
        description: 'İzin verilecek ülke kodları (TR,US gibi)',
        default: 'TR'
      }
    ]
  },
  {
    id: 'custom-mime',
    name: 'Özel MIME Türleri',
    description: 'Özel dosya türleri için MIME type tanımlar',
    code: `AddType application/x-web-app-manifest+json .webmanifest
AddType text/cache-manifest .appcache
AddType image/x-icon .ico
AddType image/svg+xml .svg`,
    category: 'misc'
  },
  {
    id: 'compress-fonts',
    name: 'Font Sıkıştırma',
    description: 'Web fontlarını sıkıştırır',
    code: `<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE application/x-font-ttf application/x-font-opentype image/svg+xml
</IfModule>`,
    category: 'compression'
  },
  {
    id: 'cache-images',
    name: 'Resim Önbelleği',
    description: 'Resim dosyaları için agresif önbellekleme',
    code: `<FilesMatch "\\.(jpg|jpeg|png|gif|webp)$">
Header set Cache-Control "max-age=31536000, public"
</FilesMatch>`,
    category: 'caching'
  },
  {
    id: 'disable-directory-listing',
    name: 'Dizin Listelemesini Kapat',
    description: 'Dizin içeriğinin görüntülenmesini engeller',
    code: `Options -Indexes`,
    category: 'security'
  },
  {
    id: 'block-bad-bots',
    name: 'Kötü Botları Engelle',
    description: 'Zararlı botları engeller',
    code: `RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} ^BlackWidow [OR]
RewriteCond %{HTTP_USER_AGENT} ^Bot\\ mailto:craftbot@yahoo.com [OR]
RewriteCond %{HTTP_USER_AGENT} ^ChinaClaw [OR]
RewriteCond %{HTTP_USER_AGENT} ^Custo [OR]
RewriteCond %{HTTP_USER_AGENT} ^DISCo [OR]
RewriteCond %{HTTP_USER_AGENT} ^Download\\ Demon [OR]
RewriteCond %{HTTP_USER_AGENT} ^eCatch [OR]
RewriteCond %{HTTP_USER_AGENT} ^EirGrabber
RewriteRule ^.* - [F,L]`,
    category: 'security'
  },
  {
    id: 'canonical-url',
    name: 'Canonical URL Yönlendirmesi',
    description: 'www ve www olmayan URL\'leri yönlendirir',
    code: `RewriteEngine On
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^(.*)$ http://www.%{HTTP_HOST}/$1 [R=301,L]`,
    category: 'seo'
  },
  {
    id: 'security-headers',
    name: 'Güvenlik Başlıkları',
    description: 'Temel güvenlik başlıklarını ekler',
    code: `<IfModule mod_headers.c>
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>`,
    category: 'headers'
  },
  {
    id: 'error-pages',
    name: 'Özel Hata Sayfaları',
    description: 'Özel hata sayfalarını tanımlar',
    code: `ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
ErrorDocument 403 /403.html`,
    category: 'errorPages'
  },
  {
    id: 'remove-html-extension',
    name: 'HTML Uzantılarını Gizle',
    description: '.html uzantılarını URL\'den gizler',
    code: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]`,
    category: 'urlRewriting'
  },
  {
    id: 'remove-aspx-extension',
    name: 'ASPX Uzantılarını Gizle',
    description: '.aspx uzantılarını URL\'den gizler',
    code: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.aspx -f
RewriteRule ^(.*)$ $1.aspx [L]`,
    category: 'urlRewriting'
  },
  {
    id: 'clean-urls',
    name: 'Temiz URL Yapısı',
    description: 'URL\'leri temiz bir yapıya dönüştürür',
    code: `RewriteEngine On
RewriteRule ^page/([^/]+)/?$ /index.php?page=$1 [L,QSA]
RewriteRule ^category/([^/]+)/?$ /index.php?category=$1 [L,QSA]
RewriteRule ^post/([^/]+)/?$ /index.php?post=$1 [L,QSA]`,
    category: 'urlRewriting'
  },
  {
    id: 'language-based-redirect',
    name: 'Dil Bazlı Yönlendirme',
    description: 'Kullanıcıları tarayıcı diline göre yönlendirir',
    code: `RewriteEngine On
RewriteCond %{HTTP:Accept-Language} ^tr [NC]
RewriteRule ^$ /tr/ [L,R=301]
RewriteCond %{HTTP:Accept-Language} ^en [NC]
RewriteRule ^$ /en/ [L,R=301]`,
    category: 'urlRewriting'
  },
  {
    id: 'mobile-redirect',
    name: 'Mobil Site Yönlendirme',
    description: 'Mobil kullanıcıları mobil siteye yönlendirir',
    code: `RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} "android|blackberry|ipad|iphone|ipod|iemobile|opera mobile|palmos|webos|googlebot-mobile" [NC]
RewriteRule ^$ /mobile/ [L,R=302]`,
    category: 'urlRewriting'
  },
  {
    id: 'block-sql-injection',
    name: 'SQL Injection Koruması',
    description: 'SQL injection saldırılarını engeller',
    code: `RewriteCond %{QUERY_STRING} [\\\'\\"%27][\\-][\\+] [NC,OR]
RewriteCond %{QUERY_STRING} \\.\\./ [NC,OR]
RewriteCond %{QUERY_STRING} xp_cmdshell [NC]
RewriteRule ^(.*)$ - [F]`,
    category: 'security'
  },
  {
    id: 'protect-wp-config',
    name: 'WordPress Config Koruması',
    description: 'wp-config.php dosyasına erişimi engeller',
    code: `<Files wp-config.php>
Order allow,deny
Deny from all
</Files>`,
    category: 'security'
  },
  {
    id: 'block-sensitive-files',
    name: 'Hassas Dosyaları Koru',
    description: 'Hassas dosyalara erişimi engeller',
    code: `<FilesMatch "^(wp-config\\.php|php\\.ini|\\.htaccess|\\.env|\\.git|\\.svn)">
Order allow,deny
Deny from all
</FilesMatch>`,
    category: 'security'
  },
  {
    id: 'gzip-compression',
    name: 'GZIP Sıkıştırma',
    description: 'Tüm çıktıları GZIP ile sıkıştırır',
    code: `<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript
</IfModule>`,
    category: 'performance'
  },
  {
    id: 'browser-caching',
    name: 'Tarayıcı Önbelleği',
    description: 'Tarayıcı önbelleğini optimize eder',
    code: `<IfModule mod_expires.c>
ExpiresActive On
ExpiresDefault "access plus 1 month"
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
</IfModule>`,
    category: 'performance'
  },
  {
    id: 'xml-sitemap-redirect',
    name: 'XML Sitemap Yönlendirme',
    description: 'XML sitemap dosyalarını yönlendirir',
    code: `RewriteRule ^sitemap\\.xml$ /sitemap_index.xml [L]
RewriteRule ^sitemap-([0-9]+)\\.xml$ /sitemap.php?page=$1 [L]`,
    category: 'seo'
  },
  {
    id: 'trailing-slash',
    name: 'URL Sonunda Slash',
    description: 'URL sonuna slash ekler',
    code: `RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.*[^/])$ $1/ [L,R=301]`,
    category: 'seo'
  },
  {
    id: 'webp-support',
    name: 'WebP Desteği',
    description: 'WebP formatı için destek ekler',
    code: `AddType image/webp .webp
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_ACCEPT} image/webp
  RewriteCond %{REQUEST_FILENAME} (.*)\.(jpe?g|png)$
  RewriteCond %{REQUEST_FILENAME}.webp -f
  RewriteRule (.+)\\.(jpe?g|png)$ $1.webp [T=image/webp,E=accept:1]
</IfModule>`,
    category: 'mediaHandling'
  },
  {
    id: 'svg-handling',
    name: 'SVG Dosya İşleme',
    description: 'SVG dosyaları için güvenlik ve önbellek ayarları',
    code: `<FilesMatch "\\.svg$">
AddType image/svg+xml .svg
Header set Content-Security-Policy "default-src 'self' 'unsafe-inline'"
Header set Cache-Control "max-age=31536000, public"
</FilesMatch>`,
    category: 'mediaHandling'
  },
  {
    id: 'pdf-handling',
    name: 'PDF Dosya İşleme',
    description: 'PDF dosyaları için güvenlik ve önbellek ayarları',
    code: `<FilesMatch "\\.pdf$">
AddType application/pdf .pdf
Header set Content-Security-Policy "default-src 'self'"
Header set Cache-Control "max-age=2592000, public"
</FilesMatch>`,
    category: 'mediaHandling'
  },
  {
    id: 'detailed-logging',
    name: 'Detaylı Loglama',
    description: 'Detaylı erişim logları tutar',
    code: `LogFormat "%h %l %u %t \\\"%r\\\" %>s %b \\\"%{Referer}i\\\" \\\"%{User-Agent}i\\\" %T %D" detailed
CustomLog logs/access.log detailed`,
    category: 'monitoring'
  },
  {
    id: 'error-logging',
    name: 'Hata Logları',
    description: 'Detaylı hata logları tutar',
    code: `ErrorLog logs/error.log
LogLevel warn`,
    category: 'monitoring'
  },
  {
    id: 'php-error-logging',
    name: 'PHP Hata Logları',
    description: 'PHP hatalarını ayrı dosyaya loglar',
    code: `php_flag log_errors on
php_value error_log /path/to/php_errors.log`,
    category: 'monitoring'
  },
  {
    id: 'comment-spam',
    name: 'Yorum Spam Koruması',
    description: 'Yorum spam botlarını engeller',
    code: `RewriteCond %{REQUEST_METHOD} POST
RewriteCond %{REQUEST_URI} .*/comments/.*
RewriteCond %{HTTP_USER_AGENT} ^$ [OR]
RewriteCond %{HTTP_REFERER} !^http(s)?://(.*)?yourdomain.com [NC]
RewriteRule .* - [F]`,
    category: 'spam'
  },
  {
    id: 'form-spam',
    name: 'Form Spam Koruması',
    description: 'Form spam botlarını engeller',
    code: `RewriteCond %{REQUEST_METHOD} POST
RewriteCond %{REQUEST_URI} .*/(contact|register|signup)/.*
RewriteCond %{HTTP_REFERER} !^http(s)?://(.*)?yourdomain.com [NC]
RewriteRule .* - [F]`,
    category: 'spam'
  },
  {
    id: 'hsts',
    name: 'HSTS Başlığı',
    description: 'HTTP Strict Transport Security başlığı ekler',
    code: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
    category: 'ssl'
  },
  {
    id: 'ssl-cipher-suite',
    name: 'SSL Şifreleme Ayarları',
    description: 'Güvenli SSL şifreleme ayarları',
    code: `SSLCipherSuite EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH
SSLProtocol All -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
SSLHonorCipherOrder On`,
    category: 'ssl'
  },
  {
    id: 'reverse-proxy',
    name: 'Ters Proxy',
    description: 'Belirli istekleri başka bir sunucuya yönlendirir',
    code: `ProxyPass /api http://backend-server:8080/api
ProxyPassReverse /api http://backend-server:8080/api`,
    category: 'proxy',
    parameters: [{
      name: 'backendUrl',
      description: 'Backend sunucu adresi',
      default: 'http://localhost:8080'
    }]
  },
  {
    id: 'load-balancer',
    name: 'Yük Dengeleme',
    description: 'İstekleri birden fazla sunucu arasında dağıtır',
    code: `<Proxy balancer://mycluster>
    BalancerMember http://server1:8080
    BalancerMember http://server2:8080
    ProxySet lbmethod=byrequests
</Proxy>
ProxyPass / balancer://mycluster/`,
    category: 'proxy'
  },
  {
    id: 'dev-cors',
    name: 'CORS - Geliştirme',
    description: 'Geliştirme ortamı için CORS ayarları',
    code: `Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"`,
    category: 'development'
  },
  {
    id: 'dev-php',
    name: 'PHP Geliştirici Modu',
    description: 'PHP geliştirici modunu aktifleştirir',
    code: `php_flag display_errors on
php_value error_reporting E_ALL
php_flag display_startup_errors on`,
    category: 'development'
  },
  {
    id: 'dev-headers',
    name: 'Geliştirici Başlıkları',
    description: 'Geliştirme için yararlı HTTP başlıkları ekler',
    code: `Header set X-Debug-Mode "enabled"
Header set X-Developer-Mode "true"
Header set X-Frame-Options "SAMEORIGIN"`,
    category: 'development'
  },
  {
    id: 'browser-cache',
    name: 'Tarayıcı Önbelleği',
    description: 'Statik dosyalar için tarayıcı önbelleğini yapılandırır',
    code: `<FilesMatch "\\.(ico|pdf|jpg|jpeg|png|gif|js|css|swf)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>`,
    category: 'caching'
  },
  {
    id: 'etag-config',
    name: 'ETag Yapılandırması',
    description: 'ETag başlıklarını yapılandırır',
    code: `FileETag MTime Size
Header unset ETag
Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
Header set Pragma "no-cache"
Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"`,
    category: 'caching'
  },
  {
    id: 'mod-pagespeed',
    name: 'PageSpeed Optimizasyonu',
    description: 'Google PageSpeed modülü optimizasyonları',
    code: `ModPagespeed on
ModPagespeedEnableFilters combine_css,combine_javascript
ModPagespeedEnableFilters defer_javascript
ModPagespeedEnableFilters lazyload_images`,
    category: 'performance'
  },
  {
    id: 'keepalive-timeout',
    name: 'KeepAlive Zaman Aşımı',
    description: 'KeepAlive bağlantı zaman aşımını ayarlar',
    code: `KeepAlive On
KeepAliveTimeout 5
MaxKeepAliveRequests 100`,
    category: 'performance'
  },
  {
    id: 'gzip-static',
    name: 'Statik GZIP',
    description: 'Önceden sıkıştırılmış statik dosyaları sunar',
    code: `<IfModule mod_gzip.c>
    mod_gzip_on Yes
    mod_gzip_dechunk Yes
    mod_gzip_item_include file \\.(html?|txt|css|js|php|pl)$
    mod_gzip_item_include handler ^cgi-script$
    mod_gzip_item_include mime ^text/.*
    mod_gzip_item_include mime ^application/x-javascript.*
    mod_gzip_item_exclude mime ^image/.*
    mod_gzip_item_exclude rspheader ^Content-Encoding:.*gzip.*
</IfModule>`,
    category: 'compression'
  },
  {
    id: 'canonical-urls',
    name: 'Canonical URL Yönlendirmesi',
    description: 'Duplicate içeriği önlemek için canonical URL yönlendirmesi',
    code: `RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]`,
    category: 'seo'
  },
  {
    id: 'xml-sitemap',
    name: 'XML Sitemap Yönlendirmesi',
    description: 'XML sitemap dosyasına erişim yapılandırması',
    code: `<Files "sitemap.xml">
    Header set X-Robots-Tag "noindex"
    Header set Content-Type "application/xml"
</Files>`,
    category: 'seo'
  },
  {
    id: 'robots-txt',
    name: 'Robots.txt Yapılandırması',
    description: 'Robots.txt dosyası için özel yapılandırma',
    code: `<Files "robots.txt">
    Header set Content-Type "text/plain"
    Header set X-Robots-Tag "noindex"
</Files>`,
    category: 'seo'
  },
  {
    id: 'xss-protection',
    name: 'XSS Koruması',
    description: 'Cross-site scripting (XSS) saldırılarına karşı koruma',
    code: `Header set X-XSS-Protection "1; mode=block"
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"`,
    category: 'security'
  },
  {
    id: 'clickjacking',
    name: 'Clickjacking Koruması',
    description: 'Clickjacking saldırılarına karşı koruma',
    code: `Header always append X-Frame-Options SAMEORIGIN
Header set Content-Security-Policy "frame-ancestors 'self'"`,
    category: 'security'
  },
  {
    id: 'mime-sniffing',
    name: 'MIME Sniffing Koruması',
    description: 'MIME type sniffing saldırılarına karşı koruma',
    code: `Header set X-Content-Type-Options "nosniff"`,
    category: 'security'
  },
  {
    id: 'custom-404',
    name: 'Özel 404 Sayfası',
    description: 'Özelleştirilmiş 404 hata sayfası yapılandırması',
    code: `ErrorDocument 404 /404.html
<Files "404.html">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</Files>`,
    category: 'errorPages'
  },
  {
    id: 'custom-500',
    name: 'Özel 500 Sayfası',
    description: 'Özelleştirilmiş 500 sunucu hatası sayfası',
    code: `ErrorDocument 500 /500.html
<Files "500.html">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</Files>`,
    category: 'errorPages'
  },
  {
    id: 'maintenance-mode',
    name: 'Bakım Modu',
    description: 'Site bakım modu yapılandırması',
    code: `RewriteEngine On
RewriteCond %{REMOTE_ADDR} !^123\\.123\\.123\\.123
RewriteCond %{REQUEST_URI} !^/maintenance\\.html$
RewriteRule ^(.*)$ /maintenance.html [R=503,L]
ErrorDocument 503 /maintenance.html`,
    category: 'errorPages',
    parameters: [{
      name: 'allowedIp',
      description: 'Bakım modunda erişime izin verilen IP adresi',
      default: '127.0.0.1'
    }]
  },
  {
    id: 'security-headers2',
    name: 'Güvenlik Başlıkları',
    description: 'Temel güvenlik HTTP başlıkları',
    code: `Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"`,
    category: 'headers'
  },
  {
    id: 'cors-headers',
    name: 'CORS Başlıkları',
    description: 'Cross-Origin Resource Sharing başlıkları',
    code: `Header set Access-Control-Allow-Origin "https://example.com"
Header set Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
Header set Access-Control-Allow-Credentials "true"`,
    category: 'headers',
    parameters: [{
      name: 'allowedOrigin',
      description: 'İzin verilen origin',
      default: 'https://example.com'
    }]
  },
  {
    id: 'cache-headers',
    name: 'Önbellek Başlıkları',
    description: 'Önbellek kontrol başlıkları',
    code: `Header set Cache-Control "public, max-age=31536000"
Header set Expires "access plus 1 year"
Header unset ETag
FileETag None`,
    category: 'headers'
  },
  {
    id: 'file-upload-security',
    name: 'Dosya Yükleme Güvenliği',
    description: 'Dosya yüklemelerini güvenli hale getirir',
    code: `<FilesMatch "\\.(php|pl|py|jsp|asp|htm|shtml|sh|cgi)$">
    SetHandler None
    ForceType text/plain
    Header set Content-Disposition "attachment"
</FilesMatch>
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
php_value max_input_time 300`,
    category: 'security',
    parameters: [{
      name: 'maxFileSize',
      description: 'Maksimum dosya boyutu (MB)',
      default: '10'
    }]
  },
  {
    id: 'ip-rate-limit',
    name: 'IP Bazlı Hız Sınırı',
    description: 'IP başına istek sayısını sınırlar',
    code: `<IfModule mod_ratelimit.c>
    <Location />
        SetOutputFilter RATE_LIMIT
        SetEnv rate-limit 400
    </Location>
</IfModule>
<IfModule mod_evasive20.c>
    DOSHashTableSize 3097
    DOSPageCount 2
    DOSSiteCount 50
    DOSPageInterval 1
    DOSSiteInterval 1
    DOSBlockingPeriod 10
</IfModule>`,
    category: 'security'
  },
  {
    id: 'hide-server-info',
    name: 'Sunucu Bilgilerini Gizle',
    description: 'Apache ve PHP sürüm bilgilerini gizler',
    code: `ServerSignature Off
ServerTokens Prod
Header unset Server
Header unset X-Powered-By
php_flag expose_php Off`,
    category: 'security'
  },
  {
    id: 'wp-admin-security',
    name: 'WordPress Admin Güvenliği',
    description: 'WordPress yönetici panelini korur',
    code: `<Files wp-login.php>
    AuthType Basic
    AuthName "Restricted Access"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
    
    Order Deny,Allow
    Deny from all
    Allow from 127.0.0.1
    
    # Brute Force koruması
    LimitRequestBody 10240000
    SetEnvIf X-Forwarded-For "^.*\\..*\\..*\\..*" DenyAccess
    SetEnvIf Via "^.*\\..*\\..*\\..*" DenyAccess
    Order Allow,Deny
    Allow from all
    Deny from env=DenyAccess
</Files>`,
    category: 'security',
    parameters: [{
      name: 'allowedIp',
      description: 'İzin verilen IP adresi',
      default: '127.0.0.1'
    }]
  },
  {
    id: 'hotlink-protection',
    name: 'Hotlink Koruması',
    description: 'Resim ve dosyaların başka sitelerden kullanımını engeller',
    code: `RewriteEngine on
RewriteCond %{HTTP_REFERER} !^$
RewriteCond %{HTTP_REFERER} !^http(s)?://(www\\.)?yourdomain.com [NC]
RewriteRule \\.(jpg|jpeg|png|gif|webp)$ - [NC,F,L]`,
    category: 'security',
    parameters: [{
      name: 'domain',
      description: 'Korunacak domain adı',
      default: 'yourdomain.com'
    }]
  },
  {
    id: 'php-hardening',
    name: 'PHP Güvenlik Sıkılaştırması',
    description: 'PHP güvenlik ayarlarını sıkılaştırır',
    code: `php_flag register_globals off
php_flag allow_url_fopen off
php_flag allow_url_include off
php_flag display_errors off
php_flag enable_dl off
php_flag expose_php off
php_value max_execution_time 30
php_value max_input_time 30
php_value memory_limit 40M
php_value post_max_size 8M
php_value session.gc_maxlifetime 1440
php_value session.save_path /tmp
php_value upload_max_filesize 2M`,
    category: 'security'
  },
  {
    id: 'ipv6-support',
    name: 'IPv6 Desteği',
    description: 'IPv6 bağlantıları için destek ekler',
    code: `Listen [::]:80
<VirtualHost [::]:80>
    ServerName ipv6.example.com
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>`,
    category: 'misc',
    parameters: [{
      name: 'domain',
      description: 'IPv6 destekli domain adı',
      default: 'ipv6.example.com'
    }]
  },
  {
    id: 'special-chars',
    name: 'Özel Karakter Koruması',
    description: 'URL\'lerde özel karakterleri korur',
    code: `<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_URI} "[^-A-Za-z0-9/_.,]"
    RewriteRule ^(.*)$ - [F,L]
    
    # Türkçe karakter desteği
    AddDefaultCharset UTF-8
    AddCharset UTF-8 .html .css .js .xml .json .rss
</IfModule>`,
    category: 'security'
  },
  {
    id: 'ssl-config',
    name: 'SSL Sertifika Yapılandırması',
    description: 'SSL sertifikası için detaylı yapılandırma',
    code: `<IfModule mod_ssl.c>
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/chain.crt
    
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLHonorCipherOrder on
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
    
    SSLOptions +StrictRequire
    SSLSessionTickets off
</IfModule>`,
    category: 'ssl',
    parameters: [
      {
        name: 'certPath',
        description: 'SSL sertifika dosyasının yolu',
        default: '/path/to/certificate.crt'
      },
      {
        name: 'keyPath',
        description: 'SSL özel anahtar dosyasının yolu',
        default: '/path/to/private.key'
      }
    ]
  },
  {
    id: 'api-proxy',
    name: 'API Proxy Yapılandırması',
    description: 'API isteklerini başka bir sunucuya yönlendirir',
    code: `<Location /api/>
    ProxyPass http://api-server:8080/
    ProxyPassReverse http://api-server:8080/
    
    # CORS ayarları
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type,Authorization"
    
    # Rate limiting
    SetEnvIf Request_URI "^/api/" api-request
    SetEnvIf Request_Method "GET" api-get
    
    # Cache kontrolü
    Header set Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Location>`,
    category: 'proxy',
    parameters: [{
      name: 'apiServer',
      description: 'API sunucusunun adresi',
      default: 'http://localhost:8080'
    }]
  },
  {
    id: 'cdn-integration',
    name: 'CDN Entegrasyonu',
    description: 'CloudFlare/Akamai gibi CDN servisleri için yapılandırma',
    code: `# Gerçek IP adresini al
RemoteIPHeader CF-Connecting-IP
RemoteIPTrustedProxy 103.21.244.0/22
RemoteIPTrustedProxy 103.22.200.0/22
RemoteIPTrustedProxy 103.31.4.0/22
RemoteIPTrustedProxy 104.16.0.0/12
RemoteIPTrustedProxy 108.162.192.0/18
RemoteIPTrustedProxy 131.0.72.0/22
RemoteIPTrustedProxy 141.101.64.0/18
RemoteIPTrustedProxy 162.158.0.0/15
RemoteIPTrustedProxy 172.64.0.0/13
RemoteIPTrustedProxy 173.245.48.0/20
RemoteIPTrustedProxy 188.114.96.0/20
RemoteIPTrustedProxy 190.93.240.0/20
RemoteIPTrustedProxy 197.234.240.0/22
RemoteIPTrustedProxy 198.41.128.0/17

# CDN önbellek başlıkları
Header set Cache-Control "public, max-age=31536000"
Header set X-Cache-Status "%{CACHE_STATUS}e"`,
    category: 'performance',
    parameters: [{
      name: 'cdnProvider',
      description: 'CDN sağlayıcısı (cloudflare, akamai, vb.)',
      default: 'cloudflare'
    }]
  },
  {
    id: 'websocket-support',
    name: 'WebSocket Desteği',
    description: 'WebSocket bağlantıları için proxy yapılandırması',
    code: `# WebSocket proxy
RewriteEngine On
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^/?(.*) "ws://localhost:8080/$1" [P,L]

# WebSocket başlıkları
Header set Access-Control-Allow-Headers "X-Requested-With, WebSocket-Protocol"
Header set Access-Control-Allow-Headers "X-Socket-Type"
Header set Access-Control-Allow-Headers "Sec-WebSocket-Extensions"
Header set Access-Control-Allow-Headers "Sec-WebSocket-Key"
Header set Access-Control-Allow-Headers "Sec-WebSocket-Protocol"
Header set Access-Control-Allow-Headers "Sec-WebSocket-Version"`,
    category: 'proxy',
    parameters: [{
      name: 'wsServer',
      description: 'WebSocket sunucu adresi',
      default: 'localhost:8080'
    }]
  },
  {
    id: 'modsecurity-rules',
    name: 'ModSecurity Kuralları',
    description: 'Web Application Firewall (WAF) kuralları',
    code: `<IfModule mod_security2.c>
    SecRuleEngine On
    SecRequestBodyAccess On
    SecResponseBodyAccess On
    
    # SQL Injection koruması
    SecRule REQUEST_COOKIES|REQUEST_COOKIES_NAMES|REQUEST_FILENAME|REQUEST_HEADERS|REQUEST_HEADERS_NAMES|REQUEST_METHOD|REQUEST_PROTOCOL|REQUEST_URI|REQUEST_URI_RAW|ARGS|ARGS_NAMES|ARGS_POST|ARGS_POST_NAMES "@detectSQLi" \\
        "id:1000,phase:2,deny,status:403,msg:'SQL Injection Attempt'"
    
    # XSS koruması
    SecRule REQUEST_COOKIES|REQUEST_COOKIES_NAMES|REQUEST_HEADERS|REQUEST_HEADERS_NAMES|ARGS|ARGS_NAMES|ARGS_POST|ARGS_POST_NAMES "@detectXSS" \\
        "id:1001,phase:2,deny,status:403,msg:'XSS Attempt'"
    
    # Dosya enjeksiyonu koruması
    SecRule REQUEST_FILENAME "\\.(php|asp|aspx|jsp)$" \\
        "id:1002,phase:2,deny,status:403,msg:'File Injection Attempt'"
</IfModule>`,
    category: 'security'
  },
  {
    id: 'redis-cache',
    name: 'Redis Önbellek',
    description: 'Redis önbellek entegrasyonu',
    code: `# Redis bağlantı ayarları
RedisConnPoolTTL 3600
RedisTimeout 1.0
RedisConnTimeout 1.0
RedisPassword "your-redis-password"

# Önbellek ayarları
RedisMaxConnections 10
RedisCacheTimeout 3600
RedisKeyPrefix "myapp:"

# Önbellek kuralları
<Location />
    RedisEnable on
    RedisTimeout 3600
    RedisMaxQueueLength 100
</Location>`,
    category: 'caching',
    parameters: [{
      name: 'redisHost',
      description: 'Redis sunucu adresi',
      default: 'localhost:6379'
    }]
  },
  {
    id: 'multi-language',
    name: 'Çoklu Dil Desteği',
    description: 'Dil bazlı içerik yönlendirmesi',
    code: `# Dil tespiti
RewriteEngine On
RewriteCond %{HTTP:Accept-Language} ^tr [NC]
RewriteRule ^/?$ /tr/ [L,R=301]
RewriteCond %{HTTP:Accept-Language} ^en [NC]
RewriteRule ^/?$ /en/ [L,R=301]

# Varsayılan dil
RewriteRule ^/?$ /tr/ [L,R=301]

# Dil bazlı içerik türü
<FilesMatch "\\.(html|php)$">
    SetEnvIf Request_URI "/tr/" LANG=tr
    SetEnvIf Request_URI "/en/" LANG=en
    Header set Content-Language "%{LANG}e"
</FilesMatch>`,
    category: 'misc',
    parameters: [{
      name: 'defaultLang',
      description: 'Varsayılan dil kodu',
      default: 'tr'
    }]
  },
  {
    id: 'amp-config',
    name: 'AMP Yapılandırması',
    description: 'Accelerated Mobile Pages yapılandırması',
    code: `# AMP sayfaları için MIME türü
AddType application/ld+json .jsonld

# AMP önbellek başlıkları
<FilesMatch "amp\\.html$">
    Header set Access-Control-Allow-Origin "*"
    Header set AMP-Access-Control-Allow-Source-Origin "*"
    Header set Access-Control-Expose-Headers "AMP-Access-Control-Allow-Source-Origin"
    Header set Content-Type "text/html; charset=UTF-8"
    Header set Cache-Control "public, max-age=600"
</FilesMatch>

# AMP resim önbelleği
<FilesMatch "\\.(jpg|jpeg|gif|png|webp)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>

# AMP yönlendirme
RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} (googlebot-mobile|mobile) [NC]
RewriteRule ^(.*)$ $1/amp.html [L,R=302]`,
    category: 'performance',
    parameters: [{
      name: 'ampCacheDuration',
      description: 'AMP sayfaları önbellek süresi (saniye)',
      default: '600'
    }]
  },
  {
    id: 'seo-optimization',
    name: 'SEO Optimizasyonu',
    description: 'Arama motoru sıralamasını iyileştirmek için gerekli tüm .htaccess kuralları',
    category: 'seo',
    code: `# SEO Optimizasyonları
# Canonical URL'leri zorla
<IfModule mod_rewrite.c>
  RewriteEngine On
  # www olmadan erişimi zorla
  RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
  
  # Trailing slash ekle
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_URI} !(.*)/$
  RewriteRule ^(.*)$ $1/ [L,R=301]
</IfModule>

# Browser caching kuralları
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Resimler için cache
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # CSS, JavaScript ve metin dosyaları için cache
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # HTML ve XML dosyaları için cache
  ExpiresByType text/html "access plus 1 day"
  ExpiresByType application/xhtml+xml "access plus 1 day"
</IfModule>

# GZIP sıkıştırma
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Güvenlik başlıkları
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  
  # CORS başlıkları
  Header set Access-Control-Allow-Origin "*"
</IfModule>

# URL yeniden yazma kuralları
<IfModule mod_rewrite.c>
  # URL'lerden index.php/html kaldır
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,}\s(.*)/index\.(php|html)\ HTTP [NC]
  RewriteRule ^(.*)index\.(php|html)$ $1 [R=301,L]
  
  # URL'lerden .php uzantısını kaldır
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}\.php -f
  RewriteRule ^([^\.]+)$ $1.php [NC,L]
  
  # URL'lerden .html uzantısını kaldır
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}\.html -f
  RewriteRule ^([^\.]+)$ $1.html [NC,L]
</IfModule>

# Varsayılan karakter seti
AddDefaultCharset UTF-8

# ETags devre dışı bırak
<IfModule mod_headers.c>
  Header unset ETag
</IfModule>
FileETag None`
  },
  {
    id: 'performance-boost',
    name: 'Performans İyileştirmeleri',
    description: 'Sayfa yükleme hızını artırmak için gelişmiş önbellekleme ve sıkıştırma kuralları',
    category: 'performance',
    code: `# Performans Optimizasyonları
# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  
  # Medya dosyaları
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # CSS ve JS dosyaları
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # Fontlar
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  ExpiresByType application/x-font-ttf "access plus 1 year"
  ExpiresByType application/x-font-opentype "access plus 1 year"
</IfModule>

# Sıkıştırma
<IfModule mod_deflate.c>
  # Tüm çıktıları sıkıştır
  SetOutputFilter DEFLATE
  
  # Eski tarayıcılar için sıkıştırma seviyesi
  BrowserMatch ^Mozilla/4 gzip-only-text/html
  BrowserMatch ^Mozilla/4\.0[678] no-gzip
  BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
  
  # Sıkıştırılacak dosya türleri
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  
  # Sıkıştırma seviyesi
  DeflateCompressionLevel 9
</IfModule>

# Keep-Alive etkinleştir
<IfModule mod_headers.c>
  Header set Connection keep-alive
</IfModule>

# ETags optimize et
FileETag MTime Size`
  }
]; 