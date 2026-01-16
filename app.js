const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));

const activateTab = (tab) => {
  const targetId = tab.getAttribute('aria-controls');
  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('is-active', isActive);
    panel.toggleAttribute('hidden', !isActive);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
});

const hash = window.location.hash.replace('#', '');
if (hash) {
  const tab = tabs.find((item) => item.getAttribute('aria-controls') === hash);
  if (tab) {
    activateTab(tab);
  }
}
