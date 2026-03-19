// ===== Dynamic Experience Calculation =====
const startDate = new Date(2021, 2, 1); // Mar 2021 (month is 0-indexed)
const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
const yearsOfExp = ((Date.now() - startDate.getTime()) / msPerYear).toFixed(1);
document.getElementById('years-of-exp').textContent = yearsOfExp;

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

// ===== Work Experience Expansion =====
const expItems = document.querySelectorAll('.exp-item');

expItems.forEach(item => {
  item.addEventListener('click', () => {
    if (item.classList.contains('expanded')) {
      item.classList.remove('expanded');
      return;
    }

    // Collapse all other items
    expItems.forEach(otherItem => {
      if (otherItem !== item && otherItem.classList.contains('expanded')) {
        otherItem.classList.remove('expanded');
      }
    });

    item.classList.add('expanded');

    // Smooth scroll into view if needed
    const itemRect = item.getBoundingClientRect();
    const isPartiallyVisible = itemRect.bottom > window.innerHeight;

    if (isPartiallyVisible) {
      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  });
});

// ===== Education Expansion =====
const eduItems = document.querySelectorAll('.edu-item');

eduItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('expanded');
    if (item.classList.contains('expanded')) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
      }
    }
  });
});

// ===== Achievement Content Modal =====
const achCards = document.querySelectorAll('.ach-card');
const contentModal = document.createElement('div');
contentModal.className = 'modal';
contentModal.id = 'contentModal';
contentModal.innerHTML = `
  <div class="modal-content">
    <button class="modal-close content-close" aria-label="Close modal">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div id="modalBody" style="background:transparent;padding:18px;color:var(--text);max-height:80vh;overflow:auto"></div>
  </div>
`;
document.body.appendChild(contentModal);

const modalContentContainer = document.getElementById('contentModal');
const modalBody = document.getElementById('modalBody');
const contentClose = modalContentContainer
  ? modalContentContainer.querySelector('.modal-close')
  : null;

achCards.forEach(card => {
  card.addEventListener('click', () => {
    // Click handler disabled for now
  });
});

// Close handlers for content modal
function closeContentModal() {
  if (!modalContentContainer) return;
  modalContentContainer.classList.remove('active');
  document.body.style.overflow = '';
  modalContentContainer.addEventListener('transitionend', function hide(e) {
    if (e.propertyName === 'opacity') {
      modalContentContainer.style.display = 'none';
      modalContentContainer.removeEventListener('transitionend', hide);
      modalBody.innerHTML = '';
    }
  });
}

if (contentClose) {
  contentClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeContentModal();
  });
}

if (modalContentContainer) {
  modalContentContainer.addEventListener('click', (e) => {
    if (e.target === modalContentContainer) closeContentModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    modalContentContainer &&
    modalContentContainer.classList.contains('active')
  ) {
    closeContentModal();
  }
});

// ===== Image Modal / Slider =====
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCloseBtn = modal.querySelector('.modal-close');
const prevBtn = document.getElementById('modalPrev');
const nextBtn = document.getElementById('modalNext');
const modalIndicator = document.getElementById('modalIndicator');

// Discover slides dynamically
let gallery = [];
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
        break; // proceed to next index once one extension matched
      } catch (_) {
        // try next extension
      }
    }
  }
  return found;
}

(async function initSlides() {
  try {
    gallery = await discoverSlides(2);
  } catch (_) {
    gallery = [];
  }
  // Set profile to first slide if available
  const profileImgEl = document.querySelector('.profile-image');
  if (profileImgEl && gallery.length) {
    profileImgEl.src = gallery[0];
    profileImgEl.alt = 'Profile image 1';
  }
})();

let currentIndex = 0;

function setNavVisible(visible) {
  if (!prevBtn || !nextBtn || !modalIndicator) return;
  prevBtn.style.display = visible ? '' : 'none';
  nextBtn.style.display = visible ? '' : 'none';
  modalIndicator.style.display = visible ? '' : 'none';
}

function showImage(index) {
  if (!gallery.length) return;
  index = ((index % gallery.length) + gallery.length) % gallery.length;
  currentIndex = index;
  modalImg.src = gallery[index];
  modalImg.alt = gallery[index].split('/').pop();
  modalIndicator.textContent = `${index + 1} / ${gallery.length}`;
  modal.style.display = 'flex';
  modal.offsetHeight; // reflow
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setNavVisible(gallery.length > 1);
}

function findIndexForSrc(src) {
  if (!src) return -1;
  const filename = src.split('/').slice(-1)[0];
  return gallery.findIndex(g => g.split('/').slice(-1)[0] === filename);
}

// Profile images open slider
function openWithSrcOnly(src, altText) {
  modalImg.src = src;
  modalImg.alt = altText || '';
  modal.style.display = 'flex';
  modal.offsetHeight; // reflow
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setNavVisible(false);
}

const profileImages = document.querySelectorAll('.profile-image');
profileImages.forEach(img => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    const idx = findIndexForSrc(img.getAttribute('src'));
    if (gallery.length) {
      showImage(idx >= 0 ? idx : 0);
    } else {
      openWithSrcOnly(img.getAttribute('src'), img.getAttribute('alt'));
    }
  });
});

// Award images open in modal
const awardImages = document.querySelectorAll('.award-image');
awardImages.forEach(img => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    openWithSrcOnly(img.getAttribute('src'), img.getAttribute('alt'));
  });
});

// Prev / Next
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

// Close modal
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

modalCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});
