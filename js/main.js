/* ==========================================================================
   WHY MENTOR MATTERS? — Interactive Landing Page Controller
   Features: 3D Book Physics, Touch Swipe, Particle Canvas, Countdown, Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initInteractive3DBook();
  initCountdownTimer();
  initNotificationForm();
  initExcerptModal();
});

/* --------------------------------------------------------------------------
   1. Interactive 3D Book with Mouse Drag & Mobile Touch Swipe
   -------------------------------------------------------------------------- */
function initInteractive3DBook() {
  const scene = document.getElementById('book3dScene');
  const book = document.getElementById('bookObject');
  const buttons = document.querySelectorAll('.book-control-btn');
  if (!scene || !book) return;

  let currentRotY = -25;
  let currentRotX = 8;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let isAutoRotating = false;
  let autoRotateInterval = null;

  // Set preset view
  window.setBookView = function(view, btnElem) {
    if (isAutoRotating) stopAutoRotate();
    buttons.forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');

    book.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    if (view === 'front') {
      currentRotY = -22;
      currentRotX = 6;
    } else if (view === 'back') {
      currentRotY = 180;
      currentRotX = 0;
    } else if (view === 'spine') {
      currentRotY = -90;
      currentRotX = 0;
    }
    updateBookTransform();
  };

  window.toggleAutoRotate = function(btnElem) {
    if (isAutoRotating) {
      stopAutoRotate();
      if (btnElem) btnElem.classList.remove('active');
    } else {
      isAutoRotating = true;
      buttons.forEach(b => b.classList.remove('active'));
      if (btnElem) btnElem.classList.add('active');
      book.style.transition = 'transform 0.1s linear';
      autoRotateInterval = setInterval(() => {
        currentRotY = (currentRotY + 1.2) % 360;
        updateBookTransform();
      }, 25);
    }
  };

  function stopAutoRotate() {
    isAutoRotating = false;
    clearInterval(autoRotateInterval);
    book.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  function updateBookTransform() {
    book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg)`;
  }

  // Mouse Drag Events
  scene.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    stopAutoRotate();
    book.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    currentRotY += deltaX * 0.6;
    currentRotX -= deltaY * 0.4;
    // Bound X rotation to prevent flipping upside down
    currentRotX = Math.max(-30, Math.min(30, currentRotX));
    updateBookTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      book.style.transition = 'transform 0.4s ease-out';
    }
  });

  // Mobile Touch Swipe Events (Smooth Mobile Interaction)
  scene.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stopAutoRotate();
      book.style.transition = 'none';
    }
  }, { passive: true });

  scene.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    currentRotY += deltaX * 0.8;
    currentRotX -= deltaY * 0.4;
    currentRotX = Math.max(-25, Math.min(25, currentRotX));
    updateBookTransform();
  }, { passive: true });

  scene.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      book.style.transition = 'transform 0.4s ease-out';
    }
  });

  // Tap on book toggles between Front and Back on mobile
  scene.addEventListener('click', () => {
    if (Math.abs(currentRotY - (-22)) < 15) {
      window.setBookView('back');
    } else {
      window.setBookView('front');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Canvas Particle Node Network (Lightweight & 60fps)
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const count = Math.min(Math.floor(window.innerWidth / 28), 45);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? '#D4AF37' : '#10B981'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.18 - dist / 650})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(render);
  }
  render();
}

/* --------------------------------------------------------------------------
   3. Coming Soon Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdownTimer() {
  const daysElem = document.getElementById('cdDays');
  const hoursElem = document.getElementById('cdHours');
  const minsElem = document.getElementById('cdMins');
  const secsElem = document.getElementById('cdSecs');
  if (!daysElem) return;

  // Set target launch date 25 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 25);
  targetDate.setHours(targetDate.getHours() + 14);

  function update() {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    if (diff <= 0) {
      daysElem.innerText = '00';
      hoursElem.innerText = '00';
      minsElem.innerText = '00';
      secsElem.innerText = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysElem.innerText = String(d).padStart(2, '0');
    hoursElem.innerText = String(h).padStart(2, '0');
    minsElem.innerText = String(m).padStart(2, '0');
    secsElem.innerText = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   4. Email Notification Form with Toast
   -------------------------------------------------------------------------- */
function initNotificationForm() {
  const form = document.getElementById('notifyForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('notifyEmail');
    if (!input || !input.value) return;

    const email = input.value;
    try {
      localStorage.setItem('subscribed_email', email);
    } catch (err) {}

    // Elegant Toast Alert
    showToast(`✓ Thank you! We will notify ${email} the moment the full platform launches.`);
    input.value = '';
  });
}

function showToast(msg) {
  let toast = document.getElementById('liveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'liveToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '90px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '50px';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '0.9rem';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.zIndex = '3000';
    toast.style.transition = 'all 0.3s ease';
    toast.style.maxWidth = '90vw';
    toast.style.textAlign = 'center';
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 4000);
}

/* --------------------------------------------------------------------------
   5. Look Inside / Excerpt Modal
   -------------------------------------------------------------------------- */
function initExcerptModal() {
  const modal = document.getElementById('excerptModal');
  const openBtns = document.querySelectorAll('.open-excerpt-btn');
  const closeBtn = document.getElementById('closeExcerptModal');
  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

/* --------------------------------------------------------------------------
   6. Author Hand-Signed Copy WhatsApp Order Handler
   -------------------------------------------------------------------------- */
window.handleSignedOrder = function(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('signedName');
  const addressInput = document.getElementById('signedAddress');
  const phoneInput = document.getElementById('signedPhone');
  const noteInput = document.getElementById('signedNote');

  const name = (nameInput?.value || '').trim();
  const address = (addressInput?.value || '').trim();
  const phone = (phoneInput?.value || '').trim();
  const note = (noteInput?.value || '').trim();

  let text = `Hello Dr. George V Antony,\n\nI would like to order the Author Hand-Signed Copy of *Why Mentor Matters* (₹999).\n\n*DELIVERY DETAILS:*\n• *Full Name:* ${name || '[Please Enter Name]'}\n• *Delivery Address:* ${address || '[Please Enter Full Address & Pincode]'}\n• *Phone Number:* ${phone || '[Please Enter Phone Number]'}`;
  if (note) {
    text += `\n• *Dedication Note:* ${note}`;
  }

  const url = `https://wa.me/919072004596?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
