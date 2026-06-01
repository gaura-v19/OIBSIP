/* ═══════════════════════════════════════════════════════
   AUTHKIT — script.js
   Mascot tracking · Behavior states · Auth logic
═══════════════════════════════════════════════════════ */
'use strict';

/* ── DOM references ────────────────────────────────── */
const $ = id => document.getElementById(id);

const mascot       = $('mascot');
const head         = $('head');
const eyebrows     = $('eyebrows');
const pupilL       = $('pupilLeft');
const pupilR       = $('pupilRight');
const eyelidL      = $('eyelidLeft');
const eyelidR      = $('eyelidRight');
const eyeL         = $('eyeLeft');
const eyeR         = $('eyeRight');
const hands        = $('hands');
const mouthInner   = $('mouthInner');

const authPage     = $('authPage');
const welcomePage  = $('welcomePage');
const welcomeName  = $('welcomeName');
const logoutBtn    = $('logoutBtn');

const tabLogin     = $('tabLogin');
const tabRegister  = $('tabRegister');
const tabIndicator = $('tabIndicator');
const formsSlider  = $('formsSlider');

const loginForm    = $('loginForm');
const registerForm = $('registerForm');

const allInputs    = document.querySelectorAll('input');
const allPasswords = document.querySelectorAll('input[type="password"]');

/* ── State ──────────────────────────────────────────── */
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentState  = 'idle';   // idle | typing | covering | error | success
let isBlinking    = false;
let blinkTimer    = null;
let activePanel   = 'login';  // login | register

/* ═══════════════════════════════════════════════════════
   MOUSE TRACKING (requestAnimationFrame)
═══════════════════════════════════════════════════════ */
let targetHeadRotX = 0, targetHeadRotY = 0;
let currentHeadRotX = 0, currentHeadRotY = 0;
let targetPupilX = 0, targetPupilY = 0;
let currentPupilX = 0, currentPupilY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function trackCursor() {
  if (currentState === 'covering') {
    /* Covering: pupils look straight */
    targetPupilX = 0;
    targetPupilY = 0;
    targetHeadRotX = 0;
    targetHeadRotY = 0;
  } else if (currentState === 'typing') {
    /* Typing: eyes look slightly down */
    targetPupilX = 0;
    targetPupilY = 4;
    targetHeadRotX = 6;
    targetHeadRotY = 0;
  } else {
    /* Idle / normal: follow cursor */
    const mascotRect = mascot.getBoundingClientRect();
    const cx = mascotRect.left + mascotRect.width / 2;
    const cy = mascotRect.top  + mascotRect.height / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    /* Head tilt — very subtle */
    const headRange = 8;
    const nx = dx / (window.innerWidth  / 2);
    const ny = dy / (window.innerHeight / 2);
    targetHeadRotY =  nx * headRange;
    targetHeadRotX = -ny * (headRange * 0.5);

    /* Pupil movement — clamped to natural range */
    const maxPupil = 5.5;
    const angle = Math.atan2(dy, dx);
    const strength = Math.min(dist / 220, 1);
    targetPupilX = Math.cos(angle) * strength * maxPupil;
    targetPupilY = Math.sin(angle) * strength * maxPupil;
  }

  /* Smooth lerp */
  const lerpFactor = 0.10;
  currentHeadRotX += (targetHeadRotX - currentHeadRotX) * lerpFactor;
  currentHeadRotY += (targetHeadRotY - currentHeadRotY) * lerpFactor;
  currentPupilX   += (targetPupilX   - currentPupilX)   * (lerpFactor * 1.4);
  currentPupilY   += (targetPupilY   - currentPupilY)   * (lerpFactor * 1.4);

  /* Apply to DOM */
  head.style.transform =
    `rotateX(${currentHeadRotX}deg) rotateY(${currentHeadRotY}deg)`;

  const px = currentPupilX;
  const py = currentPupilY;
  pupilL.style.transform = `translate(${px}px, ${py}px)`;
  pupilR.style.transform = `translate(${px}px, ${py}px)`;

  requestAnimationFrame(trackCursor);
}

requestAnimationFrame(trackCursor);

/* ═══════════════════════════════════════════════════════
   BLINK SYSTEM
═══════════════════════════════════════════════════════ */
function scheduleBlink() {
  const delay = 2000 + Math.random() * 2500;
  blinkTimer = setTimeout(() => {
    if (currentState !== 'covering') doBlink();
    scheduleBlink();
  }, delay);
}

function doBlink() {
  if (isBlinking) return;
  isBlinking = true;
  mascot.classList.add('blinking');
  setTimeout(() => {
    mascot.classList.remove('blinking');
    isBlinking = false;
  }, 180);
}

scheduleBlink();

/* ═══════════════════════════════════════════════════════
   MASCOT STATE MACHINE
═══════════════════════════════════════════════════════ */
function setState(state, duration) {
  /* Remove previous states */
  mascot.classList.remove('typing', 'covering', 'error', 'success', 'shaking');

  currentState = state;

  if (state === 'error') {
    mascot.classList.add('error', 'shaking');
    if (duration) {
      setTimeout(() => {
        mascot.classList.remove('error', 'shaking');
        currentState = 'idle';
      }, duration);
    }
  } else if (state === 'success') {
    mascot.classList.add('success');
    if (duration) {
      setTimeout(() => {
        mascot.classList.remove('success');
        currentState = 'idle';
      }, duration);
    }
  } else if (state !== 'idle') {
    mascot.classList.add(state);
  }
}

/* ═══════════════════════════════════════════════════════
   INPUT EVENT LISTENERS
═══════════════════════════════════════════════════════ */
allInputs.forEach(input => {
  input.addEventListener('focus', () => {
    if (input.type === 'password') {
      setState('covering');
    } else {
      setState('typing');
    }
  });

  input.addEventListener('blur', () => {
    setState('idle');
  });
});

/* ═══════════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════════ */
function switchTab(target) {
  activePanel = target;

  tabLogin.classList.toggle('active', target === 'login');
  tabRegister.classList.toggle('active', target === 'register');
  tabIndicator.style.left = target === 'login' ? '0%' : '50%';

  if (target === 'register') {
    formsSlider.classList.add('show-register');
  } else {
    formsSlider.classList.remove('show-register');
  }

  /* Clear messages on switch */
  clearAllMessages();
  setState('idle');
}

document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.target);
  });
});

/* ═══════════════════════════════════════════════════════
   SHOW / HIDE PASSWORD TOGGLE
═══════════════════════════════════════════════════════ */
function setupEyeToggle(toggleId, iconId, inputId) {
  const toggle = $(toggleId);
  const icon   = $(iconId);
  const input  = $(inputId);
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.classList.toggle('hidden-pw', isHidden);
  });
}

setupEyeToggle('loginEyeToggle', 'loginEyeIcon', 'loginPassword');
setupEyeToggle('regEyeToggle',   'regEyeIcon',   'regPassword');

/* ═══════════════════════════════════════════════════════
   VALIDATION HELPERS
═══════════════════════════════════════════════════════ */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showFieldMsg(id, msg, type) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `field-msg ${type}`;
}

function showFormMsg(id, msg, type) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `form-msg ${type}`;
}

function clearFieldMsg(id) {
  const el = $(id);
  if (!el) return;
  el.textContent = '';
  el.className = 'field-msg';
}

function clearAllMessages() {
  ['loginEmailMsg','loginPasswordMsg','loginFormMsg',
   'regNameMsg','regEmailMsg','regPasswordMsg','regFormMsg']
    .forEach(id => { const el = $(id); if (el) { el.textContent = ''; el.className = el.className.includes('form-msg') ? 'form-msg' : 'field-msg'; } });

  document.querySelectorAll('input').forEach(i => i.classList.remove('error-field', 'success-field'));
}

function markError(inputEl, msgId, msg) {
  inputEl.classList.add('error-field');
  inputEl.classList.remove('success-field');
  showFieldMsg(msgId, msg, 'err');
  return false;
}

function markOk(inputEl, msgId, msg) {
  inputEl.classList.remove('error-field');
  inputEl.classList.add('success-field');
  if (msg) showFieldMsg(msgId, msg, 'ok');
  return true;
}

/* ═══════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
═══════════════════════════════════════════════════════ */
function getUsers() {
  return JSON.parse(localStorage.getItem('authkit_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('authkit_users', JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem('authkit_session') || 'null');
}

function saveSession(user) {
  localStorage.setItem('authkit_session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('authkit_session');
}

/* ═══════════════════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════════════════ */
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const nameEl  = $('regName');
  const emailEl = $('regEmail');
  const passEl  = $('regPassword');
  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const pass    = passEl.value;

  /* Name */
  if (!name) {
    valid = markError(nameEl, 'regNameMsg', 'Name is required.');
  } else {
    markOk(nameEl, 'regNameMsg');
  }

  /* Email */
  if (!email) {
    valid = markError(emailEl, 'regEmailMsg', 'Email is required.') && valid;
  } else if (!emailRegex.test(email)) {
    valid = markError(emailEl, 'regEmailMsg', 'Enter a valid email.') && valid;
  } else {
    markOk(emailEl, 'regEmailMsg');
  }

  /* Password */
  if (!pass) {
    valid = markError(passEl, 'regPasswordMsg', 'Password is required.') && valid;
  } else if (pass.length < 6) {
    valid = markError(passEl, 'regPasswordMsg', 'Minimum 6 characters.') && valid;
  } else {
    markOk(passEl, 'regPasswordMsg');
  }

  if (!valid) {
    setState('error', 1400);
    return;
  }

  /* Duplicate check */
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    showFormMsg('regFormMsg', 'Email already registered.', 'err');
    markError(emailEl, 'regEmailMsg', 'Already in use.');
    setState('error', 1400);
    return;
  }

  /* Save */
  users.push({ name, email: email.toLowerCase(), password: pass });
  saveUsers(users);

  showFormMsg('regFormMsg', '✓ Account created! Logging you in…', 'ok');
  setState('success', 1600);

  setTimeout(() => {
    clearAllMessages();
    registerForm.reset();
    loginSuccess({ name, email });
  }, 1400);
});

/* ═══════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════ */
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const emailEl = $('loginEmail');
  const passEl  = $('loginPassword');
  const email   = emailEl.value.trim();
  const pass    = passEl.value;

  /* Email */
  if (!email) {
    valid = markError(emailEl, 'loginEmailMsg', 'Email is required.');
  } else if (!emailRegex.test(email)) {
    valid = markError(emailEl, 'loginEmailMsg', 'Enter a valid email.') && valid;
  } else {
    markOk(emailEl, 'loginEmailMsg');
  }

  /* Password */
  if (!pass) {
    valid = markError(passEl, 'loginPasswordMsg', 'Password is required.') && valid;
  } else {
    markOk(passEl, 'loginPasswordMsg');
  }

  if (!valid) {
    setState('error', 1400);
    return;
  }

  /* Check credentials */
  const users = getUsers();
  const user  = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.password === pass
  );

  if (!user) {
    showFormMsg('loginFormMsg', 'Invalid email or password.', 'err');
    setState('error', 1400);
    return;
  }

  showFormMsg('loginFormMsg', `✓ Welcome back, ${user.name}!`, 'ok');
  setState('success', 1600);

  setTimeout(() => {
    loginSuccess(user);
  }, 1200);
});

/* ═══════════════════════════════════════════════════════
   SESSION MANAGEMENT
═══════════════════════════════════════════════════════ */
function loginSuccess(user) {
  saveSession(user);
  welcomeName.textContent = user.name;
  authPage.classList.add('hidden');
  welcomePage.classList.remove('hidden');
}

logoutBtn.addEventListener('click', () => {
  clearSession();
  welcomePage.classList.add('hidden');
  authPage.classList.remove('hidden');
  loginForm.reset();
  clearAllMessages();
  setState('idle');
});

/* ── Auto-restore session on load ──────────────────── */
(function checkSession() {
  const session = getSession();
  if (session) {
    welcomeName.textContent = session.name;
    authPage.classList.add('hidden');
    welcomePage.classList.remove('hidden');
  }
})();

/* ── Live validation feedback ───────────────────────── */
$('loginEmail').addEventListener('input', function () {
  if (this.value && !emailRegex.test(this.value.trim())) {
    showFieldMsg('loginEmailMsg', 'Invalid email format.', 'err');
    this.classList.add('error-field');
  } else {
    clearFieldMsg('loginEmailMsg');
    this.classList.remove('error-field');
  }
});

$('regEmail').addEventListener('input', function () {
  if (this.value && !emailRegex.test(this.value.trim())) {
    showFieldMsg('regEmailMsg', 'Invalid email format.', 'err');
    this.classList.add('error-field');
  } else {
    clearFieldMsg('regEmailMsg');
    this.classList.remove('error-field');
  }
});

$('regPassword').addEventListener('input', function () {
  if (this.value.length > 0 && this.value.length < 6) {
    showFieldMsg('regPasswordMsg', `${6 - this.value.length} more characters needed.`, 'err');
    this.classList.add('error-field');
  } else if (this.value.length >= 6) {
    showFieldMsg('regPasswordMsg', '✓ Strong enough!', 'ok');
    this.classList.remove('error-field');
    this.classList.add('success-field');
  } else {
    clearFieldMsg('regPasswordMsg');
    this.classList.remove('error-field', 'success-field');
  }
});