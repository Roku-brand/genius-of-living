import { featuredTechniques } from './data/featured-techniques.js';
import { techniquesData } from './data/techniques.js';
import { hubTechniques } from './data/hub-techniques.js';
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

const techniqueOrder = [];

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

  techniqueDetailPanel.appendChild(nav);
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
    const categoryKey = getCategoryKey(category.title);
    const row = createElement('article', 'technique-row');
    row.dataset.category = categoryKey;
    const title = createElement('h3', 'technique-row__title', `≪${category.title}≫`);
    const list = createElement('ul', 'technique-buttons');

    category.items.forEach((item, index) => {
      const techniqueIndex = techniqueOrder.length;
      techniqueOrder.push({ item, categoryKey });
      const listItem = createElement('li');
      const itemNumber = String(index + 1).padStart(2, '0');
      const buttonText = `${itemNumber}. ${item.name}（${item.details.length}）`;
      const button = createElement('button', 'technique-tag', buttonText);
      button.type = 'button';
      button.dataset.category = categoryKey;
      button.addEventListener('click', () => showTechniqueDetail(item, categoryKey, techniqueIndex));
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
const hubFolderList = document.querySelector('#hub-folder-list');
const hubPostButtons = Array.from(document.querySelectorAll('.hub-post-button'));

// Foundation detail panel for page-style navigation
const foundationDetailPanel = createElement('div', 'foundation-detail-panel');
foundationDetailPanel.id = 'foundation-detail-panel';
foundationDetailPanel.hidden = true;

const formatHubTimestamp = (date) =>
  date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

const getHubScore = (item) =>
  item.rating.up - item.rating.down + item.comments.length * 0.5;

const createHubPostModal = () => {
  const modal = createElement('div', 'hub-modal');
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', '処世術投稿フォーム');

  const overlay = createElement('div', 'hub-modal__overlay');
  const content = createElement('div', 'hub-modal__content');

  const header = createElement('div', 'hub-modal__header');
  const title = createElement('h3', 'hub-modal__title', '処世術を投稿する');
  const description = createElement(
    'p',
    'hub-modal__desc',
    'フォルダー単位で処世術をまとめて投稿できます。',
  );
  header.appendChild(title);
  header.appendChild(description);

  const form = createElement('form', 'hub-post-form');
  const titleLabel = createElement('label', 'hub-post-form__label');
  titleLabel.textContent = 'タイトル';
  const titleInput = createElement('input', 'hub-post-form__input');
  titleInput.type = 'text';
  titleInput.name = 'title';
  titleInput.placeholder = '例：ストレスを受け流す処世術';
  titleInput.required = true;

  const categoryLabel = createElement('label', 'hub-post-form__label');
  categoryLabel.textContent = 'カテゴリ';
  const categoryInput = createElement('input', 'hub-post-form__input');
  categoryInput.type = 'text';
  categoryInput.name = 'category';
  categoryInput.placeholder = '例：思考術';
  categoryInput.required = true;
  categoryInput.setAttribute('list', 'hub-category-options');

  const categoryDatalist = document.createElement('datalist');
  categoryDatalist.id = 'hub-category-options';

  const summaryLabel = createElement('label', 'hub-post-form__label');
  summaryLabel.textContent = '概要';
  const summaryInput = document.createElement('textarea');
  summaryInput.className = 'hub-post-form__textarea';
  summaryInput.name = 'summary';
  summaryInput.placeholder = '処世術の狙いや背景を簡潔にまとめる';
  summaryInput.required = true;

  const itemsLabel = createElement('label', 'hub-post-form__label');
  itemsLabel.textContent = '処世術リスト（1行につき1項目）';
  const itemsInput = document.createElement('textarea');
  itemsInput.className = 'hub-post-form__textarea';
  itemsInput.name = 'items';
  itemsInput.placeholder = '例：\n感情が動いたら5秒待つ\n状況を言語化して距離を取る';
  itemsInput.required = true;

  const formActions = createElement('div', 'hub-post-form__actions');
  const cancelButton = createElement('button', 'hub-post-form__cancel', 'キャンセル');
  cancelButton.type = 'button';
  const submitButton = createElement('button', 'hub-post-form__submit', '投稿する');
  submitButton.type = 'submit';
  formActions.appendChild(cancelButton);
  formActions.appendChild(submitButton);

  titleLabel.appendChild(titleInput);
  categoryLabel.appendChild(categoryInput);
  summaryLabel.appendChild(summaryInput);
  itemsLabel.appendChild(itemsInput);

  form.appendChild(titleLabel);
  form.appendChild(categoryLabel);
  form.appendChild(categoryDatalist);
  form.appendChild(summaryLabel);
  form.appendChild(itemsLabel);
  form.appendChild(formActions);

  content.appendChild(header);
  content.appendChild(form);
  modal.appendChild(overlay);
  modal.appendChild(content);
  document.body.appendChild(modal);

  const refreshCategoryOptions = () => {
    categoryDatalist.innerHTML = '';
    const uniqueCategories = Array.from(new Set(hubTechniques.map((item) => item.category))).sort();
    uniqueCategories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      categoryDatalist.appendChild(option);
    });
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  const openModal = () => {
    refreshCategoryOptions();
    form.reset();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    titleInput.focus();
  };

  overlay.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const titleValue = titleInput.value.trim();
    const categoryValue = categoryInput.value.trim();
    const summaryValue = summaryInput.value.trim();
    const itemsValue = itemsInput.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!titleValue || !categoryValue || !summaryValue || itemsValue.length === 0) {
      return;
    }

    hubTechniques.unshift({
      id: `hub-${Date.now()}`,
      title: titleValue,
      summary: summaryValue,
      category: categoryValue,
      items: itemsValue,
      rating: { up: 0, down: 0 },
      comments: [],
      isExpanded: false,
      areCommentsExpanded: false,
    });

    renderHubFolders();
    closeModal();
  });

  return { modal, openModal, closeModal };
};

const hubPostModalEnabled = false;
let hubPostModal = null;

if (hubPostModalEnabled) {
  hubPostModal = createHubPostModal();
  if (hubPostButtons.length) {
    hubPostButtons.forEach((button) => {
      button.addEventListener('click', () => {
        hubPostModal.openModal();
      });
    });
  }
} else if (hubPostButtons.length) {
  hubPostButtons.forEach((button) => {
    button.hidden = true;
    button.setAttribute('aria-hidden', 'true');
  });
}

const createHubCommentCard = (comment) => {
  const card = createElement('div', 'hub-comment');
  const header = createElement('div', 'hub-comment__header');
  const author = createElement('span', 'hub-comment__author', comment.author);
  const timestamp = createElement('span', 'hub-comment__time', comment.timestamp);
  const body = createElement('p', 'hub-comment__text', comment.text);

  header.appendChild(author);
  header.appendChild(timestamp);
  card.appendChild(header);
  card.appendChild(body);
  return card;
};

const createHubFolderCard = (item, onUpdate) => {
  const isExpanded = item.isExpanded ?? false;
  const areCommentsExpanded = item.areCommentsExpanded ?? false;
  const card = createElement('article', 'hub-folder');
  const header = createElement('div', 'hub-folder__header');
  const titleButton = createElement('button', 'hub-folder__title-button', item.title);
  titleButton.type = 'button';
  titleButton.setAttribute('aria-expanded', String(isExpanded));

  const details = createElement('div', 'hub-folder__details');
  details.id = `hub-folder-details-${item.id}`;
  details.hidden = !isExpanded;
  titleButton.setAttribute('aria-controls', details.id);

  const detailsHeader = createElement('div', 'hub-folder__details-header');
  const category = createElement('p', 'hub-folder__category', item.category);
  const summary = createElement('p', 'hub-folder__summary', item.summary);
  const meta = createElement('div', 'hub-folder__meta');
  const count = createElement('span', 'hub-folder__meta-item', `処世術 ${item.items.length}`);
  const score = createElement('span', 'hub-folder__meta-item', `評価 ${getHubScore(item).toFixed(1)}`);
  const comments = createElement('span', 'hub-folder__meta-item', `コメント ${item.comments.length}`);

  meta.appendChild(count);
  meta.appendChild(score);
  meta.appendChild(comments);

  detailsHeader.appendChild(category);
  detailsHeader.appendChild(summary);
  detailsHeader.appendChild(meta);

  const itemList = createElement('ul', 'hub-folder__items');
  item.items.forEach((itemTitle, index) => {
    const listItem = createElement('li', 'hub-folder__item', `${String(index + 1).padStart(2, '0')}. ${itemTitle}`);
    itemList.appendChild(listItem);
  });

  const actions = createElement('div', 'hub-folder__actions');
  const ratingGroup = createElement('div', 'hub-rating');
  const ratingLabel = createElement('span', 'hub-rating__label', '評価');
  const upButton = createElement('button', 'hub-rating__button hub-rating__button--up', '👍 有用');
  const downButton = createElement('button', 'hub-rating__button hub-rating__button--down', '👎 検討');
  const ratingScore = createElement('span', 'hub-rating__score', `スコア ${getHubScore(item).toFixed(1)}`);

  upButton.type = 'button';
  downButton.type = 'button';

  upButton.addEventListener('click', () => {
    item.rating.up += 1;
    onUpdate();
  });

  downButton.addEventListener('click', () => {
    item.rating.down += 1;
    onUpdate();
  });

  ratingGroup.appendChild(ratingLabel);
  ratingGroup.appendChild(upButton);
  ratingGroup.appendChild(downButton);
  ratingGroup.appendChild(ratingScore);

  const commentForm = createElement('form', 'hub-comment-form');
  const commentLabel = createElement('label', 'hub-comment-form__label', 'コメント');
  const commentInput = document.createElement('textarea');
  commentInput.className = 'hub-comment-form__textarea';
  commentInput.placeholder = 'この処世術の活用感や改善点を記入...';
  commentInput.required = true;
  const commentButton = createElement('button', 'hub-comment-form__button', '投稿');
  commentButton.type = 'submit';

  commentLabel.appendChild(commentInput);
  commentForm.appendChild(commentLabel);
  commentForm.appendChild(commentButton);

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = commentInput.value.trim();
    if (!text) {
      return;
    }
    item.comments.unshift({
      author: '匿名',
      text,
      timestamp: formatHubTimestamp(new Date()),
    });
    item.areCommentsExpanded = true;
    commentInput.value = '';
    onUpdate();
  });

  actions.appendChild(ratingGroup);
  actions.appendChild(commentForm);

  const commentControls = createElement('div', 'hub-comments__header');
  const commentTitle = createElement('span', 'hub-comments__title', `コメント一覧（${item.comments.length}）`);
  const commentToggle = createElement(
    'button',
    'hub-comments__toggle',
    areCommentsExpanded ? 'コメントを隠す' : 'コメントを表示',
  );
  commentToggle.type = 'button';
  commentToggle.setAttribute('aria-expanded', String(areCommentsExpanded));
  commentControls.appendChild(commentTitle);
  commentControls.appendChild(commentToggle);

  const commentList = createElement('div', 'hub-comments');
  commentList.hidden = !areCommentsExpanded;
  item.comments.forEach((comment) => {
    commentList.appendChild(createHubCommentCard(comment));
  });

  card.appendChild(header);
  header.appendChild(titleButton);
  details.appendChild(detailsHeader);
  details.appendChild(itemList);
  details.appendChild(actions);
  details.appendChild(commentControls);
  details.appendChild(commentList);
  card.appendChild(details);

  titleButton.addEventListener('click', () => {
    const nextState = !details.hidden;
    details.hidden = nextState;
    titleButton.setAttribute('aria-expanded', String(!nextState));
    item.isExpanded = !nextState;
  });

  commentToggle.addEventListener('click', () => {
    const nextState = !commentList.hidden;
    commentList.hidden = nextState;
    commentToggle.textContent = nextState ? 'コメントを表示' : 'コメントを隠す';
    commentToggle.setAttribute('aria-expanded', String(!nextState));
    item.areCommentsExpanded = !nextState;
  });

  return card;
};

const renderHubFolders = () => {
  if (!hubFolderList || !isDataReady(hubTechniques, hubFolderList)) {
    return;
  }
  hubFolderList.innerHTML = '';
  const sorted = [...hubTechniques].sort((a, b) => {
    const scoreDiff = getHubScore(b) - getHubScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return b.rating.up - a.rating.up;
  });
  sorted.forEach((item) => {
    hubFolderList.appendChild(createHubFolderCard(item, renderHubFolders));
  });
};

renderHubFolders();

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
  if (e.key === 'Escape' && !hubPostModal.modal.hidden) {
    hubPostModal.closeModal();
  }
});
