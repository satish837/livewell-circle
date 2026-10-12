// Nav solid background on scroll + active section highlight
const nav = document.getElementById('siteNav');
const navSectionIds = ['manifesto', 'partners', 'contact'];
const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]');

function setActiveNavLink() {
  const headerOffset = 120;
  const scrollPos = window.scrollY + headerOffset;
  let currentId = '';

  navSectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section && scrollPos >= section.offsetTop) {
      currentId = id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', currentId !== '' && link.hash === `#${currentId}`);
  });
}

function onScroll() {
  nav.classList.toggle('solid', window.scrollY > 60);
  setActiveNavLink();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('hashchange', setActiveNavLink);
window.addEventListener('load', setActiveNavLink);
onScroll();

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const headerOffset = nav?.offsetHeight || 96;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: 'smooth' });
  history.pushState(null, '', `#${id}`);
  setActiveNavLink();
}

const mobileNav = document.getElementById('mobileNav');
document.querySelectorAll('#mobileNav .mobile-nav-links a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    event.preventDefault();
    const sectionId = hash.slice(1);
    const offcanvas = mobileNav ? bootstrap.Offcanvas.getInstance(mobileNav) : null;

    if (offcanvas) {
      mobileNav.addEventListener('hidden.bs.offcanvas', () => {
        scrollToSection(sectionId);
      }, { once: true });
      offcanvas.hide();
    } else {
      scrollToSection(sectionId);
    }
  });
});

// Residences — petals drift into place, same motion as the Max Estates well-being footer
(function initResidencesPetals() {
  const section = document.querySelector('.residences');
  if (!section) return;

  const petal1 = section.querySelector('.residences-petal--1');
  const petal2 = section.querySelector('.residences-petal--2');
  const petal3 = section.querySelector('.residences-petal--3');
  const petals = [petal1, petal2, petal3].filter(Boolean);
  if (!petals.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const showFinal = () => {
    petals.forEach((petal) => {
      petal.style.opacity = '1';
      petal.style.transform = 'none';
    });
    if (petal2) petal2.style.transform = 'rotate(34deg)';
  };

  if (reduceMotion || typeof gsap === 'undefined') {
    showFinal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(petal1, { autoAlpha: 0, y: -260, rotation: -28, scale: 0.82, transformOrigin: '50% 50%' });
  gsap.set(petal2, { autoAlpha: 0, y: -320, rotation: -30, scale: 0.78, transformOrigin: '50% 50%' });
  gsap.set(petal3, { autoAlpha: 0, y: -380, rotation: -38, scale: 0.88, transformOrigin: '50% 50%' });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 50%',
      toggleActions: 'play none none none',
      once: true
    }
  });

  timeline
    .to(petal1, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 2.2, ease: 'power3.out' })
    .to(petal2, { autoAlpha: 1, y: 0, rotation: 34, scale: 1, duration: 2.2, ease: 'power3.out' }, '-=1.75')
    .to(petal3, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 2.2, ease: 'power3.out' }, '-=1.75');
})();

// Initialize AOS
AOS.init({
  duration: 900,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80,
  disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});

// Partner tabs + mobile dropdown
const partnerTabs = document.getElementById('partnerTabs');
const partnerDropdown = document.getElementById('partnerDropdown');
const partnerDropdownToggle = document.getElementById('partnerDropdownToggle');
const partnerDropdownMenu = document.getElementById('partnerDropdownMenu');
const partnerDropdownLabel = document.getElementById('partnerDropdownLabel');
const tabButtons = partnerTabs ? [...partnerTabs.querySelectorAll('[data-bs-toggle="tab"]')] : [];

function getActiveTabButton() {
  return tabButtons.find(btn => btn.classList.contains('active')) || tabButtons[1];
}

function updatePartnerDropdownLabel(button = getActiveTabButton()) {
  if (!partnerDropdownLabel || !button) return;
  partnerDropdownLabel.textContent = button.textContent.trim();
  partnerDropdownMenu?.querySelectorAll('.partner-dropdown-item').forEach(item => {
    item.classList.toggle('is-selected', item.dataset.tabId === button.id);
  });
}

function closePartnerDropdown() {
  partnerDropdown?.classList.remove('is-open');
  partnerDropdownToggle?.setAttribute('aria-expanded', 'false');
}

function openPartnerDropdown() {
  partnerDropdown?.classList.add('is-open');
  partnerDropdownToggle?.setAttribute('aria-expanded', 'true');
}

if (partnerDropdownMenu && tabButtons.length) {
  partnerDropdownMenu.innerHTML = tabButtons.map(btn => `
    <li role="presentation">
      <button type="button" class="partner-dropdown-item${btn.classList.contains('active') ? ' is-selected' : ''}"
        role="option" data-tab-id="${btn.id}" data-bs-target="${btn.getAttribute('data-bs-target')}">
        ${btn.textContent.trim()}
      </button>
    </li>
  `).join('');

  partnerDropdownMenu.addEventListener('click', (event) => {
    const item = event.target.closest('.partner-dropdown-item');
    if (!item) return;

    const tabButton = document.getElementById(item.dataset.tabId);
    if (!tabButton) return;

    bootstrap.Tab.getOrCreateInstance(tabButton).show();
    closePartnerDropdown();
  });

  partnerDropdownToggle?.addEventListener('click', () => {
    if (partnerDropdown.classList.contains('is-open')) {
      closePartnerDropdown();
    } else {
      openPartnerDropdown();
    }
  });

  document.addEventListener('click', (event) => {
    if (!partnerDropdown?.contains(event.target)) {
      closePartnerDropdown();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePartnerDropdown();
  });
}

tabButtons.forEach(tab => {
  tab.addEventListener('shown.bs.tab', () => {
    updatePartnerDropdownLabel(tab);
    AOS.refresh();
  });
});

updatePartnerDropdownLabel();
