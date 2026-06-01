// ── State ──
let tasks = JSON.parse(localStorage.getItem('tasko')) || [];
let filter = 'all';
let priority = 'medium';
let dragFrom = null;

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  setupPriority();
  setupTabs();
  setupClear();
  document.getElementById('input-box').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  render();
});

// ── Priority ──
function setupPriority() {
  document.querySelectorAll('.p-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.p-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      priority = btn.dataset.p;
    });
  });
}

// ── Tabs ──
function setupTabs() {
  document.querySelectorAll('.tab[data-f]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-f]').forEach(t => t.classList.remove('on'));
      tab.classList.add('on');
      filter = tab.dataset.f;
      render();
    });
  });
}

// ── Clear done ──
function setupClear() {
  document.getElementById('clear-btn').addEventListener('click', () => {
    const n = tasks.filter(t => t.done).length;
    if (!n) { toast('Nothing to clear'); return; }
    tasks = tasks.filter(t => !t.done);
    save(); render();
    toast(`Cleared ${n} task${n > 1 ? 's' : ''}`);
  });
}

// ── Add ──
function addTask() {
  const inp = document.getElementById('input-box');
  const text = inp.value.trim();
  if (!text) {
    inp.classList.add('shake');
    inp.addEventListener('animationend', () => inp.classList.remove('shake'), { once: true });
    toast('Type something first!');
    return;
  }
  tasks.unshift({
    id: Date.now(),
    text,
    done: false,
    priority,
    due: document.getElementById('due-date').value || null
  });
  inp.value = '';
  document.getElementById('due-date').value = '';
  save(); render();
  toast('Task added ✓');
}

// ── Toggle ──
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  save(); render();
  if (t.done) {
    const allDone = tasks.length && tasks.every(t => t.done);
    toast(allDone ? '🎉 All done!' : 'Nice one! 🔥');
  }
}

// ── Delete ──
function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (!el) return;
  el.classList.add('out');
  el.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    save(); render();
  }, { once: true });
}

// ── Edit ──
function editTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  const el = document.querySelector(`[data-id="${id}"] .task-text`);
  el.contentEditable = 'true';
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  const save_ = () => {
    const val = el.textContent.trim();
    if (val) t.text = val;
    el.contentEditable = 'false';
    save(); render();
  };
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); save_(); }
    if (e.key === 'Escape') { el.contentEditable = 'false'; render(); }
  }, { once: true });
  el.addEventListener('blur', save_, { once: true });
}

// ── Render ──
function render() {
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');

  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return t.done;
    return true;
  });

  list.innerHTML = '';

  if (!visible.length) {
    empty.classList.add('show');
  } else {
    empty.classList.remove('show');
    visible.forEach((t, i) => {
      const li = makeTask(t, i);
      list.appendChild(li);
    });
  }

  updateStats();
}

// ── Build task ──
function makeTask(t, i) {
  const li = document.createElement('li');
  li.className = `task${t.done ? ' done' : ''}`;
  li.dataset.id = t.id;
  li.dataset.p = t.priority;
  li.style.animationDelay = `${i * 0.04}s`;
  li.draggable = true;

  let dueHtml = '';
  if (t.due) {
    const d = new Date(t.due + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const late = d < now && !t.done;
    dueHtml = `<span class="due-tag${late ? ' late' : ''}">${late ? '⚠ ' : ''}${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>`;
  }

  li.innerHTML = `
    <div class="check" onclick="toggleTask(${t.id})">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <div class="task-body">
      <div class="task-text">${esc(t.text)}</div>
      <div class="task-sub">
        <span class="badge badge-${t.priority}">${t.priority}</span>
        ${dueHtml}
      </div>
    </div>
    <div class="task-actions">
      <button class="act" onclick="editTask(${t.id})" title="Edit">✎</button>
      <button class="act del" onclick="deleteTask(${t.id})" title="Delete">✕</button>
    </div>
  `;

  li.addEventListener('dragstart', () => { dragFrom = tasks.findIndex(x => x.id === t.id); li.classList.add('dragging'); });
  li.addEventListener('dragend',   () => li.classList.remove('dragging'));
  li.addEventListener('dragover',  e => { e.preventDefault(); li.classList.add('over'); });
  li.addEventListener('dragleave', () => li.classList.remove('over'));
  li.addEventListener('drop', e => {
    e.preventDefault();
    li.classList.remove('over');
    const to = tasks.findIndex(x => x.id === t.id);
    if (dragFrom !== null && dragFrom !== to) {
      const [m] = tasks.splice(dragFrom, 1);
      tasks.splice(to, 0, m);
      dragFrom = null;
      save(); render();
    }
  });

  return li;
}

// ── Stats ──
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('counter').textContent = total === 0 ? 'No tasks' : `${done}/${total} done`;

  const labels = ['Ready when you are', `${total} task${total>1?'s':''} to go 💪`, 'Keep going! 🔥', 'Almost there! ⚡', 'Everything done! 🎉'];
  const idx = total === 0 ? 0 : pct === 100 ? 4 : pct >= 75 ? 3 : pct >= 40 ? 2 : 1;
  document.getElementById('progress-label').textContent = labels[idx];
}

// ── Toast ──
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window._t);
  window._t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ── Helpers ──
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function save() {
  localStorage.setItem('tasko', JSON.stringify(tasks));
}