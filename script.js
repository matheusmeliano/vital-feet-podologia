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

function updateFixedHeader() {
  const shouldFix = window.scrollY > 250;

  if (shouldFix) {
    if (!header.classList.contains('is-fixed')) {
      header.classList.add('is-fixed');
      document.body.classList.add('has-fixed-header');
      requestAnimationFrame(() => header.classList.add('is-visible'));
    } else {
      header.classList.add('is-visible');
    }
    return;
  }

  if (header.classList.contains('is-fixed')) {
    header.classList.add('is-resetting');
    header.classList.remove('is-visible', 'is-fixed');
    document.body.classList.remove('has-fixed-header');
    requestAnimationFrame(() => header.classList.remove('is-resetting'));
  }
}

window.addEventListener('scroll', updateFixedHeader, { passive: true });
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
