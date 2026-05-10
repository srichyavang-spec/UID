(function(){if(localStorage.getItem('rf_theme')==='light')document.documentElement.classList.add('light-mode')})();
function changeName() {
    const input = document.getElementById('newNameInput');
    const newName = input.value.trim().toUpperCase();
    if (!newName) { showToast('⚠ ENTER A NAME', 'error'); return; }
    currentUser = newName;
    localStorage.setItem('rf_user', currentUser);
    input.value = '';
    loadProfile();
    document.getElementById('navUserDisplay').textContent = currentUser;
    showToast(`✓ USERNAME UPDATED: ${currentUser}`, 'success');
  }

  function saveEmail() {
    const val = document.getElementById('profileEmailInput').value.trim();
    if (!val) { showToast('⚠ ENTER AN EMAIL', 'error'); return; }
    localStorage.setItem('rf_email', val);
    showToast('✓ EMAIL UPDATED', 'success');
  }

  function savePhone() {
    const val = document.getElementById('profilePhoneInput').value.trim();
    if (!val) { showToast('⚠ ENTER A PHONE NUMBER', 'error'); return; }
    localStorage.setItem('rf_phone', val);
    showToast('✓ PHONE UPDATED', 'success');
  }

  function clearAllData() {
    if (!confirm('DELETE ALL DATA? This cannot be undone.')) return;
    localStorage.clear();
    items = []; chats = []; trades = [];
    showToast('ALL DATA PURGED', 'amber');
    loadProfile(); renderActivity(); updateAchievements();
  }

  function renderActivity() {
    const list = document.getElementById('activityList');
    if (!list) return;
    const all = [...items].reverse().slice(0, 8);
    if (!all.length) { list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>NO ACTIVITY YET</h3><p>Start reporting items to see your activity log.</p></div>`; return; }
    list.innerHTML = all.map(i => `
      <div class="activity-item">
        <div class="activity-icon ${i.type}">${i.type==='lost'?'🔴':i.type==='found'?'🟢':'🔄'}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;margin-bottom:2px">${i.name}</div>
          <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted2);letter-spacing:1px">${i.type.toUpperCase()} · ${i.location} · ${timeAgo(i.time)}</div>
        </div>
        <span class="badge badge-${i.type}">${i.type.toUpperCase()}</span>
      </div>`).join('');
  }

  function updateAchievements() {
    const unlock = id => document.getElementById(id)?.classList.remove('locked');
    const lock   = id => document.getElementById(id)?.classList.add('locked');
    items.length > 0          ? unlock('ach-first')  : lock('ach-first');
    items.some(i=>i.type==='found') ? unlock('ach-found')  : lock('ach-found');
    trades.length > 0         ? unlock('ach-trader') : lock('ach-trader');
    items.length >= 5         ? unlock('ach-active') : lock('ach-active');
    chats.length > 0          ? unlock('ach-chat')   : lock('ach-chat');
    items.length >= 20        ? unlock('ach-legend') : document.getElementById('ach-legend')?.classList.add('locked');
  }

  // Init
  loadProfile();
  document.getElementById('settingsTotal').textContent = items.length;
  document.getElementById('settingsMsgs').textContent  = chats.length;
  document.getElementById('navUserDisplay').textContent = currentUser;
  document.getElementById('profileEmailInput').value = localStorage.getItem('rf_email') || '';
  document.getElementById('profilePhoneInput').value = localStorage.getItem('rf_phone') || '';
  renderActivity();
  updateAchievements();