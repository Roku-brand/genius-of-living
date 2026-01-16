import { techniquesData } from './data/techniques.js';
import { foundationData } from './data/foundation.js';

const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));

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

if (tabs.length && panels.length) {
  const activateTab = (tab, { updateHash = false } = {}) => {
    const targetId = tab.getAttribute('aria-controls');
    if (!targetId) {
      return;
    }
    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle('is-active', isActive);
      panel.toggleAttribute('hidden', !isActive);
    });

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
    const foundationLabel = createElement('p', 'technique-detail-foundation-label', '判断基盤');
    const foundationTags = createElement('div', 'technique-detail-foundations');
    detail.foundations.forEach((f) => {
      const tag = createElement('span', 'foundation-tag', f);
      foundationTags.appendChild(tag);
    });

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

if (isDataReady(techniquesData, techniquesList)) {
  techniquesData.forEach((category) => {
    const row = createElement('article', 'technique-row');
    const title = createElement('h3', 'technique-row__title', category.title);
    const list = createElement('ul', 'technique-buttons');

    category.items.forEach((item) => {
      const listItem = createElement('li');
      const buttonText = `${item.name}（${item.details.length}）`;
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

if (isDataReady(foundationData, foundationTabList, foundationPanels)) {
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

  foundationData.forEach((section, index) => {
    const tabButton = createElement('button', 'subtab');
    tabButton.type = 'button';
    if (index === 0) {
      tabButton.classList.add('is-active');
    }
    tabButton.id = `foundation-tab-${section.id}`;
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabButton.setAttribute('aria-controls', `foundation-panel-${section.id}`);
    tabButton.setAttribute('tabindex', index === 0 ? '0' : '-1');
    tabButton.textContent = section.title;

    const panel = createElement('div', 'foundation-panel');
    panel.id = `foundation-panel-${section.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabButton.id);
    if (index !== 0) {
      panel.hidden = true;
    }

    const grid = createElement('div', 'grid two');

    section.items.forEach((item) => {
      const card = createElement('article', 'card');
      const title = createElement('h3', null, item.title);
      const description = createElement('p', null, item.description);
      card.appendChild(title);
      card.appendChild(description);
      grid.appendChild(card);
    });

    panel.appendChild(grid);
    foundationTabList.appendChild(tabButton);
    foundationPanels.appendChild(panel);
    foundationTabs.push(tabButton);
    panelList.push(panel);
  });

  foundationTabs.forEach((tabButton) => {
    tabButton.addEventListener('click', () => setActiveFoundationTab(tabButton));
    addTabKeyboardNavigation(foundationTabs, tabButton, setActiveFoundationTab);
  });
}
