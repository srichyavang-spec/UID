  (function () {
    if (localStorage.getItem('rf_theme') === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  })();

  document.getElementById('sidebarTotal').textContent  = items.length;
  document.getElementById('sidebarMsgs').textContent   = chats.length;
  document.getElementById('sidebarTrades').textContent = trades.length;
  displayChat();