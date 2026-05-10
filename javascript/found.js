(function () {
    if (localStorage.getItem('rf_theme') === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  })();
  /* ── IMAGE UPLOAD ── */
  let currentImageBase64 = null;

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

  /* ── OPEN MAP ── */
  function openMap(location) {
    const query = encodeURIComponent(location);
    window.open('https://www.google.com/maps/search/?api=1&query=' + query, '_blank');
  }

  /* ── OVERRIDE addItem TO SAVE IMAGE + CLEAR ALL FIELDS ── */
  const _origAddItem = addItem;
  addItem = function(type) {
    _origAddItem(type);
    setTimeout(() => {
      const contactEl  = document.getElementById('contactInput');
      const categoryEl = document.getElementById('categorySelect');
      if (contactEl)  contactEl.value  = '';
      if (categoryEl) categoryEl.value = 'general';
    }, 50);
    if (currentImageBase64 && items.length > 0) {
      items[items.length - 1].image = currentImageBase64;
      save();
      removeImage();
      displayItems('found');
    }
  };

  /* ── CATEGORY FILTER ── */
  function filterByCat(cat, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    const grid = document.getElementById('itemsGrid');
    const filtered = items.filter(i => i.type === 'found' && i.category === cat);
    const countEl = document.getElementById('resultsCount');
    countEl.textContent = `${filtered.length} RECORDS FOUND`;
    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📦</div><h3>NONE IN THIS CATEGORY</h3><p>No found items in this category yet.</p></div>`;
      return;
    }
    filtered.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.animationDelay = `${idx * 0.05}s`;
      card.innerHTML = `
        <div class="item-card-header">
          <span class="badge badge-found">🟢 FOUND</span>
          <span style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted2)">${timeAgo(item.time)}</span>
        </div>
        <div class="item-card-body">
          <div class="item-card-name">${item.name}</div>
          <div class="item-meta" style="margin-bottom:8px"><span>📍 ${item.location}</span></div>
          ${item.image ? `<img class="item-card-img" src="${item.image}" alt="${item.name}">` : ''}
          ${item.desc ? `<p style="font-size:13px;color:var(--muted);line-height:1.6">${item.desc}</p>` : ''}
        </div>
        <div class="item-card-actions" style="flex-wrap:wrap;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="requestContact(${item.id})" style="flex:1;min-width:80px">CONTACT FINDER</button>
          <button class="btn btn-ghost btn-sm" onclick="openMap('${item.location}')" style="flex:1;min-width:80px"><i class="fas fa-map-marker-alt"></i> MAP</button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})" style="min-width:80px">REMOVE</button>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ── OVERRIDE displayItems TO INJECT IMAGE + MAP BUTTON ── */
  const _origDisplayItems = displayItems;
  displayItems = function(filterType) {
    _origDisplayItems(filterType);
    document.querySelectorAll('.item-card').forEach(card => {
      const actions = card.querySelector('.item-card-actions');
      if (!actions) return;
      const contactBtn = actions.querySelector('button');
      if (!contactBtn) return;
      const match = contactBtn.getAttribute('onclick').match(/\d+/);
      if (!match) return;
      const id = match[0];
      const item = items.find(i => i.id == id);
      if (!item) return;
      // Inject image if present and not already added
      const body = card.querySelector('.item-card-body');
      if (body && item.image && !body.querySelector('.item-card-img')) {
        const img = document.createElement('img');
        img.className = 'item-card-img';
        img.src = item.image;
        img.alt = item.name;
        const nameEl = body.querySelector('.item-card-name');
        if (nameEl) nameEl.after(img);
      }
      // Add MAP button if missing
      if (actions.querySelector('.map-btn')) return;
      actions.style.flexWrap = 'wrap';
      actions.style.gap = '6px';
      const mapBtn = document.createElement('button');
      mapBtn.className = 'btn btn-ghost btn-sm map-btn';
      mapBtn.style = 'flex:1;min-width:80px';
      mapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> MAP';
      mapBtn.onclick = () => openMap(item.location);
      contactBtn.style.minWidth = '80px';
      contactBtn.after(mapBtn);
    });
  };

  displayItems('found');