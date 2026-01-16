const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));

const activateTab = (tab, { updateHash = false } = {}) => {
  const targetId = tab.getAttribute('aria-controls');
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

  if (updateHash) {
    window.location.hash = targetId;
  }
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab, { updateHash: true }));
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
