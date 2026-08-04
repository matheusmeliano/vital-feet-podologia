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
