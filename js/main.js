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

// Hero thumbnail parallax — rise from below on scroll
(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || typeof gsap === 'undefined') return;

  const thumbs = gsap.utils.toArray('.hero-thumb');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!thumbs.length) return;

  if (reduceMotion) {
    gsap.set(thumbs, { y: 0, x: 0, rotation: 0 });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const riseThroughHero = (pinEnd) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: pinEnd,
        pin: true,
        pinSpacing: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    const sequence = thumbs.slice().sort((a, b) => {
      return (Number(a.dataset.order) || 0) - (Number(b.dataset.order) || 0);
    });

    sequence.forEach((thumb, i) => {
      const from = parseFloat(thumb.dataset.from) || (0.9 + i * 0.08);
      const to = parseFloat(thumb.dataset.to) || -1;
      const xMove = parseFloat(thumb.dataset.x) || 0;
      const rotate = parseFloat(thumb.dataset.rotate) || 0;

      tl.fromTo(thumb, {
        y: () => window.innerHeight * from,
        x: 0,
        rotation: 0
      }, {
        y: () => window.innerHeight * to,
        x: xMove,
        rotation: rotate,
        duration: 1,
        ease: 'none'
      }, i * 0.32);
    });

    return () => tl.kill();
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 641px)', () => riseThroughHero('+=240%'));
  mm.add('(max-width: 640px)', () => riseThroughHero('+=150%'));
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
