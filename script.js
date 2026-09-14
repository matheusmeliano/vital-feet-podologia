const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const header = document.querySelector('.site-header');
const headerCta = document.querySelector('.header-cta');

const headerMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let headerFrame = 0;
let headerTimer = 0;
let headerLeaving = false;
let previousHeaderScroll = window.scrollY;

function finishHeaderExit() {
  if (!headerLeaving) return;
  clearTimeout(headerTimer);
  headerLeaving = false;
  header.classList.add('is-resetting');
  header.classList.remove('is-visible', 'is-fixed');
  document.body.classList.remove('has-fixed-header');
  // When returning directly to the top, fade the normal header back in.
  header.classList.toggle('is-returning', window.scrollY < header.offsetHeight && !headerMotion.matches);
  requestAnimationFrame(() => {
    header.classList.remove('is-resetting');
    requestAnimationFrame(() => header.classList.remove('is-returning'));
  });
}

function updateFixedHeader() {
  const fixed = header.classList.contains('is-fixed');
  const scrollPosition = Math.max(0, window.scrollY);
  const scrollingUp = scrollPosition < previousHeaderScroll;
  previousHeaderScroll = scrollPosition;
  // Keep the header available while returning to the top.
  const shouldFix = scrollPosition > 0 && (fixed || scrollingUp || scrollPosition > 250);
  if (fixed && scrollPosition === 0) {
    clearTimeout(headerTimer);
    headerLeaving = false;
    header.classList.add('is-resetting');
    header.classList.remove('is-fixed', 'is-visible', 'is-returning');
    document.body.classList.remove('has-fixed-header');
    requestAnimationFrame(() => header.classList.remove('is-resetting'));
    return;
  }
  if (shouldFix) {
    clearTimeout(headerTimer);
    headerLeaving = false;
    if (!fixed) {
      header.classList.add('is-resetting', 'is-fixed');
      document.body.classList.add('has-fixed-header');
      header.getBoundingClientRect();
      header.classList.remove('is-resetting');
    }
    header.classList.add('is-visible');
  } else if (fixed && !headerLeaving) {
    headerLeaving = true;
    header.classList.remove('is-visible');
    if (headerMotion.matches) finishHeaderExit();
    else headerTimer = setTimeout(finishHeaderExit, 460);
  }
}

header.addEventListener('transitionend', event => {
  if (event.target === header && event.propertyName === 'transform') finishHeaderExit();
});
window.addEventListener('scroll', () => {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    updateFixedHeader();
  });
}, { passive: true });
updateFixedHeader();

function positionHeaderCta() {
  if (window.innerWidth <= 500 && headerCta.parentElement !== nav) {
    nav.appendChild(headerCta);
  } else if (window.innerWidth > 500 && headerCta.parentElement !== header) {
    header.appendChild(headerCta);
  }
}

window.addEventListener('resize', positionHeaderCta);
positionHeaderCta();

const counters = document.querySelectorAll('.results-strip strong[data-count]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(counter, delay) {
  const target = Number(counter.dataset.count);
  const duration = 1150;
  const start = performance.now() + delay;

  function update(now) {
    const progress = Math.min(Math.max((now - start) / duration, 0), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = `+${Math.round(target * eased).toLocaleString('pt-BR')}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

if (counters.length) {
  counters.forEach(counter => { counter.textContent = '+0'; });
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    counters.forEach((counter, index) => {
      if (reducedMotion) counter.textContent = `+${Number(counter.dataset.count).toLocaleString('pt-BR')}`;
      else animateCounter(counter, index * 240);
    });
    observer.disconnect();
  }, { threshold: .45 });
  observer.observe(document.querySelector('.results-strip'));
}

// Voltar ao topo absoluto, sem depender da posição da primeira seção.
document.querySelectorAll('.footer-back-top').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: headerMotion.matches ? 'instant' : 'smooth' });
  });
});

// Álbuns da galeria em modal nativo com foco e teclado acessíveis.
document.querySelectorAll('[data-gallery-dialog]').forEach(trigger => {
  const dialog = document.getElementById(trigger.dataset.galleryDialog);
  const close = () => dialog.close();
  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.documentElement.classList.add('gallery-modal-open');
    dialog.querySelector('.gallery-modal-body').scrollTop = 0;
  });
  dialog.querySelector('.gallery-modal-close').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('gallery-modal-open');
    trigger.focus({ preventScroll: true });
  });
});

const contactForm = document.getElementById('contact-form');
if (contactForm) contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const values = new FormData(contactForm);
  const body = `Nome: ${values.get('name')}\n\n${values.get('message')}`;
  window.open(`https://wa.me/5565998071796?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
});
