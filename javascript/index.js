(function () {
    if (localStorage.getItem('rf_theme') === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  })();
loadDashboard();

  /* ── MODAL STATE ── */
  let _redirectUrl = 'lost.html';

  function openLoginModal(url) {
    _redirectUrl = url;
    document.getElementById('loginModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('loginModal')) closeLoginModal();
  }

  /* ── TABS ── */
  function switchTab(tab) {
    document.querySelectorAll('.modal-tab').forEach((t, i) => {
      t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  }

  /* ── AUTH HANDLERS ── */
  function handleLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    if (!user || !pass) { showToast('⚠ ENTER CREDENTIALS', 'error'); return; }
    const users = JSON.parse(localStorage.getItem('rf_users') || '[]');
    const found = users.find(u => (u.username === user || u.email === user) && u.password === pass);
    if (!found) { showToast('✕ INVALID CREDENTIALS', 'error'); return; }
    localStorage.setItem('rf_session', JSON.stringify({ username: found.username, email: found.email }));
    showToast('✔ ACCESS GRANTED — REDIRECTING', 'success');
    closeLoginModal();
    setTimeout(() => { window.location.href = _redirectUrl; }, 900);
  }

  function handleRegister() {
    const user = document.getElementById('regUser').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    if (!user || !email || !pass) { showToast('⚠ ALL FIELDS REQUIRED', 'error'); return; }
    if (pass.length < 6) { showToast('⚠ PASSWORD TOO SHORT', 'error'); return; }
    const users = JSON.parse(localStorage.getItem('rf_users') || '[]');
    if (users.find(u => u.username === user || u.email === email)) {
      showToast('✕ USER ALREADY EXISTS', 'error'); return;
    }
    users.push({ username: user, email, password: pass });
    localStorage.setItem('rf_users', JSON.stringify(users));
    localStorage.setItem('rf_session', JSON.stringify({ username: user, email }));
    showToast('✔ ACCOUNT CREATED — REDIRECTING', 'success');
    closeLoginModal();
    setTimeout(() => { window.location.href = _redirectUrl; }, 900);
  }

  /* Close modal on Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLoginModal();
  });