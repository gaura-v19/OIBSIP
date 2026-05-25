/* ── CURSOR ── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

/* ── GALAXY CANVAS ── */
const canvas = document.getElementById('galaxy');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initStars(); });

/* Stars */
let stars = [];
function initStars() {
  stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.2,
    alpha: Math.random(),
    spd: 0.003 + Math.random() * 0.005,
    gold: Math.random() < 0.06   // 6% golden stars
  }));
}
initStars();

/* Asteroids */
let asteroids = [];
function spawnAsteroid() {
  const fromLeft = Math.random() < 0.5;
  asteroids.push({
    x: fromLeft ? -20 : canvas.width + 20,
    y: Math.random() * canvas.height * 0.6,
    size: 1.5 + Math.random() * 3,
    vx: fromLeft ? 1.5 + Math.random() * 2.5 : -(1.5 + Math.random() * 2.5),
    vy: 0.8 + Math.random() * 1.8,
    alpha: 0.7 + Math.random() * 0.3,
    tail: []
  });
}
setInterval(spawnAsteroid, 700);

/* Nebula clouds */
const nebulaColors = [
  'rgba(245,197,24,', 'rgba(180,80,255,', 'rgba(50,130,255,'
];
const nebulae = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: 100 + Math.random() * 200,
  color: nebulaColors[i % nebulaColors.length],
  alpha: 0.03 + Math.random() * 0.04
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Nebula */
  nebulae.forEach(n => {
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    g.addColorStop(0,   n.color + n.alpha + ')');
    g.addColorStop(0.5, n.color + (n.alpha * 0.4) + ')');
    g.addColorStop(1,   n.color + '0)');
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  });

  /* Stars */
  stars.forEach(s => {
    s.alpha += s.spd;
    if (s.alpha > 1 || s.alpha < 0) s.spd *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.gold
      ? `rgba(245,197,24,${s.alpha})`
      : `rgba(200,210,255,${s.alpha})`;
    ctx.fill();
  });

  /* Asteroids */
  asteroids.forEach((a, i) => {
    a.tail.push({ x: a.x, y: a.y });
    if (a.tail.length > 16) a.tail.shift();

    /* tail */
    a.tail.forEach((t, ti) => {
      const ratio = ti / a.tail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, a.size * ratio * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,197,24,${ratio * a.alpha * 0.35})`;
      ctx.fill();
    });

    /* body */
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,215,0,${a.alpha})`;
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#f5c518';
    ctx.fill();
    ctx.shadowBlur  = 0;

    a.x += a.vx;
    a.y += a.vy;
    if (a.y > canvas.height + 40 || a.x < -60 || a.x > canvas.width + 60)
      asteroids.splice(i, 1);
  });

  requestAnimationFrame(draw);
}
draw();

/* ── TYPEWRITER ── */
const roles = [
  'Software Developer 💻',
  'Backend Engineer ⚙️',
  'Frontend Crafter 🎨',
  'Problem Solver 🚀',
  'Full Stack Builder 🛠️'
];
let roleIdx = 0, charIdx = 0, deleting = false;
const roleEl = document.getElementById('roleText');

function type() {
  const current = roles[roleIdx];
  if (!deleting) {
    roleEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    roleEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx  = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(type, deleting ? 45 : 80);
}
type();

/* ── NAVBAR SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 50);
});

/* ── HAMBURGER ── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.skill-card, .project-card, .about-card, .contact-card, .stat-box, .section-header'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

document.addEventListener('animationend', () => {}, { once: true });

// For IntersectionObserver revealed class
const style = document.createElement('style');
style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

/* ── SKILL CARD TILT ── */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-10px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});