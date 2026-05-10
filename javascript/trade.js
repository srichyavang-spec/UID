(function () {
    if (localStorage.getItem('rf_theme') === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  })();
let tradeFilter = 'all';
  let currentImageBase64 = null;

  /* ── IMAGE UPLOAD ── */
  function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠ IMAGE TOO LARGE (MAX 5MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result;
      document.getElementById('previewImg').src = currentImageBase64;
      document.getElementById('previewWrap').style.display = 'block';
      document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    currentImageBase64 = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('previewImg').src = '';
    document.getElementById('previewWrap').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
  }

  function submitTrade() {
    const name = document.getElementById('tradeNameInput').value.trim();
    const wantFor = document.getElementById('tradeForInput').value.trim();
    const condition = document.querySelector('input[name="cond"]:checked')?.value || 'good';

    if (!name || !wantFor) {
      showToast('⚠ FILL REQUIRED FIELDS', 'error');
      return;
    }

    const trade = {
      id: Date.now(),
      name,
      wantFor,
      condition,
      user: currentUser,
      time: new Date().toISOString(),
      image: currentImageBase64 || null,
    };

    trades.push(trade);
    save();
    document.getElementById('tradeNameInput').value = '';
    document.getElementById('tradeForInput').value = '';
    document.getElementById('descInput').value = '';
    document.querySelector('input[name="cond"][value="good"]').checked = true;
    removeImage();
    showToast('✓ TRADE OFFER LISTED', 'success');
    renderTrades();
  }

  function setTradeFilter(f, el) {
    tradeFilter = f;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderTrades();
  }

  function filterTrades() { renderTrades(); }

  function renderTrades() {
    const grid = document.getElementById('tradesGrid');
    const search = document.getElementById('tradeSearch')?.value.toLowerCase() || '';
    const countEl = document.getElementById('tradeCount');

    let filtered = trades.filter(t => {
      const matchCond = tradeFilter === 'all' ||
        (tradeFilter === 'fair' ? ['fair','worn'].includes(t.condition) : t.condition === tradeFilter);
      const matchSearch = !search || t.name.toLowerCase().includes(search) || t.wantFor.toLowerCase().includes(search);
      return matchCond && matchSearch;
    });

    if (countEl) countEl.textContent = trades.length;
    document.getElementById('tradeResultCount').textContent = `${filtered.length} OFFER${filtered.length !== 1 ? 'S' : ''}`;

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔄</div><h3>NO TRADE OFFERS</h3><p>Be the first to list a trade offer above.</p></div>`;
      return;
    }

    grid.innerHTML = '';
    filtered.forEach((t, idx) => {
      const condColor = t.condition === 'new' ? 'var(--green)' : t.condition === 'good' ? 'var(--amber)' : 'var(--muted)';
      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.animationDelay = `${idx * 0.05}s`;
      card.innerHTML = `
        <div class="item-card-header">
          <span class="badge badge-trade">🔄 TRADE</span>
          <span style="font-family:'Space Mono',monospace;font-size:8px;color:${condColor}">◆ ${t.condition.toUpperCase()}</span>
        </div>
        <div class="trade-card-arrow">
          <span class="from">${t.name}</span>
          <i class="fas fa-arrows-alt-h arrow-icon"></i>
          <span class="to">${t.wantFor}</span>
        </div>
        <div class="item-card-body" style="padding-top:12px">
          ${t.image ? `<img class="item-card-img" src="${t.image}" alt="${t.name}">` : ''}
          <div class="item-meta">
            <span>👤 ${t.user}</span>
            <span>🕒 ${timeAgo(t.time)}</span>
          </div>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-primary btn-sm" onclick="showToast('TRADE REQUEST SENT ✓','success')" style="flex:1">PROPOSE TRADE</button>
          <button class="btn btn-ghost btn-sm" onclick="showToast('SAVED TO WATCHLIST','amber')"><i class="fas fa-bookmark"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteTrade(${t.id});renderTrades()">✕</button>
        </div>`;
      grid.appendChild(card);
    });
  }

  renderTrades();