import { featuredTechniques } from './data/featured-techniques.js';
import { techniquesData } from './data/techniques.js';
import {
  foundationCategories,
  getAllFoundationItems,
  searchFoundationItems,
} from './data/foundation/index.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js', { updateViaCache: 'none' })
      .then((registration) => {
        const triggerUpdate = (worker) => {
          if (worker) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        };

        if (registration.waiting) {
          triggerUpdate(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) {
            return;
          }
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              triggerUpdate(newWorker);
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        registration.update();
      })
      .catch((error) => {
        console.warn('Service worker registration failed.', error);
      });
  });
}

const tabs = Array.from(document.querySelectorAll('.tab--panel'));
const panels = Array.from(document.querySelectorAll('.panel'));
const mobileNavItems = Array.from(document.querySelectorAll('.mobile-nav__item'));
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu__overlay');
const mobileMenuMediaQuery = window.matchMedia('(max-width: 900px)');

const openMobileMenu = () => {
  if (!mobileMenu || !menuButton || !mobileMenuMediaQuery.matches) {
    return;
  }
  document.body.classList.add('is-menu-open');
  mobileMenu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
};

const closeMobileMenu = () => {
  if (!mobileMenu || !menuButton) {
    return;
  }
  document.body.classList.remove('is-menu-open');
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
};

const toggleMobileMenu = () => {
  if (!mobileMenu || !menuButton) {
    return;
  }
  if (document.body.classList.contains('is-menu-open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
};

if (menuButton && mobileMenu && mobileMenuOverlay) {
  menuButton.addEventListener('click', toggleMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('is-menu-open')) {
      closeMobileMenu();
    }
  });
  mobileMenuMediaQuery.addEventListener('change', () => {
    if (!mobileMenuMediaQuery.matches) {
      closeMobileMenu();
    }
  });
}

const addTabKeyboardNavigation = (tabElements, tab, onActivate) => {
  tab.addEventListener('keydown', (event) => {
    const currentIndex = tabElements.indexOf(tab);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabElements.length;
      tabElements[nextIndex].focus();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + tabElements.length) % tabElements.length;
      tabElements[prevIndex].focus();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      tabElements[0].focus();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      tabElements[tabElements.length - 1].focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate(tab);
    }
  });
};

const setTabActiveState = (tabElements, panelElements, tab) => {
  const targetId = tab.getAttribute('aria-controls');
  if (!targetId) {
    return;
  }

  tabElements.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-selected', String(isActive));
    item.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  panelElements.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.toggleAttribute('hidden', !isActive);
  });
};

const createElement = (tag, className, textContent) => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
};

const isDataReady = (data, ...elements) =>
  elements.every(Boolean) && data && Array.isArray(data);

const categoryThemeMap = {
  人生術: 'life',
  思考術: 'thinking',
  '対人術①': 'people-1',
  '対人術②': 'people-2',
  スキル術: 'skill',
  達成術: 'achievement',
};

const getCategoryKey = (title) => categoryThemeMap[title] ?? 'default';

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

const getGroupSlug = (group, categoryTitle, index) => {
  if (group.slug) {
    return group.slug;
  }
  if (groupSlugOverrides[group.name]) {
    return groupSlugOverrides[group.name];
  }
  const categorySlug = categorySlugMap[categoryTitle] ?? 'group';
  return `${categorySlug}-${String(index + 1).padStart(2, '0')}`;
};

const updateMobileNav = (targetId) => {
  if (!mobileNavItems.length || !targetId) {
    return;
  }
  mobileNavItems.forEach((item) => {
    const isActive = item.dataset.tabTarget === targetId;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
};

const featuredTechniquesList = document.querySelector('#featured-techniques');

if (isDataReady(featuredTechniques, featuredTechniquesList)) {
  featuredTechniques.forEach((technique) => {
    const card = createElement('article', 'card');
    const title = createElement('h3', null, technique.title);
    const summary = createElement('p', null, technique.summary);
    card.appendChild(title);
    card.appendChild(summary);
    featuredTechniquesList.appendChild(card);
  });
}

if (tabs.length && panels.length) {
  const activateTab = (tab, { updateHash = false } = {}) => {
    setTabActiveState(tabs, panels, tab);
    const targetId = tab.getAttribute('aria-controls');
    updateMobileNav(targetId);
    window.scrollTo(0, 0);
    closeMobileMenu();

    if (updateHash) {
      window.location.hash = targetId;
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab, { updateHash: true }));
    addTabKeyboardNavigation(tabs, tab, (currentTab) =>
      activateTab(currentTab, { updateHash: true }),
    );
  });

  if (mobileNavItems.length) {
    mobileNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        const targetId = item.dataset.tabTarget;
        const targetTab = tabs.find((tab) => tab.getAttribute('aria-controls') === targetId);
        if (targetTab) {
          activateTab(targetTab, { updateHash: true });
        }
      });
    });
  }

  const activateTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      return;
    }
    const tab = tabs.find((item) => item.getAttribute('aria-controls') === hash);
    if (tab) {
      activateTab(tab);
    }
  };

  activateTabFromHash();
  const activeTab = tabs.find((item) => item.classList.contains('is-active'));
  if (activeTab) {
    updateMobileNav(activeTab.getAttribute('aria-controls'));
  }
  window.addEventListener('hashchange', activateTabFromHash);
}

const techniquesList = document.querySelector('#techniques-list');
const techniqueDetailPanel = createElement('div', 'technique-detail-panel');
techniqueDetailPanel.id = 'technique-detail-panel';
techniqueDetailPanel.hidden = true;
const techniquesTabList = document.querySelector('#techniques-tablist');
const techniquesTabPanels = document.querySelector('#techniques-tabpanels');

const techniqueOrder = [];
const techniqueIndexEntries = [];

const techniqueTagKeywords = {
  会話: ['会話', '対話', '聞く', '伝える', '質問', '話', '雑談', '説明', '説得', '交渉'],
  恋愛: ['恋愛', 'デート', '異性', '好意', 'パートナー', '関係', '告白'],
  仕事: ['仕事', '職場', '上司', '部下', '会議', '成果', '評価', '営業', 'キャリア'],
  勉強: ['勉強', '学習', '学ぶ', '記憶', '習得', '読書', '理解'],
};

const techniqueCategoryTags = {
  life: ['仕事'],
  thinking: ['勉強'],
  'people-1': ['会話'],
  'people-2': ['会話', '恋愛'],
  skill: ['仕事', '勉強'],
  achievement: ['仕事'],
};

const getTechniqueTags = (detail, item, categoryKey, categoryTitle) => {
  const tags = new Set(techniqueCategoryTags[categoryKey] ?? []);
  const text = `${categoryTitle} ${item.name} ${detail.title} ${detail.subtitle}`.toLowerCase();
  Object.entries(techniqueTagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.add(tag);
    }
  });
  return Array.from(tags);
};

const showTechniqueDetail = (technique, categoryKey = 'default', techniqueIndex = null) => {
  techniqueDetailPanel.innerHTML = '';
  techniqueDetailPanel.hidden = false;
  techniqueDetailPanel.dataset.category = categoryKey;

  const nav = createElement('div', 'technique-detail-nav');
  const backButton = createElement('button', 'technique-back-button', '一覧に戻る');
  backButton.type = 'button';
  backButton.addEventListener('click', () => {
    techniqueDetailPanel.hidden = true;
    techniquesList.hidden = false;
  });

  const prevEntry =
    typeof techniqueIndex === 'number' ? techniqueOrder[techniqueIndex - 1] : null;
  const nextEntry =
    typeof techniqueIndex === 'number' ? techniqueOrder[techniqueIndex + 1] : null;

  const prevButton = createElement(
    'button',
    'technique-nav-button technique-nav-button--prev',
    prevEntry ? `← ${prevEntry.item.name}` : '　',
  );
  prevButton.type = 'button';
  if (!prevEntry) {
    prevButton.disabled = true;
    prevButton.classList.add('technique-nav-button--placeholder');
  } else {
    prevButton.addEventListener('click', () =>
      showTechniqueDetail(prevEntry.item, prevEntry.categoryKey, techniqueIndex - 1),
    );
  }

  const nextButton = createElement(
    'button',
    'technique-nav-button technique-nav-button--next',
    nextEntry ? `${nextEntry.item.name} →` : '　',
  );
  nextButton.type = 'button';
  if (!nextEntry) {
    nextButton.disabled = true;
    nextButton.classList.add('technique-nav-button--placeholder');
  } else {
    nextButton.addEventListener('click', () =>
      showTechniqueDetail(nextEntry.item, nextEntry.categoryKey, techniqueIndex + 1),
    );
  }

  nav.appendChild(prevButton);
  nav.appendChild(backButton);
  nav.appendChild(nextButton);

  const header = createElement('div', 'technique-detail-header');
  const titleEl = createElement('h3', 'technique-detail-title', `${technique.name}（${technique.details.length}）`);
  header.appendChild(titleEl);

  const groupSlug = typeof techniqueIndex === 'number' ? techniqueOrder[techniqueIndex]?.slug : null;
  if (groupSlug) {
    const detailLink = createElement('a', 'technique-detail-link', '詳細ページを開く');
    detailLink.href = `shoseijutsu/${groupSlug}/`;
    detailLink.setAttribute('aria-label', `${technique.name}の詳細ページを開く`);
    header.appendChild(detailLink);
  }

  const grid = createElement('div', 'technique-detail-grid');

  technique.details.forEach((detail) => {
    const card = createElement('article', 'technique-detail-card');
    card.dataset.category = categoryKey;
    
    const idBadge = createElement('span', 'technique-detail-id', String(detail.id));
    const titleWrapper = createElement('div', 'technique-detail-content');
    const titleText = createElement('h4', 'technique-detail-item-title', detail.title);
    const subtitle = createElement('p', 'technique-detail-subtitle', `（${detail.subtitle}）`);
    const foundationLabel = createElement('p', 'technique-detail-foundation-label', '思想基盤');
    const foundationTags = createElement('div', 'technique-detail-foundations');

    if (detail.foundations.length === 0) {
      // Empty foundations - show placeholder
      const emptyTag = createElement('span', 'foundation-tag foundation-tag--empty', '—');
      foundationTags.appendChild(emptyTag);
    } else {
      detail.foundations.forEach((f) => {
        const tag = createElement('button', 'foundation-tag foundation-tag--clickable', f);
        tag.type = 'button';
        tag.setAttribute('aria-label', `基盤 ${f} に移動`);
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          navigateToFoundation(f, { technique, categoryKey, techniqueIndex });
        });
        foundationTags.appendChild(tag);
      });
    }

    titleWrapper.appendChild(titleText);
    titleWrapper.appendChild(subtitle);
    titleWrapper.appendChild(foundationLabel);
    titleWrapper.appendChild(foundationTags);
    card.appendChild(idBadge);
    card.appendChild(titleWrapper);
    grid.appendChild(card);
  });

  techniqueDetailPanel.appendChild(nav);
  techniqueDetailPanel.appendChild(header);
  techniqueDetailPanel.appendChild(grid);
  techniquesList.hidden = true;
};

// Navigate to a foundation item by tagId
const TAB_SWITCH_DELAY = 100;

const navigateToFoundation = (tagId, returnTo = null) => {
  // Find the foundation item
  const allItems = getAllFoundationItems();
  const foundationItem = allItems.find((item) => item.tagId === tagId);

  if (!foundationItem) {
    console.warn(`Foundation item with tagId "${tagId}" not found.`);
    return;
  }

  if (foundationItem.pageUrl) {
    window.location.href = foundationItem.pageUrl;
    return;
  }

  // Switch to foundation tab
  const foundationTab = tabs.find((tab) => tab.getAttribute('aria-controls') === 'tab-foundation');
  if (foundationTab) {
    foundationTab.click();
  }

  // Show the foundation detail panel after a short delay to allow tab switch
  setTimeout(() => {
    showFoundationDetail(foundationItem, {
      origin: returnTo ? 'technique' : 'foundation',
      returnTo,
    });
  }, TAB_SWITCH_DELAY);
};

if (isDataReady(techniquesData, techniquesList)) {
  techniquesData.forEach((category) => {
    const categoryKey = getCategoryKey(category.title);
    const row = createElement('article', 'technique-row');
    row.dataset.category = categoryKey;
    const title = createElement('h3', 'technique-row__title', `≪${category.title}≫`);
    const list = createElement('ul', 'technique-buttons');

    category.items.forEach((item, index) => {
      const techniqueIndex = techniqueOrder.length;
      const groupSlug = getGroupSlug(item, category.title, index);
      techniqueOrder.push({
        item,
        categoryKey,
        categoryTitle: category.title,
        slug: groupSlug,
      });
      const listItem = createElement('li');
      const itemNumber = String(index + 1).padStart(2, '0');
      const buttonText = `${itemNumber}. ${item.name}（${item.details.length}）`;
      const link = createElement('a', 'technique-tag', buttonText);
      link.href = `shoseijutsu/${groupSlug}/`;
      link.dataset.category = categoryKey;
      link.setAttribute('aria-label', `${item.name}の詳細ページを開く`);

      listItem.appendChild(link);
      list.appendChild(listItem);

      item.details.forEach((detail) => {
        techniqueIndexEntries.push({
          detail,
          technique: item,
          categoryKey,
          categoryTitle: category.title,
          techniqueIndex,
          tags: getTechniqueTags(detail, item, categoryKey, category.title),
          searchText: `${category.title} ${item.name} ${detail.title} ${detail.subtitle}`.toLowerCase(),
        });
      });
    });

    row.appendChild(title);
    row.appendChild(list);
    techniquesList.appendChild(row);
  });

  techniquesList.parentElement.appendChild(techniqueDetailPanel);
}

if (techniquesTabList && techniquesTabPanels) {
  const techniqueTabs = Array.from(techniquesTabList.querySelectorAll('[role="tab"]'));
  const techniquePanels = Array.from(techniquesTabPanels.querySelectorAll('[role="tabpanel"]'));

  const setActiveTechniqueTab = (tab) => {
    setTabActiveState(techniqueTabs, techniquePanels, tab);
  };

  techniqueTabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveTechniqueTab(tab));
    addTabKeyboardNavigation(techniqueTabs, tab, setActiveTechniqueTab);
  });
}

const techniquesIndexSearchInput = document.querySelector('#techniques-index-search');
const techniquesIndexResults = document.querySelector('#techniques-index-results');
const techniquesIndexCount = document.querySelector('#techniques-index-count');
const techniquesIndexEmpty = document.querySelector('#techniques-index-empty');
const techniquesIndexTagChips = Array.from(
  document.querySelectorAll('.techniques-index__chips--tags .chip'),
);

if (techniquesIndexSearchInput && techniquesIndexResults && techniquesIndexCount && techniquesIndexEmpty) {
  const selectedTags = new Set();

  const renderTechniquesIndexResults = (entries) => {
    techniquesIndexResults.innerHTML = '';
    techniquesIndexEmpty.hidden = entries.length !== 0;
    entries.forEach((entry) => {
      const card = createElement('article', 'techniques-index__result');
      const button = createElement('button', 'techniques-index__result-button');
      button.type = 'button';
      button.addEventListener('click', () => {
        const listTabButton = document.querySelector('#techniques-tab-list');
        if (listTabButton) {
          listTabButton.click();
        }
        setTimeout(() => {
          showTechniqueDetail(entry.technique, entry.categoryKey, entry.techniqueIndex);
        }, 0);
      });

      const title = createElement('h4', 'techniques-index__result-title', entry.detail.title);
      const subtitle = createElement(
        'p',
        'techniques-index__result-subtitle',
        `（${entry.detail.subtitle}）`,
      );
      const meta = createElement('div', 'techniques-index__result-meta');
      meta.appendChild(createElement('span', null, `カテゴリ: ${entry.categoryTitle}`));
      meta.appendChild(createElement('span', null, `系統: ${entry.technique.name}`));

      const tags = createElement('div', 'techniques-index__result-tags');
      if (entry.tags.length === 0) {
        tags.appendChild(createElement('span', 'techniques-index__result-tag', 'タグなし'));
      } else {
        entry.tags.forEach((tag) => {
          tags.appendChild(createElement('span', 'techniques-index__result-tag', tag));
        });
      }

      button.appendChild(title);
      button.appendChild(subtitle);
      button.appendChild(meta);
      card.appendChild(button);
      card.appendChild(tags);
      techniquesIndexResults.appendChild(card);
    });
  };

  const updateTechniquesIndex = () => {
    const query = techniquesIndexSearchInput.value.trim().toLowerCase();
    const activeTags = Array.from(selectedTags);
    const filtered = techniqueIndexEntries.filter((entry) => {
      const matchesQuery = !query || entry.searchText.includes(query);
      const matchesTags =
        activeTags.length === 0 || activeTags.every((tag) => entry.tags.includes(tag));
      return matchesQuery && matchesTags;
    });

    renderTechniquesIndexResults(filtered);
    if (query || activeTags.length > 0) {
      techniquesIndexCount.textContent = `${filtered.length} 件見つかりました`;
    } else {
      techniquesIndexCount.textContent = `全 ${filtered.length} 件`;
    }
  };

  techniquesIndexSearchInput.addEventListener('input', updateTechniquesIndex);

  techniquesIndexTagChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      if (!tag) {
        return;
      }
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        chip.classList.remove('is-active');
      } else {
        selectedTags.add(tag);
        chip.classList.add('is-active');
      }
      updateTechniquesIndex();
    });
  });

  updateTechniquesIndex();
}

const foundationTabList = document.querySelector('#foundation-tablist');
const foundationPanels = document.querySelector('#foundation-tabpanels');
// Foundation detail panel for page-style navigation
const foundationDetailPanel = createElement('div', 'foundation-detail-panel');
foundationDetailPanel.id = 'foundation-detail-panel';
foundationDetailPanel.hidden = true;

// Show foundation detail in a page-style panel (like technique detail)
const showFoundationDetail = (item, { origin = 'foundation', returnTo = null } = {}) => {
  foundationDetailPanel.innerHTML = '';
  foundationDetailPanel.hidden = false;

  const backLabel = origin === 'technique' ? '← 処世術に戻る' : '← 一覧に戻る';
  const backButton = createElement('button', 'foundation-back-button', backLabel);
  backButton.type = 'button';
  backButton.addEventListener('click', () => {
    if (origin === 'technique' && returnTo) {
      foundationDetailPanel.hidden = true;
      foundationPanels.hidden = false;
      document.querySelector('#foundation-tablist').hidden = false;
      const techniqueTab = tabs.find(
        (tab) => tab.getAttribute('aria-controls') === 'tab-techniques',
      );
      if (techniqueTab) {
        techniqueTab.click();
      }
      setTimeout(() => {
        showTechniqueDetail(returnTo.technique, returnTo.categoryKey, returnTo.techniqueIndex);
      }, 0);
    } else {
      foundationDetailPanel.hidden = true;
      foundationPanels.hidden = false;
      document.querySelector('#foundation-tablist').hidden = false;
    }
  });

  // Header
  const header = createElement('div', 'foundation-detail-header');
  const tagIdBadge = createElement('span', 'foundation-card__tag-id', item.tagId);
  const title = createElement('h3', 'foundation-detail-title', item.title);
  const summary = createElement('p', 'foundation-detail-summary', item.summary);
  header.appendChild(tagIdBadge);
  header.appendChild(title);
  header.appendChild(summary);

  // Sections container
  const sectionsContainer = createElement('div', 'foundation-detail-sections');

  // Definition
  const defSection = createDetailSection('定義', item.definition);
  sectionsContainer.appendChild(defSection);

  // Key Points
  const keyPointsSection = createDetailListSection('要点', item.keyPoints);
  sectionsContainer.appendChild(keyPointsSection);

  // Pitfalls
  const pitfallsSection = createDetailListSection('落とし穴', item.pitfalls);
  sectionsContainer.appendChild(pitfallsSection);

  // Strategies
  const strategiesSection = createDetailListSection('戦略', item.strategies);
  sectionsContainer.appendChild(strategiesSection);

  // Application Conditions
  const conditionsSection = createDetailListSection('適用条件', item.applicationConditions);
  sectionsContainer.appendChild(conditionsSection);

  // Lifehacks
  const lifehacksSection = createElement('div', 'foundation-detail-section');
  const lifehacksTitle = createElement('h4', 'foundation-detail-section-title', '活用処世術');
  const lifehacksTags = createElement('div', 'foundation-detail-tags');
  item.lifehacks.forEach((lifehack) => {
    const tag = createElement('span', 'foundation-detail-lifehack-tag', lifehack);
    lifehacksTags.appendChild(tag);
  });
  lifehacksSection.appendChild(lifehacksTitle);
  lifehacksSection.appendChild(lifehacksTags);
  sectionsContainer.appendChild(lifehacksSection);

  // Tags
  const tagsSection = createElement('div', 'foundation-detail-section');
  const tagsTitle = createElement('h4', 'foundation-detail-section-title', 'タグ');
  const tagsContainer = createElement('div', 'foundation-detail-tags');
  item.tags.forEach((tag) => {
    const tagEl = createElement('span', 'foundation-detail-tag', tag);
    tagsContainer.appendChild(tagEl);
  });
  tagsSection.appendChild(tagsTitle);
  tagsSection.appendChild(tagsContainer);
  sectionsContainer.appendChild(tagsSection);

  foundationDetailPanel.appendChild(backButton);
  foundationDetailPanel.appendChild(header);
  foundationDetailPanel.appendChild(sectionsContainer);

  // Hide the tablist and panels, show detail
  foundationPanels.hidden = true;
  document.querySelector('#foundation-tablist').hidden = true;
};

// Helper to create a detail section with text
const createDetailSection = (title, text) => {
  const section = createElement('div', 'foundation-detail-section');
  const sectionTitle = createElement('h4', 'foundation-detail-section-title', title);
  const sectionText = createElement('p', 'foundation-detail-section-text', text);
  section.appendChild(sectionTitle);
  section.appendChild(sectionText);
  return section;
};

// Helper to create a detail section with a list
const createDetailListSection = (title, items) => {
  const section = createElement('div', 'foundation-detail-section');
  const sectionTitle = createElement('h4', 'foundation-detail-section-title', title);
  const list = createElement('ul', 'foundation-detail-list');
  items.forEach((item) => {
    const li = createElement('li', null, item);
    list.appendChild(li);
  });
  section.appendChild(sectionTitle);
  section.appendChild(list);
  return section;
};

// Foundation card detail modal
const createFoundationDetailModal = () => {
  const modal = createElement('div', 'foundation-modal');
  modal.id = 'foundation-detail-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const overlay = createElement('div', 'foundation-modal__overlay');
  overlay.addEventListener('click', () => closeFoundationModal());

  const content = createElement('div', 'foundation-modal__content');
  content.id = 'foundation-modal-content';

  modal.appendChild(overlay);
  modal.appendChild(content);
  document.body.appendChild(modal);

  return modal;
};

const foundationModal = createFoundationDetailModal();

const closeFoundationModal = () => {
  foundationModal.hidden = true;
  document.body.style.overflow = '';
};

const openFoundationModal = (item) => {
  const content = document.querySelector('#foundation-modal-content');
  content.innerHTML = '';

  // Close button
  const closeBtn = createElement('button', 'foundation-modal__close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.addEventListener('click', closeFoundationModal);

  // Header
  const header = createElement('div', 'foundation-modal__header');
  const tagIdBadge = createElement('span', 'foundation-card__tag-id', item.tagId);
  const title = createElement('h3', 'foundation-modal__title', item.title);
  const summary = createElement('p', 'foundation-modal__summary', item.summary);
  header.appendChild(tagIdBadge);
  header.appendChild(title);
  header.appendChild(summary);

  // Sections
  const sectionsContainer = createElement('div', 'foundation-modal__sections');

  // Definition
  const defSection = createModalSection('定義', item.definition);
  sectionsContainer.appendChild(defSection);

  // Key Points
  const keyPointsSection = createModalListSection('要点', item.keyPoints);
  sectionsContainer.appendChild(keyPointsSection);

  // Pitfalls
  const pitfallsSection = createModalListSection('落とし穴', item.pitfalls);
  sectionsContainer.appendChild(pitfallsSection);

  // Strategies
  const strategiesSection = createModalListSection('戦略', item.strategies);
  sectionsContainer.appendChild(strategiesSection);

  // Application Conditions
  const conditionsSection = createModalListSection('適用条件', item.applicationConditions);
  sectionsContainer.appendChild(conditionsSection);

  // Lifehacks
  const lifehacksSection = createElement('div', 'foundation-modal__section');
  const lifehacksTitle = createElement('h4', 'foundation-modal__section-title', '活用処世術');
  const lifehacksTags = createElement('div', 'foundation-modal__tags');
  item.lifehacks.forEach((lifehack) => {
    const tag = createElement('span', 'foundation-modal__lifehack-tag', lifehack);
    lifehacksTags.appendChild(tag);
  });
  lifehacksSection.appendChild(lifehacksTitle);
  lifehacksSection.appendChild(lifehacksTags);
  sectionsContainer.appendChild(lifehacksSection);

  // Tags
  const tagsSection = createElement('div', 'foundation-modal__section');
  const tagsTitle = createElement('h4', 'foundation-modal__section-title', 'タグ');
  const tagsContainer = createElement('div', 'foundation-modal__tags');
  item.tags.forEach((tag) => {
    const tagEl = createElement('span', 'foundation-modal__tag', tag);
    tagsContainer.appendChild(tagEl);
  });
  tagsSection.appendChild(tagsTitle);
  tagsSection.appendChild(tagsContainer);
  sectionsContainer.appendChild(tagsSection);

  content.appendChild(closeBtn);
  content.appendChild(header);
  content.appendChild(sectionsContainer);

  foundationModal.hidden = false;
  document.body.style.overflow = 'hidden';
};

const createModalSection = (title, text) => {
  const section = createElement('div', 'foundation-modal__section');
  const sectionTitle = createElement('h4', 'foundation-modal__section-title', title);
  const sectionText = createElement('p', 'foundation-modal__section-text', text);
  section.appendChild(sectionTitle);
  section.appendChild(sectionText);
  return section;
};

const createModalListSection = (title, items) => {
  const section = createElement('div', 'foundation-modal__section');
  const sectionTitle = createElement('h4', 'foundation-modal__section-title', title);
  const list = createElement('ul', 'foundation-modal__list');
  items.forEach((item) => {
    const li = createElement('li', null, item);
    list.appendChild(li);
  });
  section.appendChild(sectionTitle);
  section.appendChild(list);
  return section;
};

// Create a foundation card element
const createFoundationCard = (item) => {
  const cardTag = item.pageUrl ? 'a' : 'article';
  const card = createElement(cardTag, 'foundation-card');
  if (item.pageUrl) {
    card.href = item.pageUrl;
  } else {
    card.addEventListener('click', () => showFoundationDetail(item));
  }

  const tagId = createElement('span', 'foundation-card__tag-id', item.tagId);
  const content = createElement('div', 'foundation-card__content');
  const title = createElement('h3', 'foundation-card__title', item.title);
  const summary = createElement('p', 'foundation-card__summary', item.summary);

  content.appendChild(title);
  content.appendChild(summary);
  card.appendChild(tagId);
  card.appendChild(content);

  return card;
};

// Render foundation cards in a grid
const renderFoundationCards = (container, items) => {
  container.innerHTML = '';
  const grid = createElement('div', 'foundation-cards-grid');
  items.forEach((item) => {
    const card = createFoundationCard(item);
    grid.appendChild(card);
  });
  container.appendChild(grid);
};

if (foundationTabList && foundationPanels && foundationCategories.length > 0) {
  const foundationTabs = [];
  const panelList = [];

  const setActiveFoundationTab = (tab) => {
    const targetId = tab.getAttribute('aria-controls');
    if (!targetId) {
      console.warn('Foundation tab missing aria-controls attribute.', tab);
      return;
    }

    foundationTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panelList.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.toggleAttribute('hidden', !isActive);
    });
  };

  // Create "索引" (Index) tab first
  const indexTabButton = createElement('button', 'subtab is-active');
  indexTabButton.type = 'button';
  indexTabButton.id = 'foundation-tab-index';
  indexTabButton.setAttribute('role', 'tab');
  indexTabButton.setAttribute('aria-selected', 'true');
  indexTabButton.setAttribute('aria-controls', 'foundation-panel-index');
  indexTabButton.setAttribute('tabindex', '0');
  indexTabButton.textContent = '索引';

  const indexPanel = createElement('div', 'foundation-panel');
  indexPanel.id = 'foundation-panel-index';
  indexPanel.setAttribute('role', 'tabpanel');
  indexPanel.setAttribute('aria-labelledby', 'foundation-tab-index');

  // Search container
  const searchContainer = createElement('div', 'foundation-search');
  const searchInput = createElement('input', 'foundation-search__input');
  searchInput.type = 'text';
  searchInput.placeholder = '思想カードを検索（タイトル、タグ、処世術など）...';
  searchInput.setAttribute('aria-label', '思想カード検索');

  const searchResultsCount = createElement('div', 'foundation-search__count');
  searchResultsCount.id = 'foundation-search-count';

  const searchResults = createElement('div', 'foundation-search__results');
  searchResults.id = 'foundation-search-results';

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchResultsCount);
  indexPanel.appendChild(searchContainer);
  indexPanel.appendChild(searchResults);

  // Initialize search results with all items
  const allItems = getAllFoundationItems();
  renderFoundationCards(searchResults, allItems);
  searchResultsCount.textContent = `全 ${allItems.length} 件`;

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const results = searchFoundationItems(query);
    renderFoundationCards(searchResults, results);
    if (query.trim()) {
      searchResultsCount.textContent = `${results.length} 件見つかりました`;
    } else {
      searchResultsCount.textContent = `全 ${results.length} 件`;
    }
  });

  foundationTabList.appendChild(indexTabButton);
  foundationPanels.appendChild(indexPanel);
  foundationTabs.push(indexTabButton);
  panelList.push(indexPanel);

  // Create category tabs
  foundationCategories.forEach((section) => {
    const tabButton = createElement('button', 'subtab');
    tabButton.type = 'button';
    tabButton.id = `foundation-tab-${section.id}`;
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-selected', 'false');
    tabButton.setAttribute('aria-controls', `foundation-panel-${section.id}`);
    tabButton.setAttribute('tabindex', '-1');
    tabButton.textContent = section.title;

    const panel = createElement('div', 'foundation-panel');
    panel.id = `foundation-panel-${section.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabButton.id);
    panel.hidden = true;

    // Render cards for this category
    renderFoundationCards(panel, section.items);

    foundationTabList.appendChild(tabButton);
    foundationPanels.appendChild(panel);
    foundationTabs.push(tabButton);
    panelList.push(panel);
  });

  foundationTabs.forEach((tabButton) => {
    tabButton.addEventListener('click', () => setActiveFoundationTab(tabButton));
    addTabKeyboardNavigation(foundationTabs, tabButton, setActiveFoundationTab);
  });

  // Append the foundation detail panel after the panels
  foundationPanels.parentElement.appendChild(foundationDetailPanel);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !foundationModal.hidden) {
    closeFoundationModal();
  }
});
