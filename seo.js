export const BASE_URL = 'https://roku-brand.github.io/genius-of-living';

const normalizePath = (path = '/') => {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

export const buildUrl = (path = '/') => `${BASE_URL}${normalizePath(path)}`;

const ensureMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
};

const ensureLinkTag = (rel) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  return element;
};

const setMetaContent = (selector, content) => {
  if (!content) {
    return;
  }
  const element = ensureMetaTag(selector, selector.includes('property=') ? { property: selector.match(/property="([^"]+)"/)[1] } : { name: selector.match(/name="([^"]+)"/)[1] });
  element.setAttribute('content', content);
};

const replaceJsonLd = (items) => {
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((node) => node.remove());
  items.forEach((item) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoJsonld = 'true';
    script.textContent = JSON.stringify(item, null, 2);
    document.head.appendChild(script);
  });
};

export const applySeo = ({
  title,
  description,
  path = '/',
  canonicalPath = path,
  type = 'website',
  imagePath = '/assets/icons/app-icon-512.png',
  locale = 'ja_JP',
  jsonLd = [],
} = {}) => {
  if (title) {
    document.title = title;
  }

  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[name="robots"]', 'index,follow');

  const canonical = ensureLinkTag('canonical');
  canonical.setAttribute('href', buildUrl(canonicalPath));

  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:type"]', type);
  setMetaContent('meta[property="og:url"]', buildUrl(path));
  setMetaContent('meta[property="og:image"]', buildUrl(imagePath));
  setMetaContent('meta[property="og:locale"]', locale);

  setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', buildUrl(imagePath));

  if (jsonLd.length) {
    replaceJsonLd(jsonLd);
  }
};

export const createBreadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: buildUrl(item.path),
  })),
});

export const createWebSiteJsonLd = ({ name, description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url,
  description,
  inLanguage: 'ja-JP',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const createArticleJsonLd = ({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  authorName,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': buildUrl(path),
  },
  datePublished,
  dateModified,
  author: {
    '@type': 'Person',
    name: authorName,
  },
});
