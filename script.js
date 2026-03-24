// ── Mobile menu ──
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('active');
}

// ── Contact form ──
function handleSubmit(event) {
  event.preventDefault();
  const success = document.getElementById('formSuccess');
  success.classList.add('show');
  event.target.reset();
  setTimeout(() => success.classList.remove('show'), 6000);
}

// ── Apply form ──
async function handleApply(event) {
  event.preventDefault();
  const form = event.target;
  const checked = form.querySelectorAll('input[name="subjects"]:checked');
  if (checked.length === 0) {
    alert('Please select at least one subject.');
    return;
  }
  const consent = document.getElementById('consent');
  if (!consent.checked) {
    alert('Please confirm your consent to submit.');
    return;
  }

  const submitBtn = form.querySelector('.apply-submit');
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    const data = new FormData(form);
    // Add named inputs that use id instead of name
    ['firstName','lastName','dob','gender','idNumber','phone','email','address',
     'programme','grade','school','guardianName','guardianPhone','hearAbout','notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value) data.append(id, el.value);
    });

    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.style.display = 'none';
      const success = document.getElementById('applySuccess');
      success.classList.add('show');
      window.scrollTo({ top: success.offsetTop - 100, behavior: 'smooth' });
    } else {
      submitBtn.textContent = 'Submit Application';
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or contact us directly on 072 983 7173.');
    }
  } catch (err) {
    submitBtn.textContent = 'Submit Application';
    submitBtn.disabled = false;
    alert('Could not send. Please check your connection and try again.');
  }
}

// ── Live subject cost calculator ──
document.addEventListener('change', function (e) {
  if (e.target.name === 'subjects') {
    const count = document.querySelectorAll('input[name="subjects"]:checked').length;
    const costEl = document.getElementById('subjectCost');
    if (!costEl) return;
    if (count === 0) {
      costEl.textContent = '';
    } else {
      const monthly = count * 300;
      const first = monthly + 500;
      costEl.textContent = `${count} subject${count > 1 ? 's' : ''} selected — R${monthly}/month (first month: R${first} incl. registration)`;
    }
  }
});

// ── Scroll fade-up animation ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── SLIDESHOW ──
(function () {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('ssDots');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'ss-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.onclick = () => goTo(i);
    dotsContainer.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  window.moveSlide = (dir) => goTo(current + dir);
  resetTimer();
})();

// ── LIGHTBOX ──
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const imgs = Array.from(document.querySelectorAll('.gallery-item img'));
  let currentIndex = 0;

  window.openLightbox = function (index) {
    currentIndex = index;
    document.getElementById('lightboxImg').src = imgs[index].src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.changeSlide = function (dir) {
    currentIndex = (currentIndex + dir + imgs.length) % imgs.length;
    document.getElementById('lightboxImg').src = imgs[currentIndex].src;
  };

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'Escape') closeLightbox();
  });
})();

// ── Floating symbols canvas ──
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const SYMBOLS = [
    '∑', '∫', '√', 'π', '∞', 'Δ', '±', '÷', '×', '=',
    'α', 'β', 'θ', 'λ', 'μ', 'σ', 'Ω',
    '⚗', '🔬', '⚛', '🧬', '🔭', '⚡', '🧪',
    'H₂O', 'E=mc²', 'F=ma', 'y=mx+c',
    '∂', '∇', '∈', '∏', '≠', '≈', '∝', '📐', '📏', '🔭'
  ];

  const COLORS = ['#f5c518', '#ff6b35', '#00c9a7', '#ffffff', '#ffd700'];

  let particles = [];

  function resize() {
    const section = canvas.parentElement;
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x: randomBetween(0, canvas.width),
      y: randomBetween(0, canvas.height),
      size: randomBetween(12, 52),
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: randomBetween(0.06, 0.22),
      speedX: randomBetween(-0.25, 0.25),
      speedY: randomBetween(-0.35, -0.1),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.005, 0.005),
    };
  }

  function init() {
    resize();
    const count = Math.floor((canvas.width * canvas.height) / 18000);
    particles = Array.from({ length: Math.min(count, 55) }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.font = p.size + "px 'Segoe UI', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 0);
      ctx.restore();
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      if (p.y < -60) p.y = canvas.height + 60;
      if (p.x < -60) p.x = canvas.width + 60;
      if (p.x > canvas.width + 60) p.x = -60;
    });
    requestAnimationFrame(draw);
  }

  init();
  draw();

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => {
      p.x = randomBetween(0, canvas.width);
      p.y = randomBetween(0, canvas.height);
    });
  });
})();
