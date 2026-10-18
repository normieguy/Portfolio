/* ============================================================
   Portfolio JS — particle field, typing effect, scroll reveal,
   counters, skill bars, JSON-driven projects, mobile nav
   ============================================================ */

/* ---------- Load project data ---------- */
let PROJECT_DATA = { projects: [], upcoming: [] };

function loadProjects() {
  fetch('assets/projects.json')
    .then(r => r.json())
    .then(data => { PROJECT_DATA = data; renderProjects(); renderUpcoming(); })
    .catch(err => {
      console.warn('projects.json failed, falling back inline', err);
      renderProjects(); renderUpcoming();
    });
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = PROJECT_DATA.projects.map((p, i) => `
    <article class="project-card reveal" style="transition-delay:${i * 0.12}s">
      <div class="p-icon">${p.icon}</div>
      <div class="p-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <h3 class="p-title">${p.title}</h3>
      <p class="p-summary">${p.summary}</p>
      <ul class="p-highlights">${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
      <div class="p-links">
        ${p.links.map(l => `<a href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${l.label} →</a>`).join('')}
      </div>
    </article>`).join('');
  observeReveals();
}

function renderUpcoming() {
  const list = document.getElementById('upcomingList');
  if (!list) return;
  list.innerHTML = PROJECT_DATA.upcoming.map(u => `
    <div class="tl-item">
      <div class="tl-head">
        <span style="font-size:1.4rem">${u.icon}</span>
        <h3 class="tl-title">${u.title}</h3>
        <span class="tl-status">${u.status}</span>
      </div>
      <p class="tl-summary">${u.summary}</p>
    </div>`).join('');
  observeTimeline();
}

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

function observeTimeline() {
  const tlObserver = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 140);
        tlObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.tl-item:not(.visible)').forEach(el => tlObserver.observe(el));
}

/* ---------- Counter animation for hero stats ---------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ---------- Skill bars ---------- */
function fillSkillBar(el) {
  const bar = el.querySelector('.bar i');
  if (bar && !bar.style.width) bar.style.width = el.dataset.level + '%';
}
function checkSkillBars() {
  const vh = window.innerHeight;
  document.querySelectorAll('.skill-bar').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 || (r.top <= 0 && r.bottom > 0) || r.bottom < 0 && r.bottom > -vh) fillSkillBar(el);
  });
}
window.addEventListener('scroll', requestIdleish(checkSkillBars), { passive: true });
function requestIdleish(fn) {
  // returns a throttled handler
  let pending = false;
  return () => { if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; fn(); }); } };
}
window.addEventListener('resize', requestIdleish(checkSkillBars), { passive: true });
checkSkillBars();

/* ---------- Typing effect ---------- */
const TYPED_WORDS = ['Machine Learning Enthusiast', 'Python Developer', 'Full-Stack Builder', 'Data Storyteller'];
(function typeLoop() {
  const el = document.getElementById('typed');
  if (!el) return;
  let wordIdx = 0, charIdx = 0, deleting = false;
  function step() {
    const word = TYPED_WORDS[wordIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++charIdx);
      if (charIdx === word.length) { deleting = true; return setTimeout(step, 1600); }
      setTimeout(step, 55);
    } else {
      el.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % TYPED_WORDS.length; return setTimeout(step, 350); }
      setTimeout(step, 28);
    }
  }
  step();
})();

/* ---------- Particle canvas ---------- */
(function particles() {
  const c = document.getElementById('particle-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, parts = [], mouse = { x: -9999, y: -9999 };
  const COUNT = Math.min(90, Math.floor(window.innerWidth / 16));

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  for (let i = 0; i < COUNT; i++) {
    parts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.8 + .6
    });
  }

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 200, 255, 0.55)';
      ctx.fill();
    }
    // connective lines
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.12 * (1 - d / 120)})`;
          ctx.stroke();
        }
      }
      // mouse attraction line
      const md = Math.hypot(parts[i].x - mouse.x, parts[i].y - mouse.y);
      if (md < 160) {
        ctx.beginPath();
        ctx.moveTo(parts[i].x, parts[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.25 * (1 - md / 160)})`;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
})();

/* ---------- Mobile hamburger ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); })
);

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Init ---------- */
loadProjects();
observeReveals();
