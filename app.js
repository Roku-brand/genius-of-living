import { featuredTechniques } from './data/featured-techniques.js';
import { techniquesData } from './data/techniques.js';
import {
  foundationCategories,
  getAllFoundationItems,
  searchFoundationItems,
} from './data/foundation/index.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('Service worker registration failed.', error);
    });
  });
}

const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));
const mobileNavItems = Array.from(document.querySelectorAll('.mobile-nav__item'));

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

const showTechniqueDetail = (technique) => {
  techniqueDetailPanel.innerHTML = '';
  techniqueDetailPanel.hidden = false;

  const backButton = createElement('button', 'technique-back-button', '← 一覧に戻る');
  backButton.type = 'button';
  backButton.addEventListener('click', () => {
    techniqueDetailPanel.hidden = true;
    techniquesList.hidden = false;
  });

  const header = createElement('div', 'technique-detail-header');
  const titleEl = createElement('h3', 'technique-detail-title', `${technique.name}（${technique.details.length}）`);
  header.appendChild(titleEl);

  const grid = createElement('div', 'technique-detail-grid');

  technique.details.forEach((detail) => {
    const card = createElement('article', 'technique-detail-card');
    
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
          navigateToFoundation(f);
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

  techniqueDetailPanel.appendChild(backButton);
  techniqueDetailPanel.appendChild(header);
  techniqueDetailPanel.appendChild(grid);
  techniquesList.hidden = true;
};

// Navigate to a foundation item by tagId
const TAB_SWITCH_DELAY = 100;

const navigateToFoundation = (tagId) => {
  // Find the foundation item
  const allItems = getAllFoundationItems();
  const foundationItem = allItems.find((item) => item.tagId === tagId);

  if (!foundationItem) {
    console.warn(`Foundation item with tagId "${tagId}" not found.`);
    return;
  }

  // Switch to foundation tab
  const foundationTab = tabs.find((tab) => tab.getAttribute('aria-controls') === 'tab-foundation');
  if (foundationTab) {
    foundationTab.click();
  }

  // Show the foundation detail panel after a short delay to allow tab switch
  setTimeout(() => {
    showFoundationDetail(foundationItem);
  }, TAB_SWITCH_DELAY);
};

if (isDataReady(techniquesData, techniquesList)) {
  techniquesData.forEach((category) => {
    const row = createElement('article', 'technique-row');
    const title = createElement('h3', 'technique-row__title', `≪${category.title}≫`);
    const list = createElement('ul', 'technique-buttons');

    category.items.forEach((item, index) => {
      const listItem = createElement('li');
      const itemNumber = String(index + 1).padStart(2, '0');
      const buttonText = `${itemNumber}. ${item.name}（${item.details.length}）`;
      const button = createElement('button', 'technique-tag', buttonText);
      button.type = 'button';
      button.addEventListener('click', () => showTechniqueDetail(item));
      listItem.appendChild(button);
      list.appendChild(listItem);
    });

    row.appendChild(title);
    row.appendChild(list);
    techniquesList.appendChild(row);
  });

  techniquesList.parentElement.appendChild(techniqueDetailPanel);
}

const foundationTabList = document.querySelector('#foundation-tablist');
const foundationPanels = document.querySelector('#foundation-tabpanels');

// Foundation detail panel for page-style navigation
const foundationDetailPanel = createElement('div', 'foundation-detail-panel');
foundationDetailPanel.id = 'foundation-detail-panel';
foundationDetailPanel.hidden = true;

const mypageTabs = Array.from(document.querySelectorAll('#mypage-tablist .subtab'));
const mypagePanels = Array.from(document.querySelectorAll('.mypage-panel'));

if (mypageTabs.length && mypagePanels.length) {
  mypageTabs.forEach((tab) => {
    tab.addEventListener('click', () => setTabActiveState(mypageTabs, mypagePanels, tab));
    addTabKeyboardNavigation(mypageTabs, tab, (currentTab) =>
      setTabActiveState(mypageTabs, mypagePanels, currentTab),
    );
  });
}

// Show foundation detail in a page-style panel (like technique detail)
const showFoundationDetail = (item) => {
  foundationDetailPanel.innerHTML = '';
  foundationDetailPanel.hidden = false;

  const backButton = createElement('button', 'foundation-back-button', '← 一覧に戻る');
  backButton.type = 'button';
  backButton.addEventListener('click', () => {
    foundationDetailPanel.hidden = true;
    foundationPanels.hidden = false;
    document.querySelector('#foundation-tablist').hidden = false;
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
  const card = createElement('article', 'foundation-card');
  card.addEventListener('click', () => showFoundationDetail(item));

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
