// ===== Theme Toggle =====
const themeToggle = document.querySelector('.theme-toggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('light');
}

// ===== Profile Image (reuse slides) =====
const slideExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

async function discoverSlides(maxIndex = 2) {
  const found = [];
  for (let i = 1; i <= maxIndex; i++) {
    for (const ext of slideExtensions) {
      const src = `images/slides/img${i}.${ext}`;
      try {
        await loadImage(src);
        found.push(src);
        break;
      } catch (_) { }
    }
  }
  return found;
}

(async function initProfile() {
  try {
    const gallery = await discoverSlides(2);
    const profileImgEl = document.querySelector('.profile-image');
    if (profileImgEl && gallery.length) {
      profileImgEl.src = gallery[0];
      profileImgEl.alt = 'Profile image';
    }
  } catch (_) { }
})();

// ===== Category Filters =====
const filterPills = document.querySelectorAll('.filter-pill');
const photoItems = document.querySelectorAll('.photo-item');

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    // Update active pill
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const filter = pill.dataset.filter;

    photoItems.forEach((item, i) => {
      const matches = filter === 'all' || item.dataset.category === filter;
      if (matches) {
        item.style.display = '';
        item.style.animation = `fadeSlideIn 0.35s ${i * 0.04}s ease both`;
      } else {
        item.style.display = 'none';
        item.style.animation = '';
      }
    });
  });
});

// ===== Photo Lightbox =====
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCloseBtn = modal.querySelector('.modal-close');
const prevBtn = document.getElementById('modalPrev');
const nextBtn = document.getElementById('modalNext');
const modalIndicator = document.getElementById('modalIndicator');

let visiblePhotos = [];
let currentIndex = 0;

function getVisiblePhotos() {
  return Array.from(photoItems).filter(item => item.style.display !== 'none');
}

function setNavVisible(visible) {
  if (!prevBtn || !nextBtn || !modalIndicator) return;
  prevBtn.style.display = visible ? '' : 'none';
  nextBtn.style.display = visible ? '' : 'none';
  modalIndicator.style.display = visible ? '' : 'none';
}

function showPhoto(index) {
  visiblePhotos = getVisiblePhotos();
  if (!visiblePhotos.length) return;

  index = ((index % visiblePhotos.length) + visiblePhotos.length) % visiblePhotos.length;
  currentIndex = index;

  const img = visiblePhotos[index].querySelector('img');
  modalImg.src = img.src;
  modalImg.alt = img.alt;
  modalIndicator.textContent = `${index + 1} / ${visiblePhotos.length}`;

  modal.style.display = 'flex';
  modal.offsetHeight; // reflow
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setNavVisible(visiblePhotos.length > 1);
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modal.addEventListener('transitionend', function hideModal(e) {
    if (e.propertyName === 'opacity') {
      modal.style.display = 'none';
      modal.removeEventListener('transitionend', hideModal);
    }
  });
}

// Click to open lightbox
photoItems.forEach(item => {
  item.addEventListener('click', () => {
    visiblePhotos = getVisiblePhotos();
    const idx = visiblePhotos.indexOf(item);
    if (idx >= 0) showPhoto(idx);
  });
});

// Navigation
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(currentIndex - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(currentIndex + 1); });
modalCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Keyboard
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
});

// ===== Scroll Fade-in Animation =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `fadeSlideIn 0.4s ${i * 0.06}s ease both`;
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

photoItems.forEach(item => observer.observe(item));
