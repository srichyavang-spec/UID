/* ================================================
   RETRIEVAL — CORE APPLICATION JS
   Lost & Found Command Network
   ================================================ */
 
/* ── STATE ── */
let items  = JSON.parse(localStorage.getItem('rf_items'))  || [];
let chats  = JSON.parse(localStorage.getItem('rf_chats'))  || [];
let trades = JSON.parse(localStorage.getItem('rf_trades')) || [];
let currentUser = localStorage.getItem('rf_user') || 'USERNAME';
 
/* ── SAVE ── */
function save() {
  localStorage.setItem('rf_items',  JSON.stringify(items));
  localStorage.setItem('rf_trades', JSON.stringify(trades));
}
 
function saveChats() {
  localStorage.setItem('rf_chats', JSON.stringify(chats));
}
 
/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('siteLoader');
    if (loader) loader.classList.add('hide');
  }, 1600);
  document.body.classList.add('loaded');
});
 
/* ── TOAST ── */
function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.borderColor = type === 'success' ? 'rgba(16,185,129,0.4)'
                       : type === 'error'   ? 'rgba(239,68,68,0.4)'
                       : type === 'amber'   ? 'rgba(245,158,11,0.4)'
                       : 'rgba(255,255,255,0.13)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}
 
/* ── TIME AGO ── */
function timeAgo(isoStr) {
  const diff = (Date.now() - new Date(isoStr)) / 1000;
  if (diff < 60)    return 'JUST NOW';
  if (diff < 3600)  return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  return `${Math.floor(diff / 86400)}D AGO`;
}
 
/* ── ADD ITEM ── */
function addItem(type) {
  const nameEl     = document.getElementById('nameInput');
  const locationEl = document.getElementById('locationInput');
  const descEl     = document.getElementById('descInput');
 
  if (!nameEl || !locationEl) return;
 
  const name     = nameEl.value.trim();
  const location = locationEl.value.trim();
  const desc     = descEl ? descEl.value.trim() : '';
 
  if (!name || !location) {
    showToast('⚠ FILL ALL REQUIRED FIELDS', 'error');
    return;
  }
 
  const item = {
    id:       Date.now(),
    name,
    location,
    desc,
    type,
    user:     currentUser,
    time:     new Date().toISOString(),
    contact:  document.getElementById('contactInput')?.value.trim() || '',
    category: document.getElementById('categorySelect')?.value || 'general',
  };
 
  items.push(item);
  save();
 
  if (nameEl)     nameEl.value     = '';
  if (locationEl) locationEl.value = '';
  if (descEl)     descEl.value     = '';
 
  checkMatch(item);
  showToast(`✓ ${type.toUpperCase()} ITEM REPORTED`, 'success');
 
  if (document.getElementById('itemsGrid')) displayItems(type);
}
 
/* ── DELETE ITEM ── */
function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  save();
  showToast('ITEM REMOVED', 'amber');
  const activeFilter = document.querySelector('.chip.active')?.dataset.filter || null;
  displayItems(activeFilter);
}
 
/* ── DISPLAY ITEMS ── */
function displayItems(filterType = null) {
  const grid = document.getElementById('itemsGrid');
  if (!grid) return;
 
  const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || '';
 
  let filtered = items.filter(i => {
    const matchType   = !filterType || filterType === 'all' || i.type === filterType;
    const matchSearch = !searchVal ||
      i.name.toLowerCase().includes(searchVal) ||
      i.location.toLowerCase().includes(searchVal) ||
      (i.desc || '').toLowerCase().includes(searchVal);
    return matchType && matchSearch;
  });
 
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = `${filtered.length} RECORD${filtered.length !== 1 ? 'S' : ''} FOUND`;
 
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">📡</div>
        <h3>NO SIGNALS DETECTED</h3>
        <p>No items match your query.<br>Try adjusting filters or report a new item.</p>
      </div>`;
    return;
  }
 
  grid.innerHTML = '';
  filtered.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.animationDelay = `${idx * 0.05}s`;
 
    const typeIcon = item.type === 'lost' ? '🔴' : item.type === 'found' ? '🟢' : '🔄';
    const badgeClass = `badge-${item.type}`;
 
    card.innerHTML = `
      <div class="item-card-header">
        <span class="badge ${badgeClass}">${typeIcon} ${item.type.toUpperCase()}</span>
        <span style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted2);letter-spacing:1px">${timeAgo(item.time)}</span>
      </div>
      <div class="item-card-body">
        <div class="item-card-name">${item.name}</div>
        <div class="item-meta" style="margin-bottom:8px">
          <span>📍 ${item.location}</span>
          ${item.category ? `<span>🏷 ${item.category.toUpperCase()}</span>` : ''}
        </div>
        ${item.desc ? `<p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:8px">${item.desc}</p>` : ''}
        <div class="item-meta">
          <span>👤 ${item.user}</span>
          ${item.contact ? `<span>📞 ${item.contact}</span>` : ''}
        </div>
      </div>
      <div class="item-card-actions">
        <button class="btn btn-ghost btn-sm" onclick="requestContact(${item.id})" style="flex:1">CONTACT</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">REMOVE</button>
      </div>`;
 
    grid.appendChild(card);
  });
}
 
/* ── SEARCH ── */
function searchItems() {
  const activeFilter = document.querySelector('.chip.active')?.dataset.filter || null;
  displayItems(activeFilter);
}
 
/* ── FILTER ── */
function filterType(type, el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  displayItems(type === 'all' ? null : type);
}
 
/* ── MATCH CHECK ── */
function checkMatch(newItem) {
  const opposite = newItem.type === 'lost' ? 'found' : 'lost';
  const match = items.find(i =>
    i.id !== newItem.id &&
    i.type === opposite &&
    i.name.toLowerCase().includes(newItem.name.toLowerCase().split(' ')[0])
  );
  if (match) {
    setTimeout(() => showToast(`🎯 POTENTIAL MATCH FOUND: "${match.name}"`, 'amber'), 1000);
  }
}
 
/* ── REQUEST CONTACT ── */
function requestContact(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  const contact = item.contact || 'No contact info listed';
  showToast(`📞 CONTACT: ${contact}`, 'amber');
}
 
/* ── CHAT ── */
function sendMsg() {
  const input = document.getElementById('msgInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
 
  chats.push({
    id:   Date.now(),
    user: currentUser,
    msg,
    time: new Date().toISOString()
  });
  saveChats();
  input.value = '';
  displayChat();
  showToast('MESSAGE TRANSMITTED', 'success');
}
 
function displayChat() {
  const box = document.getElementById('chatBox');
  if (!box) return;
  if (chats.length === 0) {
    box.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📡</div><h3>NO TRANSMISSIONS</h3><p>Start the conversation</p></div>`;
    return;
  }
  box.innerHTML = chats.map(c => `
    <div class="chat-msg ${c.user === currentUser ? 'own' : ''}">
      <div class="chat-meta">
        <span class="chat-user">${c.user}</span>
        <span class="chat-time">${timeAgo(c.time)}</span>
      </div>
      <div class="chat-bubble">${c.msg}</div>
    </div>
  `).join('');
  box.scrollTop = box.scrollHeight;
}
 
/* ── PROFILE ── */
function loadProfile() {
  const total     = document.getElementById('statTotal');
  const lostStat  = document.getElementById('statLost');
  const foundStat = document.getElementById('statFound');
  const tradeStat = document.getElementById('statTrade');

  const userName  = document.getElementById('profileName');
  const navUser   = document.getElementById('navUserDisplay');

  const emailText = document.getElementById('profileEmail');
  const phoneText = document.getElementById('profilePhone');

  if (total)
    total.textContent = items.length;

  if (lostStat)
    lostStat.textContent = items.filter(i => i.type === 'lost').length;

  if (foundStat)
    foundStat.textContent = items.filter(i => i.type === 'found').length;

  if (tradeStat)
    tradeStat.textContent = items.filter(i => i.type === 'trade').length;

  if (userName)
    userName.textContent = currentUser;

  if (navUser)
    navUser.textContent = currentUser;

  if (emailText)
    emailText.textContent =
      localStorage.getItem('rf_email') || 'EMAIL NOT SET';

  if (phoneText)
    phoneText.textContent =
      localStorage.getItem('rf_phone') || 'PHONE NOT SET';
}
 
/* ── TRADE REQUESTS ── */
function addTradeItem() {
  const nameEl   = document.getElementById('tradeNameInput');
  const forEl    = document.getElementById('tradeForInput');
  const condEl   = document.getElementById('tradeCondInput');
 
  if (!nameEl || !forEl) return;
 
  const name      = nameEl.value.trim();
  const wantFor   = forEl.value.trim();
  const condition = condEl ? condEl.value : 'good';
 
  if (!name || !wantFor) {
    showToast('⚠ FILL ALL FIELDS', 'error');
    return;
  }
 
  const trade = {
    id:        Date.now(),
    name,
    wantFor,
    condition,
    user:      currentUser,
    time:      new Date().toISOString(),
  };
 
  trades.push(trade);
  save();
  nameEl.value = '';
  forEl.value  = '';
  showToast('✓ TRADE OFFER LISTED', 'success');
  displayTrades();
}
 
function deleteTrade(id) {
  trades = trades.filter(t => t.id !== id);
  save();
  showToast('TRADE REMOVED', 'amber');
  displayTrades();
}
 
function displayTrades() {
  const grid = document.getElementById('tradesGrid');
  if (!grid) return;
  if (trades.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔄</div><h3>NO ACTIVE TRADES</h3><p>Be the first to list a trade offer.</p></div>`;
    return;
  }
  grid.innerHTML = '';
  trades.forEach((t, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    const condColor = t.condition === 'new' ? 'var(--green)' : t.condition === 'good' ? 'var(--amber)' : 'var(--muted)';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="badge badge-trade">🔄 TRADE</span>
        <span style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted2)">${timeAgo(t.time)}</span>
      </div>
      <div class="item-card-body">
        <div class="item-card-name">${t.name}</div>
        <p style="font-size:13px;color:var(--muted);margin:6px 0 10px">WANT: <strong style="color:var(--amber)">${t.wantFor}</strong></p>
        <div class="item-meta">
          <span>👤 ${t.user}</span>
          <span style="color:${condColor}">◆ ${t.condition.toUpperCase()}</span>
        </div>
      </div>
      <div class="item-card-actions">
        <button class="btn btn-ghost btn-sm" onclick="showToast('TRADE REQUEST SENT','success')" style="flex:1">PROPOSE TRADE</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTrade(${t.id})">REMOVE</button>
      </div>`;
    grid.appendChild(card);
  });
}
 
/* ── DASHBOARD STATS ── */
function loadDashboard() {
  const el = (id) => document.getElementById(id);
  if (el('dashTotal'))  el('dashTotal').textContent  = items.length;
  if (el('dashLost'))   el('dashLost').textContent   = items.filter(i=>i.type==='lost').length;
  if (el('dashFound'))  el('dashFound').textContent  = items.filter(i=>i.type==='found').length;
  if (el('dashTrades')) el('dashTrades').textContent = trades.length;
 
  // Recent items on dashboard
  const recentGrid = el('recentGrid');
  if (recentGrid) {
    const recent = [...items].reverse().slice(0, 6);
    if (recent.length === 0) {
      recentGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📡</div><h3>NO REPORTS YET</h3><p>Start by reporting a lost or found item.</p></div>`;
      return;
    }
    recentGrid.innerHTML = '';
    recent.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.animationDelay = `${idx * 0.07}s`;
      const typeIcon = item.type === 'lost' ? '🔴' : item.type === 'found' ? '🟢' : '🔄';
      card.innerHTML = `
        <div class="item-card-header">
          <span class="badge badge-${item.type}">${typeIcon} ${item.type.toUpperCase()}</span>
          <span style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted2)">${timeAgo(item.time)}</span>
        </div>
        <div class="item-card-body">
          <div class="item-card-name">${item.name}</div>
          <div class="item-meta"><span>📍 ${item.location}</span></div>
        </div>`;
      recentGrid.appendChild(card);
    });
  }
}

function applyTheme(theme) {
  const btnIcon = document.querySelector('#themeToggle i');

  if (theme === 'light') {
    document.body.classList.add('light-mode');
    localStorage.setItem('rf_theme', 'light');

    if (btnIcon) {
      btnIcon.classList.remove('fa-moon');
      btnIcon.classList.add('fa-sun');
    }
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('rf_theme', 'dark');

    if (btnIcon) {
      btnIcon.classList.remove('fa-sun');
      btnIcon.classList.add('fa-moon');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('rf_theme') || 'dark';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
});