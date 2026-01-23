const fs = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');

const BASE_URL = 'https://roku-brand.github.io/genius-of-living';
const SITE_NAME = '処世術禄';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const truncate = (text, maxLength = 120) => {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
};

const formatDate = (date = new Date()) => date.toISOString().slice(0, 10);

const getFoundationTags = (foundations = []) => {
  const tags = foundations
    .flatMap((entry) => String(entry).split(/\s+/))
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set(tags));
};

const buildHead = ({
  title,
  description,
  canonical,
  ogType,
  ogImage,
  manifestPath,
  iconPath,
  appleIconPath,
  stylesheetPath,
}) => {
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta name="theme-color" content="#2b5c8a" />
    <link rel="manifest" href="${escapeHtml(manifestPath)}" />
    <link rel="icon" href="${escapeHtml(iconPath)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(appleIconPath)}" />
    <link rel="stylesheet" href="${escapeHtml(stylesheetPath)}" />`;
};

const buildHeader = ({ basePath, activeTab }) => {
  const tabs = [
    { key: 'top', label: 'トップ', href: `${basePath}` },
    { key: 'techniques', label: '処世術一覧', href: `${basePath}techniques/` },
    { key: 'wisdom', label: '思想カード', href: `${basePath}wisdom/` },
    { key: 'hub', label: '処世術ハブ', href: `${basePath}shoseijutsu/` },
  ];
  const tabLinks = tabs
    .map((tab) => {
      const className = tab.key === activeTab ? 'tab is-active' : 'tab';
      return `<a class="${className}" href="${tab.href}">${tab.label}</a>`;
    })
    .join('');

  return `    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-header__title" href="${basePath}">処世術<span class="site-header__accent">禄</span></a>
        <div class="site-header__actions">
          <nav class="tabs" aria-label="主要リンク">
            ${tabLinks}
          </nav>
        </div>
      </div>
    </header>`;
};

const buildFooter = () =>
  `    <footer class="footer">
      <p>処世術禄 — 人生の処世術OSを構築するためのナレッジベース。</p>
    </footer>`;

const buildBreadcrumbs = (items, basePath) => {
  const listItems = items
    .map((item) => `<li><a href="${basePath}${item.path}">${escapeHtml(item.label)}</a></li>`)
    .join('');
  return `      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          ${listItems}
        </ol>
      </nav>`;
};

const wrapPage = ({ head, header, breadcrumbs, content, footer }) => `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${header}

    <main class="container page">
${breadcrumbs}
${content}
    </main>

${footer}
  </body>
</html>`;

const buildTechniqueCard = ({
  id,
  title,
  subtitle,
  foundations,
  link,
  asLink = true,
}) => {
  const foundationTags = getFoundationTags(foundations);
  const foundationHtml =
    foundationTags.length === 0
      ? '<span class="foundation-tag foundation-tag--empty">—</span>'
      : foundationTags.map((tag) => `<span class="foundation-tag">${escapeHtml(tag)}</span>`).join('');
  const subtitleHtml = subtitle
    ? `<p class="technique-detail-subtitle">（${escapeHtml(subtitle)}）</p>`
    : '';

  const wrapperTag = asLink ? 'a' : 'article';
  const hrefAttribute = asLink ? ` href="${escapeHtml(link)}"` : '';

  return `            <${wrapperTag} class="technique-detail-card"${hrefAttribute}>
              <span class="technique-detail-id">${escapeHtml(id)}</span>
              <div class="technique-detail-content">
                <h4 class="technique-detail-item-title">${escapeHtml(title)}</h4>
                ${subtitleHtml}
              </div>
              <p class="technique-detail-foundation-label">思想基盤</p>
              <div class="technique-detail-foundations">
                ${foundationHtml}
              </div>
            </${wrapperTag}>`;
};

const buildTechniqueListPage = ({ techniquesByCategory, basePath }) => {
  const title = `処世術一覧 | ${SITE_NAME}`;
  const description = '処世術カードをカテゴリごとに一覧で確認できるページ。人生術・思考術・対人術・スキル術・達成術を網羅して整理。';
  const canonical = `${BASE_URL}/techniques/`;
  const head = buildHead({
    title,
    description,
    canonical,
    ogType: 'website',
    ogImage: `${BASE_URL}/assets/icons/app-icon-512.png`,
    manifestPath: `${basePath}manifest.webmanifest`,
    iconPath: `${basePath}assets/icons/app-icon-192.png`,
    appleIconPath: `${basePath}assets/icons/app-icon-192.png`,
    stylesheetPath: `${basePath}styles.css`,
  });
  const header = buildHeader({ basePath, activeTab: 'techniques' });
  const breadcrumbs = buildBreadcrumbs(
    [
      { label: SITE_NAME, path: '' },
      { label: '処世術一覧', path: 'techniques/' },
    ],
    basePath,
  );

  const sections = techniquesByCategory
    .map((category) => {
      const itemsHtml = category.items
        .map((item) => {
          const cards = item.details
            .map((detail) =>
              buildTechniqueCard({
                ...detail,
                link: `./${detail.cardId}/`,
              }),
            )
            .join('\n');
          return `        <div class="page-section">
          <h3>${escapeHtml(item.name)}</h3>
          <div class="technique-detail-grid">
${cards}
          </div>
        </div>`;
        })
        .join('\n');

      return `      <section class="page-section">
        <h2>${escapeHtml(category.title)}</h2>
${itemsHtml}
      </section>`;
    })
    .join('\n');

  const content = `      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">処世術一覧</p>
          <h1>処世術カード一覧</h1>
          <p class="page-hero__lead">カード単位で処世術を整理した一覧です。各カードをクリックすると詳細ページへ遷移します。</p>
        </header>
${sections}
      </article>`;

  return wrapPage({ head, header, breadcrumbs, content, footer: buildFooter() });
};

const buildTechniqueDetailPage = ({ detail, basePath }) => {
  const title = `${detail.title}｜${SITE_NAME}`;
  const description = truncate(detail.subtitle || detail.title);
  const canonical = `${BASE_URL}/techniques/${detail.cardId}/`;
  const head = buildHead({
    title,
    description,
    canonical,
    ogType: 'article',
    ogImage: `${BASE_URL}/assets/icons/app-icon-512.png`,
    manifestPath: `${basePath}manifest.webmanifest`,
    iconPath: `${basePath}assets/icons/app-icon-192.png`,
    appleIconPath: `${basePath}assets/icons/app-icon-192.png`,
    stylesheetPath: `${basePath}styles.css`,
  });
  const header = buildHeader({ basePath, activeTab: 'techniques' });
  const breadcrumbs = buildBreadcrumbs(
    [
      { label: SITE_NAME, path: '' },
      { label: '処世術一覧', path: 'techniques/' },
      { label: detail.cardId, path: `techniques/${detail.cardId}/` },
    ],
    basePath,
  );

  const card = buildTechniqueCard({
    ...detail,
    link: '#',
    asLink: false,
  });

  const content = `      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">処世術カード</p>
          <h1>${escapeHtml(detail.title)}</h1>
          <p class="page-hero__lead">${escapeHtml(detail.subtitle || detail.title)}</p>
          <a class="page-link" href="../">← 一覧へ</a>
        </header>

        <div class="technique-detail-panel">
          <div class="technique-detail-header">
            <h2 class="technique-detail-title">${escapeHtml(detail.groupName)}</h2>
            <p class="technique-detail-subtitle">分類：${escapeHtml(detail.categoryTitle)}</p>
          </div>
          <div class="technique-detail-grid">
${card}
          </div>
        </div>
      </article>`;

  return wrapPage({ head, header, breadcrumbs, content, footer: buildFooter() });
};

const buildWisdomListPage = ({ wisdomItems, basePath }) => {
  const title = `思想カード一覧 | ${SITE_NAME}`;
  const description = '思想カード（経験則の知恵）を一覧で確認できるページ。判断の基盤となる知恵をカード単位で整理。';
  const canonical = `${BASE_URL}/wisdom/`;
  const head = buildHead({
    title,
    description,
    canonical,
    ogType: 'website',
    ogImage: `${BASE_URL}/assets/icons/app-icon-512.png`,
    manifestPath: `${basePath}manifest.webmanifest`,
    iconPath: `${basePath}assets/icons/app-icon-192.png`,
    appleIconPath: `${basePath}assets/icons/app-icon-192.png`,
    stylesheetPath: `${basePath}styles.css`,
  });
  const header = buildHeader({ basePath, activeTab: 'wisdom' });
  const breadcrumbs = buildBreadcrumbs(
    [
      { label: SITE_NAME, path: '' },
      { label: '思想カード', path: 'wisdom/' },
    ],
    basePath,
  );

  const cards = wisdomItems
    .map(
      (item) => `          <a class="foundation-card" href="./${item.tagId}/">
            <span class="foundation-card__tag-id">${escapeHtml(item.tagId)}</span>
            <div class="foundation-card__content">
              <h3 class="foundation-card__title">${escapeHtml(item.title)}</h3>
              <p class="foundation-card__summary">${escapeHtml(item.summary)}</p>
            </div>
          </a>`,
    )
    .join('\n');

  const content = `      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">思想カード</p>
          <h1>思想カード一覧</h1>
          <p class="page-hero__lead">経験則の知恵をカード単位でまとめた一覧です。各カードをクリックすると詳細ページへ遷移します。</p>
        </header>

        <section class="page-section">
          <h2>${escapeHtml(wisdomItems.categoryTitle || '経験則の知恵')}</h2>
          <div class="foundation-cards-grid">
${cards}
          </div>
        </section>
      </article>`;

  return wrapPage({ head, header, breadcrumbs, content, footer: buildFooter() });
};

const buildWisdomDetailPage = ({ item, basePath }) => {
  const title = `${item.title}｜${SITE_NAME}`;
  const description = truncate(item.summary || item.definition || item.title);
  const canonical = `${BASE_URL}/wisdom/${item.tagId}/`;
  const head = buildHead({
    title,
    description,
    canonical,
    ogType: 'article',
    ogImage: `${BASE_URL}/assets/icons/app-icon-512.png`,
    manifestPath: `${basePath}manifest.webmanifest`,
    iconPath: `${basePath}assets/icons/app-icon-192.png`,
    appleIconPath: `${basePath}assets/icons/app-icon-192.png`,
    stylesheetPath: `${basePath}styles.css`,
  });
  const header = buildHeader({ basePath, activeTab: 'wisdom' });
  const breadcrumbs = buildBreadcrumbs(
    [
      { label: SITE_NAME, path: '' },
      { label: '思想カード', path: 'wisdom/' },
      { label: item.tagId, path: `wisdom/${item.tagId}/` },
    ],
    basePath,
  );

  const listSection = (titleText, items) => {
    if (!items || items.length === 0) {
      return '';
    }
    const listItems = items.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('');
    return `          <div class="foundation-detail-section">
            <h4 class="foundation-detail-section-title">${escapeHtml(titleText)}</h4>
            <ul class="foundation-detail-list">${listItems}</ul>
          </div>`;
  };

  const content = `      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">思想カード</p>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="page-hero__lead">${escapeHtml(item.summary)}</p>
          <a class="page-link" href="../">← 一覧へ</a>
        </header>

        <div class="foundation-detail-panel">
          <div class="foundation-detail-header">
            <span class="foundation-card__tag-id">${escapeHtml(item.tagId)}</span>
            <h2 class="foundation-detail-title">${escapeHtml(item.title)}</h2>
            <p class="foundation-detail-summary">${escapeHtml(item.summary)}</p>
          </div>

          <div class="foundation-detail-sections">
            <div class="foundation-detail-section">
              <h4 class="foundation-detail-section-title">定義</h4>
              <p class="foundation-detail-section-text">${escapeHtml(item.definition)}</p>
            </div>
${listSection('要点', item.keyPoints)}
${listSection('落とし穴', item.pitfalls)}
${listSection('活用戦略', item.strategies)}
${listSection('適用条件', item.applicationConditions)}
${listSection('活用処世術', item.lifehacks)}
${listSection('タグ', item.tags)}
          </div>
        </div>
      </article>`;

  return wrapPage({ head, header, breadcrumbs, content, footer: buildFooter() });
};

const buildSitemap = (urls) => {
  const lastmod = formatDate();
  const entries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
};

const main = async () => {
  const rootDir = path.resolve(__dirname, '..');
  const techniquesModule = await import(pathToFileURL(path.join(rootDir, 'data/techniques.js')).href);
  const foundationModule = await import(
    pathToFileURL(path.join(rootDir, 'data/foundation/index.js')).href,
  );

  const techniquesData = techniquesModule.techniquesData || [];
  const wisdomData = foundationModule.wisdomData || { items: [] };

  let cardCounter = 1;
  const techniquesByCategory = techniquesData.map((category) => {
    const items = category.items.map((item) => {
      const details = item.details.map((detail) => {
        const cardId = `S-${String(cardCounter).padStart(3, '0')}`;
        cardCounter += 1;
        return {
          ...detail,
          cardId,
          groupName: item.name,
          categoryTitle: category.title,
        };
      });
      return { ...item, details };
    });
    return { ...category, items };
  });

  const wisdomItems = {
    categoryTitle: wisdomData.title,
    items: wisdomData.items.map((item) => ({
      ...item,
    })),
  };

  const outputPaths = {
    techniques: path.join(rootDir, 'techniques'),
    wisdom: path.join(rootDir, 'wisdom'),
  };

  await fs.mkdir(outputPaths.techniques, { recursive: true });
  await fs.mkdir(outputPaths.wisdom, { recursive: true });

  const techniqueListHtml = buildTechniqueListPage({
    techniquesByCategory,
    basePath: '../',
  });
  await fs.writeFile(path.join(outputPaths.techniques, 'index.html'), techniqueListHtml, 'utf8');

  const techniqueDetails = techniquesByCategory.flatMap((category) =>
    category.items.flatMap((item) => item.details),
  );
  for (const detail of techniqueDetails) {
    const detailDir = path.join(outputPaths.techniques, detail.cardId);
    await fs.mkdir(detailDir, { recursive: true });
    const detailHtml = buildTechniqueDetailPage({
      detail,
      basePath: '../../',
    });
    await fs.writeFile(path.join(detailDir, 'index.html'), detailHtml, 'utf8');
  }

  const wisdomListHtml = buildWisdomListPage({
    wisdomItems: wisdomItems.items,
    basePath: '../',
  });
  await fs.writeFile(path.join(outputPaths.wisdom, 'index.html'), wisdomListHtml, 'utf8');

  for (const item of wisdomItems.items) {
    const detailDir = path.join(outputPaths.wisdom, item.tagId);
    await fs.mkdir(detailDir, { recursive: true });
    const detailHtml = buildWisdomDetailPage({
      item,
      basePath: '../../',
    });
    await fs.writeFile(path.join(detailDir, 'index.html'), detailHtml, 'utf8');
  }

  const staticUrls = ['/', '/shoseijutsu/', '/principles/', '/techniques/', '/wisdom/'];
  const techniqueUrls = techniqueDetails.map((detail) => `/techniques/${detail.cardId}/`);
  const wisdomUrls = wisdomItems.items.map((item) => `/wisdom/${item.tagId}/`);
  const sitemapUrls = [...staticUrls, ...techniqueUrls, ...wisdomUrls].map(
    (pathName) => `${BASE_URL}${pathName}`,
  );
  const sitemapXml = buildSitemap(sitemapUrls);
  await fs.writeFile(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf8');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
