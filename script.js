// ── Toggle payer details ──
function togglePayerDetails(value) {
  const box = document.getElementById('payerDetails');
  if (!box) return;
  box.style.display = (value === 'parent' || value === 'sponsor' || value === 'other') ? 'block' : 'none';
}


function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('active');
}

// ── Contact form ──
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    const json = await res.json();

    if (json.success) {
      const success = document.getElementById('formSuccess');
      success.classList.add('show');
      form.reset();
      btn.textContent = 'Send Message';
      btn.disabled = false;
      setTimeout(() => success.classList.remove('show'), 6000);
    } else {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      alert('Something went wrong. Please try again or call us on 072 983 7173.');
    }
  } catch (err) {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    alert('Could not send. Please check your connection and try again.');
  }
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

  // Capture data before submission for PDF
  const subjects = Array.from(checked).map(c => c.value);
  const monthly = subjects.length * 300;
  const firstMonth = monthly + 500;

  const appData = {
    refNo: 'LLC-' + Date.now().toString().slice(-6),
    date: new Date().toLocaleDateString('en-ZA', { day:'2-digit', month:'long', year:'numeric' }),
    firstName:      (document.getElementById('firstName')?.value || '').trim(),
    lastName:       (document.getElementById('lastName')?.value || '').trim(),
    dob:            (document.getElementById('dob')?.value || ''),
    gender:         (document.getElementById('gender')?.value || ''),
    idNumber:       (document.getElementById('idNumber')?.value || ''),
    phone:          (document.getElementById('phone')?.value || ''),
    email:          (document.getElementById('email')?.value || ''),
    address:        (document.getElementById('address')?.value || ''),
    programme:      (document.getElementById('programme')?.value || ''),
    grade:          (document.getElementById('grade')?.value || ''),
    school:         (document.getElementById('school')?.value || ''),
    subjects,
    monthly,
    firstMonth,
    guardianName:   (document.getElementById('guardianName')?.value || ''),
    guardianRelation:(document.getElementById('guardianRelation')?.value || ''),
    guardianPhone:  (document.getElementById('guardianPhone')?.value || ''),
    guardianEmail:  (document.getElementById('guardianEmail')?.value || ''),
    guardianId:     (document.getElementById('guardianId')?.value || ''),
    payerType:      (document.getElementById('payerType')?.value || ''),
    payerName:      (document.getElementById('payerName')?.value || ''),
    payerPhone:     (document.getElementById('payerPhone')?.value || ''),
    payerRelation:  (document.getElementById('payerRelation')?.value || ''),
    paymentMethod:  (document.getElementById('paymentMethod')?.value || ''),
    hearAbout:      (document.getElementById('hearAbout')?.value || ''),
    notes:          (document.getElementById('notes')?.value || ''),
  };

  try {
    const data = new FormData(form);
    ['firstName','lastName','dob','gender','idNumber','phone','email','address',
     'programme','grade','school','guardianName','guardianRelation','guardianPhone',
     'guardianEmail','guardianId','payerType','payerName','payerPhone','payerRelation',
     'paymentMethod','hearAbout','notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value) data.append(id, el.value);
    });

    // Add formatted subjects list for email readability
    data.append('Subjects Selected', subjects.join(', '));
    data.append('Monthly Fee', 'R' + monthly);
    data.append('First Month Total', 'R' + firstMonth + ' (incl. R500 registration)');
    data.append('Reference Number', appData.refNo);

    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    const json = await res.json();

    if (json.success) {
      buildAppSummary(appData);
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

// ── Build application summary for PDF ──
function buildAppSummary(d) {
  const row = (label, value) => value
    ? `<tr><td class="as-label">${label}</td><td class="as-value">${value}</td></tr>`
    : '';

  const guardianSection = (d.guardianName || d.guardianPhone)
    ? `<div class="as-section">
        <div class="as-section-title">Parent / Guardian</div>
        <table class="as-table">
          ${row('Full Name', d.guardianName)}
          ${row('Relationship', d.guardianRelation)}
          ${row('Phone / WhatsApp', d.guardianPhone)}
          ${row('Email', d.guardianEmail)}
          ${row('ID Number', d.guardianId)}
        </table>
      </div>` : '';

  const payerSection = (d.payerName || d.payerType)
    ? `<div class="as-section">
        <div class="as-section-title">Payment Responsibility</div>
        <table class="as-table">
          ${row('Who is Paying', d.payerType === 'self' ? 'The learner themselves' : d.payerType)}
          ${row('Payer Name', d.payerName)}
          ${row('Payer Phone', d.payerPhone)}
          ${row('Relationship', d.payerRelation)}
          ${row('Payment Method', d.paymentMethod)}
        </table>
      </div>` : '';

  const html = `
    <div class="as-doc" id="asPrintDoc">
      <div class="as-header">
        <img src="logo.png" alt="LLC Logo" class="as-logo" />
        <div class="as-header-text">
          <h1>Ladysmith Learning Centre</h1>
          <p>160 Murchison Street, Old Riga Building, Room 3, Ladysmith</p>
          <p>Tel: 072 983 7173 &nbsp;|&nbsp; ladysmithlearningc@gmail.com</p>
          <p>SARS Tax Ref: 9007722292</p>
        </div>
      </div>

      <div class="as-title-bar">
        <span>APPLICATION FORM</span>
        <span>Ref: ${d.refNo} &nbsp;|&nbsp; Date: ${d.date}</span>
      </div>

      <div class="as-section">
        <div class="as-section-title">Personal Information</div>
        <table class="as-table">
          ${row('Full Name', d.firstName + ' ' + d.lastName)}
          ${row('Date of Birth', d.dob)}
          ${row('Gender', d.gender)}
          ${row('ID Number', d.idNumber || 'Not provided')}
        </table>
      </div>

      <div class="as-section">
        <div class="as-section-title">Contact Details</div>
        <table class="as-table">
          ${row('Phone / WhatsApp', d.phone)}
          ${row('Email Address', d.email || 'Not provided')}
          ${row('Home Address', d.address)}
        </table>
      </div>

      <div class="as-section">
        <div class="as-section-title">Academic Information</div>
        <table class="as-table">
          ${row('Programme', d.programme)}
          ${row('Current / Last Grade', d.grade)}
          ${row('Previous School', d.school || 'Not provided')}
        </table>
      </div>

      <div class="as-section">
        <div class="as-section-title">Subjects Selected (${d.subjects.length})</div>
        <div class="as-subjects">
          ${d.subjects.map(s => `<span class="as-subject-tag">${s}</span>`).join('')}
        </div>
        <table class="as-table" style="margin-top:0.8rem;">
          <tr><td class="as-label">Monthly Fee</td><td class="as-value as-amount">R${d.monthly.toLocaleString()}</td></tr>
          <tr><td class="as-label">First Month Total</td><td class="as-value as-amount">R${d.firstMonth.toLocaleString()} <small>(incl. R500 once-off registration)</small></td></tr>
        </table>
      </div>

      ${guardianSection}
      ${payerSection}

      <div class="as-section">
        <div class="as-section-title">How did you hear about us?</div>
        <p class="as-notes-text">${d.hearAbout || 'Not specified'}</p>
      </div>

      ${d.notes ? `<div class="as-section">
        <div class="as-section-title">Additional Notes</div>
        <p class="as-notes-text">${d.notes}</p>
      </div>` : ''}

      <div class="as-receipt-warning">
        ⚠️ Please keep your proof of payment and bring it when coming for registration.
        No receipt = no registration confirmation.
      </div>

      <div class="as-bank">
        <strong>Payment Details:</strong> Capitec Bank &nbsp;|&nbsp; Account No: 1591378913 &nbsp;|&nbsp; Reference: ${d.firstName} ${d.lastName}
      </div>

      <div class="as-footer">
        <div class="as-sig-box">
          <p>Applicant Signature</p>
          <div class="as-sig-line"></div>
          <p>${d.firstName} ${d.lastName}</p>
        </div>
        <div class="as-sig-box">
          <p>Centre Official</p>
          <div class="as-sig-line"></div>
          <p>Mr S. Zwane — Founder</p>
        </div>
        <div class="as-sig-box">
          <p>Date</p>
          <div class="as-sig-line"></div>
          <p>${d.date}</p>
        </div>
      </div>

      <p class="as-doc-footer">Registered with SARS | Tax Ref No: 9007722292 | © 2020–2026 Ladysmith Learning Centre</p>
    </div>
  `;

  document.getElementById('appSummaryContent').innerHTML = html;
}

function openAppSummary() {
  document.getElementById('appSummaryModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAppSummary() {
  document.getElementById('appSummaryModal').style.display = 'none';
  document.body.style.overflow = '';
}

function printSummary() {
  window.print();
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
