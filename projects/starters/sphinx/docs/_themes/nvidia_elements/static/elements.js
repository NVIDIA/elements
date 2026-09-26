const storageKey = 'nve-docs-theme';
const root = document.documentElement;
const navigation = document.querySelector('#primary-navigation');
const navigationToggle = document.querySelector('.navigation-toggle');
const navigationBackdrop = document.querySelector('.navigation-backdrop');
const themeToggle = document.querySelector('.theme-toggle');
const pygmentsDarkStylesheet = document.querySelector('#pygments_dark_css');
const desktopNavigation = matchMedia('(min-width: 64rem)');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.getAttribute('nve-theme') === 'dark' ? 'dark' : 'light';
}

function updateThemeButton() {
  if (!themeToggle) return;
  const dark = currentTheme() === 'dark';
  themeToggle.setAttribute('icon-name', dark ? 'sun' : 'moon');
  themeToggle.setAttribute('aria-label', dark ? 'Use light color scheme' : 'Use dark color scheme');
}

function setTheme(theme) {
  root.setAttribute('nve-theme', theme);
  if (pygmentsDarkStylesheet) pygmentsDarkStylesheet.media = theme === 'dark' ? 'all' : 'not all';
  updateThemeButton();
}

function navigationFocusTargets() {
  return [navigationToggle, ...navigation.querySelectorAll('a[href]')].filter(Boolean);
}

function setNavigationOpen(open) {
  if (!navigation || !navigationToggle || !navigationBackdrop) return;
  const mobileOpen = open && !desktopNavigation.matches;
  navigation.hidden = !mobileOpen && !desktopNavigation.matches;
  navigationBackdrop.hidden = !mobileOpen;
  navigationToggle.setAttribute('aria-expanded', String(mobileOpen));
  navigationToggle.setAttribute(
    'aria-label',
    mobileOpen ? 'Close documentation navigation' : 'Open documentation navigation'
  );
  document.body.classList.toggle('navigation-open', mobileOpen);
  if (mobileOpen) (navigation.querySelector('a') ?? navigationToggle).focus();
}

themeToggle?.addEventListener('click', () => {
  const theme = currentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  localStorage.setItem(storageKey, theme);
});

navigationToggle?.addEventListener('click', () => {
  setNavigationOpen(navigationToggle.getAttribute('aria-expanded') !== 'true');
});

navigationBackdrop?.addEventListener('click', () => setNavigationOpen(false));

document.addEventListener('keydown', event => {
  if (navigationToggle?.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') {
    setNavigationOpen(false);
    navigationToggle.focus();
  }
  if (event.key === 'Tab') {
    const targets = navigationFocusTargets();
    const currentIndex = targets.indexOf(document.activeElement);
    const offset = event.shiftKey ? -1 : 1;
    const nextIndex = (currentIndex + offset + targets.length) % targets.length;
    event.preventDefault();
    targets[nextIndex]?.focus();
  }
});

desktopNavigation.addEventListener('change', () => setNavigationOpen(false));
document.querySelectorAll('.caption[role="heading"]').forEach(caption => caption.setAttribute('aria-level', '2'));
document.querySelectorAll('.highlight').forEach(codeBlock => codeBlock.setAttribute('tabindex', '0'));
systemTheme.addEventListener('change', event => {
  if (!localStorage.getItem(storageKey)) {
    setTheme(event.matches ? 'dark' : 'light');
  }
});
setTheme(currentTheme());
setNavigationOpen(false);
