/* ===== The Daily Grind - Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initHeaderScroll();
  initGalleryLightbox();
  initMenuFilter();
  initOrderSystem();
});

/* --- Navigation --- */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* --- Header Scroll Effect --- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    if (scroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scroll;
  });
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --- Gallery Lightbox --- */
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const items = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = items[index].querySelector('img').src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + items.length) % items.length;
    lightboxImg.src = items[currentIndex].querySelector('img').src;
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* --- Menu Filter --- */
function initMenuFilter() {
  const buttons = document.querySelectorAll('.menu-category-btn');
  const sections = document.querySelectorAll('.menu-category-section');
  if (!buttons.length || !sections.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach(section => {
        if (category === 'all' || section.dataset.category === category) {
          section.style.display = 'block';
          section.style.animation = 'fadeInUp 0.4s ease';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}

/* --- Order System --- */
function initOrderSystem() {
  const orderForm = document.getElementById('order-form');
  if (!orderForm) return;

  const cart = [];
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartTotalsEl = document.getElementById('cart-totals');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const submitBtn = document.getElementById('submit-order');
  const orderSuccess = document.getElementById('order-success');

  // Quantity buttons
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const itemEl = btn.closest('.order-item');
      const name = itemEl.dataset.name;
      const price = parseFloat(itemEl.dataset.price);
      const qtyEl = itemEl.querySelector('.order-item-qty');
      let qty = parseInt(qtyEl.textContent);

      if (action === 'plus') {
        qty++;
        addToCart(name, price);
      } else if (action === 'minus' && qty > 0) {
        qty--;
        removeFromCart(name);
      }

      qtyEl.textContent = qty;
      updateCartDisplay();
    });
  });

  function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }
  }

  function removeFromCart(name) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty--;
      if (existing.qty <= 0) {
        const index = cart.indexOf(existing);
        cart.splice(index, 1);
      }
    }
  }

  function updateCartDisplay() {
    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
      cartItemsEl.innerHTML = '';
      cartTotalsEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      return;
    }

    cartEmptyEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      html += `
        <div class="cart-item">
          <div class="cart-item-name">
            <span class="cart-item-qty">x${item.qty}</span>
            ${item.name}
          </div>
          <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        </div>
      `;
    });

    cartItemsEl.innerHTML = html;

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
    cartTotalsEl.style.display = 'block';
  }

  // Form submission
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (cart.length === 0) return;

    // Validate
    const name = orderForm.querySelector('#customer-name');
    const phone = orderForm.querySelector('#customer-phone');
    const pickup = orderForm.querySelector('#pickup-time');

    if (!name.value || !phone.value || !pickup.value) {
      alert('Please fill in all required fields.');
      return;
    }

    // Show success
    orderForm.style.display = 'none';
    orderSuccess.classList.add('active');
  });
}

/* --- Smooth Scroll for Anchor Links --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
