import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { techniquesData } from '../data/techniques.js';
import { foundationCategories, getAllFoundationItems } from '../data/foundation/index.js';

const BASE_URL = 'https://roku-brand.github.io/genius-of-living';
const SITE_NAME = '処世術禄';
const OG_IMAGE = `${BASE_URL}/assets/icons/app-icon-512.png`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const categorySlugMap = {
  人生術: 'life',
  思考術: 'thinking',
  '対人術①': 'people-1',
  '対人術②': 'people-2',
  スキル術: 'skill',
  達成術: 'achievement',
};

const groupSlugOverrides = {
  人生設計: 'life-design',
  夢と挑戦: 'dream-challenge',
  後悔回避: 'regret-avoidance',
  変化対応: 'change-adaptation',
  運と偶然: 'luck-chance',
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const stripHtml = (text) => (text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const truncate = (text, length = 120) => {
  const trimmed = stripHtml(text);
  if (trimmed.length <= length) {
    return trimmed;
  }
  return `${trimmed.slice(0, length - 1)}…`;
};

const formatDate = (date = new Date()) => date.toISOString().split('T')[0];

const buildHead = ({
  title,
  description,
  canonicalPath,
  ogType,
  relativeRoot,
}) => {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const safeDescription = truncate(description, 120);
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}｜${SITE_NAME}</title>
    <meta name="description" content="${safeDescription}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${title}｜${SITE_NAME}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="theme-color" content="#2b5c8a" />
    <link rel="manifest" href="${relativeRoot}manifest.webmanifest" />
    <link rel="icon" href="${relativeRoot}assets/icons/app-icon-192.png" />
    <link rel="apple-touch-icon" href="${relativeRoot}assets/icons/app-icon-192.png" />
    <link rel="stylesheet" href="${relativeRoot}styles.css" />`;
};

const renderHeader = ({ relativeRoot, active }) => {
  const isActive = (key) => (key === active ? ' is-active' : '');
  return `    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-header__title" href="${relativeRoot}">処世術<span class="site-header__accent">禄</span></a>
        <div class="site-header__actions">
          <nav class="tabs" aria-label="主要リンク">
            <a class="tab${isActive('top')}" href="${relativeRoot}">トップ</a>
            <a class="tab${isActive('shoseijutsu')}" href="${relativeRoot}shoseijutsu/">処世術（まとまり）</a>
            <a class="tab${isActive('wisdom')}" href="${relativeRoot}wisdom/">思想カード</a>
            <a class="tab${isActive('principles')}" href="${relativeRoot}principles/">処世術の原則</a>
          </nav>
        </div>
      </div>
    </header>`;
};

const renderFooter = () => `    <footer class="footer">
      <p>処世術禄 — 人生の処世術OSを構築するためのナレッジベース。</p>
    </footer>`;

const getGroupSlug = (group, category, index) => {
  if (group.slug) {
    return group.slug;
  }
  if (groupSlugOverrides[group.name]) {
    return groupSlugOverrides[group.name];
  }
  const categorySlug = categorySlugMap[category.title] || 'group';
  return `${categorySlug}-${String(index + 1).padStart(2, '0')}`;
};

const getGroupSummary = (group) => {
  const titles = group.details.slice(0, 2).map((detail) => detail.title).filter(Boolean);
  if (titles.length) {
    return `${group.name}に含まれる処世術：${titles.join('、')}など。`;
  }
  return `${group.name}の処世術をまとめた一覧です。`;
};

const renderShoseijutsuIndex = (groups) => {
  const description =
    '処世術をまとまり単位で整理し、人生・思考・対人・スキル・達成の処世術を横断して学ぶための一覧ページ。';
  const cards = groups
    .map((group) => {
      const items = group.details
        .slice(0, 5)
        .map((detail, idx) =>
          `<li class="hub-folder__item">${String(idx + 1).padStart(2, '0')}. ${detail.title}</li>`,
        )
        .join('');
      return `          <article class="hub-folder">
            <div class="hub-folder__header">
              <a class="hub-folder__title-button" href="./${group.slug}/">${group.name}の処世術</a>
            </div>
            <div class="hub-folder__details">
              <div class="hub-folder__details-header">
                <p class="hub-folder__category">${group.categoryTitle}</p>
                <p class="hub-folder__summary">${getGroupSummary(group)}</p>
                <div class="hub-folder__meta">
                  <span class="hub-folder__meta-item">処世術 ${group.details.length}</span>
                </div>
              </div>
              <ul class="hub-folder__items">${items}</ul>
            </div>
          </article>`;
    })
    .join('\n');

  const relativeRoot = '../';
  const head = buildHead({
    title: '処世術（まとまり）一覧',
    description,
    canonicalPath: '/shoseijutsu/',
    ogType: 'website',
    relativeRoot,
  });

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${renderHeader({ relativeRoot, active: 'shoseijutsu' })}

    <main class="container page">
      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          <li><a href="${relativeRoot}">処世術禄</a></li>
          <li><a href="./">処世術（まとまり）</a></li>
        </ol>
      </nav>

      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">処世術（まとまり）</p>
          <h1>処世術をまとまり単位で整理する一覧</h1>
          <p class="page-hero__lead">
            人生設計、夢と挑戦、後悔回避などのまとまりごとに処世術を整理しました。各まとまりの詳細ページでは、具体的な処世術カードを確認できます。
          </p>
        </header>

        <section class="page-section">
          <h2>処世術のまとまり一覧</h2>
          <div class="hub-folder-list">
${cards}
          </div>
        </section>

        <section class="page-section">
          <h2>次に読むべきページ</h2>
          <ul class="page-link-list">
            <li><a href="${relativeRoot}wisdom/">思想カード一覧を読む</a></li>
            <li><a href="${relativeRoot}principles/">処世術の原則を読む</a></li>
          </ul>
        </section>
      </article>
    </main>

${renderFooter()}
  </body>
</html>`;
};

const renderShoseijutsuGroup = (group) => {
  const description = `${group.name}の処世術を一覧化し、${group.details
    .slice(0, 2)
    .map((detail) => detail.title)
    .join('、')}など実践のヒントをまとめたページ。`;
  const relativeRoot = '../../';
  const head = buildHead({
    title: `${group.name}の処世術`,
    description,
    canonicalPath: `/shoseijutsu/${group.slug}/`,
    ogType: 'article',
    relativeRoot,
  });

  const cards = group.details
    .map((detail) => {
      const foundations = detail.foundations && detail.foundations.length
        ? `<p class="technique-detail-foundation-label">思想基盤</p>
           <div class="technique-detail-foundations">
             ${detail.foundations
               .map((tag) => `<span class="foundation-tag">${tag}</span>`)
               .join('')}
           </div>`
        : `<p class="technique-detail-foundation-label">思想基盤</p>
           <div class="technique-detail-foundations">
             <span class="foundation-tag foundation-tag--empty">—</span>
           </div>`;
      return `          <article class="technique-detail-card" data-category="${group.categoryKey}">
            <span class="technique-detail-id">${detail.id}</span>
            <div class="technique-detail-content">
              <h3 class="technique-detail-item-title">${detail.title}</h3>
              <p class="technique-detail-subtitle">（${detail.subtitle}）</p>
              ${foundations}
            </div>
          </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${renderHeader({ relativeRoot, active: 'shoseijutsu' })}

    <main class="container page">
      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          <li><a href="${relativeRoot}">処世術禄</a></li>
          <li><a href="${relativeRoot}shoseijutsu/">処世術（まとまり）</a></li>
          <li><a href="./">${group.name}の処世術</a></li>
        </ol>
      </nav>

      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">${group.categoryTitle}</p>
          <h1>${group.name}の処世術</h1>
          <p class="page-hero__lead">${truncate(getGroupSummary(group), 120)}</p>
        </header>

        <nav class="technique-detail-nav">
          <span></span>
          <a class="technique-back-button" href="${relativeRoot}shoseijutsu/">一覧に戻る</a>
          <span></span>
        </nav>

        <section class="technique-detail-grid">
${cards}
        </section>
      </article>
    </main>

${renderFooter()}
  </body>
</html>`;
};

const renderWisdomIndex = (categories) => {
  const description =
    '認知・感情、行動・意思決定、対人・影響、構造・制度などの思想カードを一覧化し、背景となる原理を横断して確認できるページ。';
  const relativeRoot = '../';
  const head = buildHead({
    title: '思想カード一覧',
    description,
    canonicalPath: '/wisdom/',
    ogType: 'website',
    relativeRoot,
  });

  const categoryLinks = categories
    .map((category) => `<li><a href="./${category.id}/">${category.title}</a></li>`)
    .join('\n');

  const sections = categories
    .map((category) => {
      const cards = category.items
        .map((item) => {
          return `          <a class="foundation-card" href="./${item.tagId}/">
            <span class="foundation-card__tag-id">${item.tagId}</span>
            <div class="foundation-card__content">
              <h3 class="foundation-card__title">${item.title}</h3>
              <p class="foundation-card__summary">${item.summary}</p>
            </div>
          </a>`;
        })
        .join('\n');

      return `        <section class="page-section">
          <div class="page-section__header">
            <h2>${category.title}</h2>
            <a class="page-section__link" href="./${category.id}/">一覧を見る</a>
          </div>
          <div class="foundation-cards-grid">
${cards}
          </div>
        </section>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${renderHeader({ relativeRoot, active: 'wisdom' })}

    <main class="container page">
      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          <li><a href="${relativeRoot}">処世術禄</a></li>
          <li><a href="./">思想カード</a></li>
        </ol>
      </nav>

      <article class="page-article">
        <header class="page-hero">
          <p class="page-hero__eyebrow">思想カード</p>
          <h1>処世術の背景を支える思想カード</h1>
          <p class="page-hero__lead">
            経験則・原則・概念をカード化し、処世術の背景にある思想基盤を整理しました。個別カードでは定義や要点を確認できます。
          </p>
        </header>

        <section class="page-section">
          <h2>思想カードのカテゴリ</h2>
          <ul class="page-link-list">
${categoryLinks}
          </ul>
        </section>

${sections}
      </article>
    </main>

${renderFooter()}
  </body>
</html>`;
};

const renderWisdomCategory = (category) => {
  const description = `${category.title}の思想カードを一覧化し、処世術の背景にある原理をまとめたページ。`;
  const relativeRoot = '../../';
  const head = buildHead({
    title: category.title,
    description,
    canonicalPath: `/wisdom/${category.id}/`,
    ogType: 'website',
    relativeRoot,
  });

  const cards = category.items
    .map((item) => {
      return `          <a class="foundation-card" href="../${item.tagId}/">
            <span class="foundation-card__tag-id">${item.tagId}</span>
            <div class="foundation-card__content">
              <h3 class="foundation-card__title">${item.title}</h3>
              <p class="foundation-card__summary">${item.summary}</p>
            </div>
          </a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${renderHeader({ relativeRoot, active: 'wisdom' })}

    <main class="container page">
      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          <li><a href="${relativeRoot}">処世術禄</a></li>
          <li><a href="${relativeRoot}wisdom/">思想カード</a></li>
          <li><a href="./">${category.title}</a></li>
        </ol>
      </nav>

      <article class="page-article">
        <a class="foundation-back-button" href="${relativeRoot}wisdom/">← 思想カード一覧へ</a>
        <header class="page-hero">
          <p class="page-hero__eyebrow">思想カード</p>
          <h1>${category.title}</h1>
          <p class="page-hero__lead">
            ${category.title}の思想カードを一覧で確認できます。気になるカードを開いて定義や要点を把握しましょう。
          </p>
        </header>

        <section class="page-section">
          <h2>${category.title}の思想カード</h2>
          <div class="foundation-cards-grid">
${cards}
          </div>
        </section>
      </article>
    </main>

${renderFooter()}
  </body>
</html>`;
};

const renderWisdomDetail = (item) => {
  const description = item.summary || item.definition || `${item.title}に関する思想カード。`;
  const relativeRoot = '../../';
  const head = buildHead({
    title: item.title,
    description,
    canonicalPath: `/wisdom/${item.tagId}/`,
    ogType: 'article',
    relativeRoot,
  });

  const renderList = (title, items) => {
    if (!items || items.length === 0) {
      return '';
    }
    return `        <div class="foundation-detail-section">
          <h2 class="foundation-detail-section-title">${title}</h2>
          <ul class="foundation-detail-list">
            ${items.map((text) => `<li>${text}</li>`).join('')}
          </ul>
        </div>`;
  };

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
${head}
  </head>
  <body>
${renderHeader({ relativeRoot, active: 'wisdom' })}

    <main class="container page">
      <nav class="visually-hidden" aria-label="パンくず">
        <ol>
          <li><a href="${relativeRoot}">処世術禄</a></li>
          <li><a href="${relativeRoot}wisdom/">思想カード</a></li>
          <li><a href="./">${item.title}</a></li>
        </ol>
      </nav>

      <article class="page-article">
        <a class="foundation-back-button" href="${relativeRoot}wisdom/">← 思想カード一覧へ</a>
        <header class="foundation-detail-header">
          <span class="foundation-card__tag-id">${item.tagId}</span>
          <h1 class="foundation-detail-title">${item.title}</h1>
          <p class="foundation-detail-summary">${item.summary}</p>
        </header>

        <section class="foundation-detail-sections">
          <div class="foundation-detail-section">
            <h2 class="foundation-detail-section-title">定義</h2>
            <p class="foundation-detail-section-text">${item.definition}</p>
          </div>
${renderList('要点', item.keyPoints)}
${renderList('落とし穴', item.pitfalls)}
${renderList('戦略', item.strategies)}
${renderList('適用条件', item.applicationConditions)}
          <div class="foundation-detail-section">
            <h2 class="foundation-detail-section-title">活用処世術</h2>
            <div class="foundation-detail-tags">
              ${(item.lifehacks || []).map((lifehack) => `<span class="foundation-detail-lifehack-tag">${lifehack}</span>`).join('')}
            </div>
          </div>
          <div class="foundation-detail-section">
            <h2 class="foundation-detail-section-title">タグ</h2>
            <div class="foundation-detail-tags">
              ${(item.tags || []).map((tag) => `<span class="foundation-detail-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </section>
      </article>
    </main>

${renderFooter()}
  </body>
</html>`;
};

const buildSitemap = (urls) => {
  const lastmod = formatDate();
  const entries = urls
    .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
};

const buildPages = async () => {
  const groups = [];

  techniquesData.forEach((category) => {
    const categoryKey = categorySlugMap[category.title] || 'default';
    category.items.forEach((group, index) => {
      const slug = getGroupSlug(group, category, index);
      groups.push({
        ...group,
        slug,
        categoryKey,
        categoryTitle: category.title,
      });
    });
  });

  const shoseijutsuDir = path.join(ROOT_DIR, 'shoseijutsu');
  const wisdomDir = path.join(ROOT_DIR, 'wisdom');

  await ensureDir(shoseijutsuDir);
  await ensureDir(wisdomDir);

  await fs.writeFile(
    path.join(shoseijutsuDir, 'index.html'),
    renderShoseijutsuIndex(groups),
    'utf8',
  );

  await Promise.all(
    groups.map(async (group) => {
      const groupDir = path.join(shoseijutsuDir, group.slug);
      await ensureDir(groupDir);
      await fs.writeFile(path.join(groupDir, 'index.html'), renderShoseijutsuGroup(group), 'utf8');
    }),
  );

  const normalizedCategories = foundationCategories;
  const normalizedWisdomItems = getAllFoundationItems();

  await fs.writeFile(
    path.join(wisdomDir, 'index.html'),
    renderWisdomIndex(normalizedCategories),
    'utf8',
  );

  await Promise.all(
    normalizedCategories.map(async (category) => {
      const categoryDir = path.join(wisdomDir, category.id);
      await ensureDir(categoryDir);
      await fs.writeFile(
        path.join(categoryDir, 'index.html'),
        renderWisdomCategory(category),
        'utf8',
      );
    }),
  );

  await Promise.all(
    normalizedWisdomItems.map(async (item) => {
      const itemDir = path.join(wisdomDir, item.tagId);
      await ensureDir(itemDir);
      await fs.writeFile(path.join(itemDir, 'index.html'), renderWisdomDetail(item), 'utf8');
    }),
  );

  const sitemapUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/shoseijutsu/`,
    ...groups.map((group) => `${BASE_URL}/shoseijutsu/${group.slug}/`),
    `${BASE_URL}/wisdom/`,
    ...normalizedCategories.map((category) => `${BASE_URL}/wisdom/${category.id}/`),
    ...normalizedWisdomItems.map((item) => `${BASE_URL}/wisdom/${item.tagId}/`),
    `${BASE_URL}/principles/`,
  ];

  await fs.writeFile(
    path.join(ROOT_DIR, 'sitemap.xml'),
    buildSitemap(sitemapUrls),
    'utf8',
  );
};

buildPages().catch((error) => {
  console.error(error);
  process.exit(1);
});
