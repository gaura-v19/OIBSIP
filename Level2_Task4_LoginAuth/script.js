/* ═══════════════════════════════════════════════════════
   AUTHKIT — script.js   (Panda edition)
═══════════════════════════════════════════════════════ */
'use strict';

const $ = id => document.getElementById(id);

/* ── DOM ────────────────────────────────────────────── */
const mascot      = $('mascot');

const pupilL      = $('pupilLeft');
const pupilR      = $('pupilRight');
const eyelidL     = $('eyelidLeft');
const eyelidR     = $('eyelidRight');

const authPage    = $('authPage');
const welcomePage = $('welcomePage');
const welcomeName = $('welcomeName');
const logoutBtn   = $('logoutBtn');

const tabLogin    = $('tabLogin');
const tabRegister = $('tabRegister');
const tabIndicator= $('tabIndicator');
const formsSlider = $('formsSlider');

const loginForm   = $('loginForm');
const registerForm= $('registerForm');
const allInputs   = document.querySelectorAll('input');

/* ── State ──────────────────────────────────────────── */
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let currentState = 'idle';
let isBlinking   = false;

/* ── Lerp vars ──────────────────────────────────────── */
  // head rotation targets/currents
let tPX=0, tPY=0, cPX=0, cPY=0;        // pupil targets/currents

/* ═══════════════════════════════════════════════════
   CURSOR TRACKING  (rAF loop)
═══════════════════════════════════════════════════ */
document.addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; });

/* Touch support */
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX; mouseY = t.clientY;
}, { passive: true });

function trackCursor() {
  if (currentState === 'covering') {
    tPX = 0; tPY = 0;
  } else if (currentState === 'typing') {
    tPX = 0; tPY = 4.5;
  } else {
    const r  = mascot.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.hypot(dx, dy) || 1;

    const MP  = 4.5;
    const str = Math.min(dist / 200, 1);
    const ang = Math.atan2(dy, dx);
    tPX = Math.cos(ang) * str * MP;
    tPY = Math.sin(ang) * str * MP;
  }

  const LP = 0.14;
  cPX += (tPX - cPX) * LP;
  cPY += (tPY - cPY) * LP;

  /* No head rotation — 2D only */
  head.style.transform = 'none';
  pupilL.style.transform = `translate(${cPX}px, ${cPY}px)`;
  pupilR.style.transform = `translate(${cPX}px, ${cPY}px)`;

  requestAnimationFrame(trackCursor);
}
requestAnimationFrame(trackCursor);

/* ═══════════════════════════════════════════════════
   BLINK SYSTEM
═══════════════════════════════════════════════════ */
function scheduleBlink() {
  setTimeout(() => {
    if (currentState !== 'covering') doBlink();
    scheduleBlink();
  }, 2200 + Math.random() * 2600);
}

function doBlink() {
  if (isBlinking) return;
  isBlinking = true;
  mascot.classList.add('blinking');
  setTimeout(() => { mascot.classList.remove('blinking'); isBlinking = false; }, 170);
}

scheduleBlink();

/* ═══════════════════════════════════════════════════
   STATE MACHINE
═══════════════════════════════════════════════════ */
function setState(state, duration) {
  mascot.classList.remove('typing','covering','error','success','shaking');
  currentState = state;

  if (state === 'error') {
    mascot.classList.add('error','shaking');
    duration && setTimeout(() => {
      mascot.classList.remove('error','shaking');
      currentState = 'idle';
    }, duration);

  } else if (state === 'success') {
    mascot.classList.add('success');
    duration && setTimeout(() => {
      mascot.classList.remove('success');
      currentState = 'idle';
    }, duration);

  } else if (state !== 'idle') {
    mascot.classList.add(state);
  }
}

/* ═══════════════════════════════════════════════════
   INPUT EVENTS
═══════════════════════════════════════════════════ */
allInputs.forEach(inp => {
  inp.addEventListener('focus', () =>
    setState(inp.type === 'password' ? 'covering' : 'typing')
  );
  inp.addEventListener('blur', () => setState('idle'));
});

/* ═══════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════ */
function switchTab(target) {
  tabLogin.classList.toggle('active', target === 'login');
  tabRegister.classList.toggle('active', target === 'register');
  tabIndicator.style.left = target === 'login' ? '0%' : '50%';
  formsSlider.classList.toggle('show-register', target === 'register');
  clearAllMessages();
  setState('idle');
}

document.querySelectorAll('[data-target]').forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.dataset.target))
);

/* ═══════════════════════════════════════════════════
   PASSWORD TOGGLE
═══════════════════════════════════════════════════ */
function setupEyeToggle(togId, iconId, inpId) {
  const tog  = $(togId), icon = $(iconId), inp = $(inpId);
  if (!tog) return;
  tog.addEventListener('click', () => {
    const hidden = inp.type === 'password';
    inp.type = hidden ? 'text' : 'password';
    icon.classList.toggle('hidden-pw', hidden);
  });
}
setupEyeToggle('loginEyeToggle','loginEyeIcon','loginPassword');
setupEyeToggle('regEyeToggle',  'regEyeIcon',  'regPassword');

/* ═══════════════════════════════════════════════════
   VALIDATION HELPERS
═══════════════════════════════════════════════════ */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const msg  = (id, txt, cls) => { const e=$(id); if(!e)return; e.textContent=txt; e.className=`field-msg ${cls}`; };
const fmsg = (id, txt, cls) => { const e=$(id); if(!e)return; e.textContent=txt; e.className=`form-msg ${cls}`; };
const clr  = id => msg(id, '', '');

function clearAllMessages() {
  ['loginEmailMsg','loginPasswordMsg','loginFormMsg',
   'regNameMsg','regEmailMsg','regPasswordMsg','regFormMsg'].forEach(id => {
    const e = $(id);
    if (!e) return;
    e.textContent = '';
    e.className = e.id.includes('FormMsg') ? 'form-msg' : 'field-msg';
  });
  document.querySelectorAll('input').forEach(i =>
    i.classList.remove('error-field','success-field')
  );
}

function bad(el, mid, txt) {
  el.classList.add('error-field'); el.classList.remove('success-field');
  msg(mid, txt, 'err'); return false;
}
function good(el, mid) {
  el.classList.remove('error-field'); el.classList.add('success-field');
  clr(mid); return true;
}

/* ═══════════════════════════════════════════════════
   LOCALSTORAGE
═══════════════════════════════════════════════════ */
const getUsers   = ()    => JSON.parse(localStorage.getItem('ak_users')   || '[]');
const saveUsers  = arr   => localStorage.setItem('ak_users', JSON.stringify(arr));
const getSession = ()    => JSON.parse(localStorage.getItem('ak_session') || 'null');
const saveSession= user  => localStorage.setItem('ak_session', JSON.stringify(user));
const clearSess  = ()    => localStorage.removeItem('ak_session');

/* ═══════════════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════════════ */
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;

  const nEl=$('regName'), eEl=$('regEmail'), pEl=$('regPassword');
  const n=nEl.value.trim(), em=eEl.value.trim(), pw=pEl.value;

  if (!n)                    { ok = bad(nEl,'regNameMsg','Name is required.');          } else { good(nEl,'regNameMsg'); }
  if (!em)                   { ok = bad(eEl,'regEmailMsg','Email is required.')  && ok;  }
  else if (!emailRe.test(em)){ ok = bad(eEl,'regEmailMsg','Invalid email.')       && ok;  }
  else                       { good(eEl,'regEmailMsg'); }
  if (!pw)                   { ok = bad(pEl,'regPasswordMsg','Password required.') && ok; }
  else if (pw.length < 6)    { ok = bad(pEl,'regPasswordMsg','Min 6 characters.') && ok; }
  else                       { good(pEl,'regPasswordMsg'); }

  if (!ok) { setState('error', 1500); return; }

  const users = getUsers();
  if (users.find(u => u.email === em.toLowerCase())) {
    fmsg('regFormMsg','Email already registered.','err');
    bad(eEl,'regEmailMsg','Already in use.');
    setState('error', 1500); return;
  }

  users.push({ name:n, email:em.toLowerCase(), password:pw });
  saveUsers(users);
  fmsg('regFormMsg','✓ Account created!','ok');
  setState('success', 1600);

  setTimeout(() => {
    clearAllMessages(); registerForm.reset();
    doLogin({ name:n, email:em.toLowerCase() });
  }, 1350);
});

/* ═══════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════ */
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;

  const eEl=$('loginEmail'), pEl=$('loginPassword');
  const em=eEl.value.trim(), pw=pEl.value;

  if (!em)                    { ok = bad(eEl,'loginEmailMsg','Email is required.');   }
  else if (!emailRe.test(em)) { ok = bad(eEl,'loginEmailMsg','Invalid email.') && ok; }
  else                        { good(eEl,'loginEmailMsg'); }
  if (!pw)                    { ok = bad(pEl,'loginPasswordMsg','Password required.') && ok; }
  else                        { good(pEl,'loginPasswordMsg'); }

  if (!ok) { setState('error', 1500); return; }

  const user = getUsers().find(u =>
    u.email === em.toLowerCase() && u.password === pw
  );

  if (!user) {
    fmsg('loginFormMsg','Invalid email or password.','err');
    setState('error', 1500); return;
  }

  fmsg('loginFormMsg',`✓ Welcome back, ${user.name}!`,'ok');
  setState('success', 1600);
  setTimeout(() => doLogin(user), 1250);
});

/* ═══════════════════════════════════════════════════
   SESSION
═══════════════════════════════════════════════════ */
function doLogin(user) {
  saveSession(user);
  welcomeName.textContent = user.name;
  authPage.classList.add('hidden');
  welcomePage.classList.remove('hidden');
}

logoutBtn.addEventListener('click', () => {
  clearSess();
  welcomePage.classList.add('hidden');
  authPage.classList.remove('hidden');
  loginForm.reset();
  clearAllMessages();
  setState('idle');
});

/* Auto-restore */
(function() {
  const s = getSession();
  if (s) {
    welcomeName.textContent = s.name;
    authPage.classList.add('hidden');
    welcomePage.classList.remove('hidden');
  }
})();

/* ═══════════════════════════════════════════════════
   LIVE VALIDATION
═══════════════════════════════════════════════════ */
$('loginEmail').addEventListener('input', function() {
  if (this.value && !emailRe.test(this.value.trim()))
    { msg('loginEmailMsg','Invalid email.','err'); this.classList.add('error-field'); }
  else { clr('loginEmailMsg'); this.classList.remove('error-field'); }
});

$('regEmail').addEventListener('input', function() {
  if (this.value && !emailRe.test(this.value.trim()))
    { msg('regEmailMsg','Invalid email.','err'); this.classList.add('error-field'); }
  else { clr('regEmailMsg'); this.classList.remove('error-field'); }
});

$('regPassword').addEventListener('input', function() {
  const l = this.value.length;
  if (l > 0 && l < 6) {
    msg('regPasswordMsg', `${6-l} more char${6-l>1?'s':''} needed.`, 'err');
    this.classList.add('error-field'); this.classList.remove('success-field');
  } else if (l >= 6) {
    msg('regPasswordMsg','✓ Looks good!','ok');
    this.classList.remove('error-field'); this.classList.add('success-field');
  } else {
    clr('regPasswordMsg');
    this.classList.remove('error-field','success-field');
  }
});