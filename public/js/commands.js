// ============================================
// COMMANDS MODULE - Bloomberg-style terminal commands
// ============================================

const CommandsModule = {
  history: [],
  historyIndex: -1,
  alerts: [], // Price alerts
  selectedMarketIndex: -1, // Currently selected market (-1 = none)
  marketsList: [], // Current displayed markets for navigation

  // Bloomberg-style commands
  commands: {
    // === NAVIGATION ===
    help: {
      category: 'NAV',
      description: 'Display help menu',
      usage: 'HELP',
      execute: () => CommandsModule.showHelp()
    },
    last: {
      category: 'NAV',
      description: 'Show last 8 commands used',
      usage: 'LAST',
      execute: () => CommandsModule.showLast()
    },
    reset: {
      category: 'NAV',
      description: 'Reset to world view',
      usage: 'RESET',
      execute: () => CommandsModule.resetView()
    },

    // === NEWS ===
    top: {
      category: 'NEWS',
      description: 'Top news stories',
      usage: 'TOP',
      execute: () => CommandsModule.showTopNews()
    },
    ni: {
      category: 'NEWS',
      description: 'News by topic/region',
      usage: 'NI <topic>',
      execute: (args) => CommandsModule.newsIndustry(args)
    },
    n: {
      category: 'NEWS',
      description: 'Filter news',
      usage: 'N <keyword>',
      execute: (args) => CommandsModule.filterNews(args)
    },
    news: {
      category: 'NEWS',
      description: 'Expand news panel (toggle)',
      usage: 'NEWS',
      execute: () => CommandsModule.togglePanel('news')
    },
    osint: {
      category: 'NEWS',
      description: 'Show OSINT resources',
      usage: 'OSINT',
      execute: () => CommandsModule.showOsint()
    },
    telegram: {
      category: 'NEWS',
      description: 'Show live Telegram OSINT feed',
      usage: 'TELEGRAM',
      execute: () => CommandsModule.showTelegram()
    },
    tg: {
      category: 'NEWS',
      description: 'Show live Telegram OSINT feed (alias)',
      usage: 'TG',
      execute: () => CommandsModule.showTelegram()
    },
    x: {
      category: 'NEWS',
      description: 'Show live X OSINT feed',
      usage: 'X',
      execute: () => CommandsModule.showX()
    },
    twitter: {
      category: 'NEWS',
      description: 'Show live X OSINT feed (alias)',
      usage: 'TWITTER',
      execute: () => CommandsModule.showX()
    },
    xfull: {
      category: 'NEWS',
      description: 'Full-screen X monitor with markets',
      usage: 'XFULL',
      execute: () => CommandsModule.openXFullScreen()
    },
    xf: {
      category: 'NEWS',
      description: 'Full-screen X monitor (alias)',
      usage: 'XF',
      execute: () => CommandsModule.openXFullScreen()
    },
    flights: {
      category: 'TRACK',
      description: 'Live flight tracker (optional region)',
      usage: 'FLIGHTS [region]',
      execute: (args) => CommandsModule.showFlights(args)
    },
    ships: {
      category: 'TRACK',
      description: 'Live ship tracker (optional region)',
      usage: 'SHIPS [region]',
      execute: (args) => CommandsModule.showShips(args)
    },
    chart: {
      category: 'MKTS',
      description: 'Full-screen chart (current or search)',
      usage: 'CHART [keyword]',
      execute: (args) => CommandsModule.showFullChart(args)
    },
    book: {
      category: 'MKTS',
      description: 'Toggle order book for selected market',
      usage: 'BOOK',
      execute: () => CommandsModule.toggleOrderBook()
    },
    orderbook: {
      category: 'MKTS',
      description: 'Toggle order book (alias)',
      usage: 'ORDERBOOK',
      execute: () => CommandsModule.toggleOrderBook()
    },

    // === MARKETS ===
    gp: {
      category: 'MKTS',
      description: 'Focus on region (Go Price)',
      usage: 'GP <region>',
      execute: (args) => CommandsModule.focusRegion(args)
    },
    focus: {
      category: 'MKTS',
      description: 'Focus map on region',
      usage: 'FOCUS <region>',
      execute: (args) => CommandsModule.focusRegion(args)
    },
    vol: {
      category: 'MKTS',
      description: 'Show top volume markets',
      usage: 'VOL',
      execute: () => CommandsModule.showVolume()
    },
    hot: {
      category: 'MKTS',
      description: 'Show markets with highest 24hr volume',
      usage: 'HOT',
      execute: () => CommandsModule.showHot()
    },
    mv: {
      category: 'MKTS',
      description: 'Show biggest price movers (1 week)',
      usage: 'MV',
      execute: () => CommandsModule.showMovers()
    },
    us: {
      category: 'MKTS',
      description: 'Show US domestic markets',
      usage: 'US',
      execute: () => CommandsModule.showDomestic()
    },
    allq: {
      category: 'MKTS',
      description: 'All quotes for region',
      usage: 'ALLQ <region>',
      execute: (args) => CommandsModule.showMarkets(args)
    },

    // === ALERTS ===
    alrt: {
      category: 'ALRT',
      description: 'Manage price alerts',
      usage: 'ALRT',
      execute: () => CommandsModule.showAlerts()
    },
    salt: {
      category: 'ALRT',
      description: 'Set alert (region > threshold)',
      usage: 'SALT <region> <prob>',
      execute: (args) => CommandsModule.setAlert(args)
    },

    // === SYSTEM ===
    grab: {
      category: 'SYS',
      description: 'Copy screenshot to clipboard',
      usage: 'GRAB',
      execute: () => CommandsModule.grabScreen()
    },
    refresh: {
      category: 'SYS',
      description: 'Refresh all data',
      usage: 'REFRESH',
      execute: () => CommandsModule.refreshData()
    },
    go: {
      category: 'SYS',
      description: 'Open selected market on Polymarket',
      usage: 'GO',
      execute: () => CommandsModule.openSelectedMarket()
    },

    // Aliases for convenience
    markets: { alias: 'allq', execute: (args) => CommandsModule.showMarkets(args) },
    movers: { alias: 'vol', execute: () => CommandsModule.showVolume() }
  },

  // Currently expanded panel (null = none)
  expandedPanel: null,

  // Initialize command input
  init() {
    const input = document.getElementById('command-input');

    // Command input handler
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          this.execute(cmd);
          this.history.push(cmd);
          this.historyIndex = this.history.length;
        }
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          input.value = '';
        }
      } else if (e.key === 'Escape') {
        input.value = '';
        input.blur();
      }
    });

    // Global keyboard shortcuts (Bloomberg function keys)
    document.addEventListener('keydown', (e) => {
      // Don't handle if typing in input
      const isTyping = e.target === input;

      // Function keys (always work)
      if (e.key === 'F1') {
        e.preventDefault();
        this.execute('help');
      } else if (e.key === 'F2') {
        e.preventDefault();
        this.execute('top');
      } else if (e.key === 'F3') {
        e.preventDefault();
        this.execute('vol');
      } else if (e.key === 'F4') {
        e.preventDefault();
        this.execute('news');
      } else if (e.key === 'F5') {
        e.preventDefault();
        this.execute('refresh');
      } else if (e.key === 'F7') {
        e.preventDefault();
        this.execute('osint');
      } else if (e.key === 'F8') {
        e.preventDefault();
        this.execute('alrt');
      }

      // Market navigation (only when not typing)
      if (!isTyping) {
        // Number keys 1-9 to select market
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= 9) {
          e.preventDefault();
          console.log('[NAV] Key pressed:', e.key, '-> selecting market', keyNum - 1);
          this.selectMarket(keyNum - 1);
          return;
        }

        // Page Up/Down or [ ] to cycle through markets
        if (e.key === 'PageDown' || e.key === ']') {
          e.preventDefault();
          this.nextMarket();
          return;
        }
        if (e.key === 'PageUp' || e.key === '[') {
          e.preventDefault();
          this.prevMarket();
          return;
        }

        // Enter to open selected market
        if (e.key === 'Enter' && this.selectedMarketIndex >= 0) {
          e.preventDefault();
          this.openSelectedMarket();
          return;
        }
      }

      // Focus input on any regular key press (letters only)
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && !e.key.startsWith('F')) {
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
          input.focus();
        }
      }
    });

    // Load saved alerts
    this.loadAlerts();

    console.log('[COMMANDS] Bloomberg-style commands initialized');
    console.log('[COMMANDS] Function keys: F1=Help, F2=News, F3=Volume, F5=Refresh, F8=Alerts');
    console.log('[COMMANDS] Market nav: 1-9=Select, []=Prev/Next, Enter=Open');
  },

  // Execute a command
  execute(cmdString) {
    const parts = cmdString.toLowerCase().split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1).join(' ');

    const cmd = this.commands[cmdName];
    if (cmd) {
      console.log(`[CMD] ${cmdName.toUpperCase()}`, args ? `"${args}"` : '');
      cmd.execute(args);
    } else {
      this.showToast(`Unknown: ${cmdName.toUpperCase()}. Press F1 for help.`, 'error');
    }
  },

  // === NAVIGATION COMMANDS ===

  showHelp() {
    const categories = {};
    Object.entries(this.commands).forEach(([name, cmd]) => {
      if (cmd.alias) return; // Skip aliases
      const cat = cmd.category || 'OTHER';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ name: name.toUpperCase(), ...cmd });
    });

    let helpHtml = `
      <div class="help-overlay" onclick="this.remove()">
        <div class="help-modal" onclick="event.stopPropagation()">
          <div class="help-header">
            <span class="help-title">POLYMARKET TERMINAL</span>
            <span class="help-version">v1.0</span>
          </div>
          <div class="help-content">
            <div class="help-section">
              <div class="help-section-title">FUNCTION KEYS</div>
              <div class="help-keys">
                <span class="help-key">F1</span> Help
                <span class="help-key">F2</span> Top News
                <span class="help-key">F3</span> Volume
                <span class="help-key">F4</span> News (expand)
                <span class="help-key">F5</span> Refresh
                <span class="help-key">F7</span> OSINT (expand)
                <span class="help-key">F8</span> Alerts
              </div>
            </div>
            <div class="help-section">
              <div class="help-section-title">MARKET NAVIGATION</div>
              <div class="help-keys">
                <span class="help-key">1-9</span> Select market
                <span class="help-key">]</span> Next market
                <span class="help-key">[</span> Prev market
                <span class="help-key">ENTER</span> Open selected
              </div>
            </div>
    `;

    Object.entries(categories).forEach(([cat, cmds]) => {
      helpHtml += `<div class="help-section"><div class="help-section-title">${cat}</div>`;
      cmds.forEach(cmd => {
        helpHtml += `<div class="help-cmd"><span class="help-usage">${cmd.usage}</span><span class="help-desc">${cmd.description}</span></div>`;
      });
      helpHtml += '</div>';
    });

    helpHtml += `
          </div>
          <div class="help-footer">Press ESC or click outside to close</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', helpHtml);

    // Close on ESC
    const overlay = document.querySelector('.help-overlay');
    const closeHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', closeHandler);
      }
    };
    document.addEventListener('keydown', closeHandler);
  },

  showLast() {
    const last8 = this.history.slice(-8).reverse();
    if (last8.length === 0) {
      this.showToast('No command history', 'info');
      return;
    }
    const list = last8.map((cmd, i) => `${i + 1}. ${cmd.toUpperCase()}`).join('\n');
    this.showToast(`LAST COMMANDS:\n${list}`, 'info', 5000);
  },

  resetView() {
    MapModule.resetView();
    // Restore top volume markets view
    MarketsModule.renderTopMovers();
    this.showToast('Reset to world view', 'info');
  },

  // === NEWS COMMANDS ===

  showTopNews() {
    NewsModule.clearFilter();
    NewsModule.render();
    document.getElementById('news-feed').scrollTop = 0;
    this.showToast('TOP: Showing all news', 'info');
  },

  newsIndustry(topic) {
    if (!topic) {
      this.showToast('Usage: NI <topic> (iran, russia, china, etc.)', 'error');
      return;
    }
    NewsModule.setFilter(topic);
    this.showToast(`NI ${topic.toUpperCase()}: Filtered news`, 'info');
  },

  filterNews(keyword) {
    if (!keyword || keyword === 'clear') {
      NewsModule.clearFilter();
      this.showToast('News filter cleared', 'info');
    } else {
      NewsModule.setFilter(keyword);
      this.showToast(`News filtered: ${keyword.toUpperCase()}`, 'info');
    }
  },

  // === TRACKING COMMANDS ===

  // Strategic regions for flight/ship tracking
  trackingRegions: {
    // Middle East
    iran:       { lat: 32, lon: 53, zoom: 5, name: 'IRAN' },
    hormuz:     { lat: 26.5, lon: 56.5, zoom: 7, name: 'STRAIT OF HORMUZ' },
    israel:     { lat: 31.5, lon: 35, zoom: 7, name: 'ISRAEL' },
    gaza:       { lat: 31.4, lon: 34.4, zoom: 9, name: 'GAZA' },
    syria:      { lat: 35, lon: 38, zoom: 6, name: 'SYRIA' },
    lebanon:    { lat: 33.8, lon: 35.8, zoom: 8, name: 'LEBANON' },
    yemen:      { lat: 15.5, lon: 48, zoom: 6, name: 'YEMEN' },
    redsea:     { lat: 14, lon: 42, zoom: 5, name: 'RED SEA' },
    gulf:       { lat: 27, lon: 51, zoom: 5, name: 'PERSIAN GULF' },

    // Europe / Russia / Ukraine
    ukraine:    { lat: 48.5, lon: 35, zoom: 5, name: 'UKRAINE' },
    crimea:     { lat: 45, lon: 34, zoom: 7, name: 'CRIMEA' },
    blacksea:   { lat: 43, lon: 35, zoom: 5, name: 'BLACK SEA' },
    baltic:     { lat: 58, lon: 22, zoom: 5, name: 'BALTIC SEA' },
    poland:     { lat: 52, lon: 20, zoom: 6, name: 'POLAND' },
    kaliningrad: { lat: 54.7, lon: 20.5, zoom: 7, name: 'KALININGRAD' },

    // Asia Pacific
    taiwan:     { lat: 24, lon: 121, zoom: 6, name: 'TAIWAN STRAIT' },
    southchinasea: { lat: 15, lon: 115, zoom: 4, name: 'SOUTH CHINA SEA' },
    scs:        { lat: 15, lon: 115, zoom: 4, name: 'SOUTH CHINA SEA' },
    korea:      { lat: 38, lon: 127, zoom: 6, name: 'KOREAN PENINSULA' },
    dprk:       { lat: 40, lon: 127, zoom: 6, name: 'NORTH KOREA' },
    japan:      { lat: 36, lon: 138, zoom: 5, name: 'JAPAN' },
    philippines: { lat: 12, lon: 122, zoom: 5, name: 'PHILIPPINES' },

    // Americas
    usa:        { lat: 39, lon: -98, zoom: 4, name: 'USA' },
    conus:      { lat: 39, lon: -98, zoom: 4, name: 'CONUS' },
    eastcoast:  { lat: 38, lon: -76, zoom: 5, name: 'US EAST COAST' },
    westcoast:  { lat: 36, lon: -120, zoom: 5, name: 'US WEST COAST' },
    gulfofmexico: { lat: 26, lon: -90, zoom: 5, name: 'GULF OF MEXICO' },
    caribbean:  { lat: 18, lon: -75, zoom: 5, name: 'CARIBBEAN' },
    venezuela:  { lat: 8, lon: -66, zoom: 5, name: 'VENEZUELA' },
    cuba:       { lat: 22, lon: -79, zoom: 6, name: 'CUBA' },
    panama:     { lat: 9, lon: -79.5, zoom: 8, name: 'PANAMA CANAL' },

    // Africa
    suez:       { lat: 30, lon: 32.5, zoom: 7, name: 'SUEZ CANAL' },
    libya:      { lat: 27, lon: 17, zoom: 5, name: 'LIBYA' },
    somalia:    { lat: 5, lon: 46, zoom: 5, name: 'SOMALIA / HORN' },

    // Global chokepoints
    malacca:    { lat: 3, lon: 101, zoom: 6, name: 'STRAIT OF MALACCA' },
    gibraltar:  { lat: 36, lon: -5.5, zoom: 8, name: 'GIBRALTAR' },
    bosporus:   { lat: 41, lon: 29, zoom: 9, name: 'BOSPORUS' },
  },

  showOsint() {
    OsintModule.showOsint();
    this.showToast('OSINT: Resources & accounts', 'info');
  },

  showTelegram() {
    OsintModule.showTelegram();
    this.showToast('TELEGRAM: Live OSINT feed from conflict zones', 'info');
  },

  showX() {
    OsintModule.showX();
    this.showToast('X: Live OSINT feed from monitored accounts', 'info');
  },

  // Full-screen X view with markets
  openXFullScreen(initialFilter = 'all') {
    // Remove existing overlay if any
    const existing = document.querySelector('.x-fullscreen-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'x-fullscreen-overlay';
    overlay.dataset.currentFilter = initialFilter;
    overlay.dataset.currentMarketToken = '';

    // Filter buttons
    const filters = [
      { id: 'all', label: 'ALL' },
      { id: 'ukraine', label: 'UKRAINE' },
      { id: 'mideast', label: 'MIDEAST' },
      { id: 'iran', label: 'IRAN' },
      { id: 'us', label: 'US' },
    ];

    overlay.innerHTML = `
      <div class="x-full-header">
        <div class="x-full-title">
          <span class="x-full-logo">𝕏</span>
          <span>OSINT MONITOR</span>
        </div>
        <div class="x-full-filters">
          ${filters.map(f => `
            <button class="x-filter-btn ${f.id === initialFilter ? 'active' : ''}" data-filter="${f.id}">${f.label}</button>
          `).join('')}
        </div>
        <button class="x-full-close" data-action="close">ESC TO CLOSE</button>
      </div>
      <div class="x-full-body">
        <div class="x-full-left">
          <div class="x-full-feed-header">LIVE FEED</div>
          <div class="x-full-feed" id="x-full-feed">
            <div class="loading">Loading tweets...</div>
          </div>
        </div>
        <div class="x-full-right">
          <div class="x-full-markets-section">
            <div class="x-full-markets-header">RELATED MARKETS</div>
            <div class="x-full-markets" id="x-full-markets">
              <div class="loading">Loading markets...</div>
            </div>
          </div>
          <div class="x-full-chart-section">
            <div class="x-full-chart-header">
              <span>PRICE CHART</span>
              <span class="x-full-chart-name" id="x-full-chart-name">Select a market</span>
            </div>
            <div class="x-full-chart-legend" id="x-full-chart-legend"></div>
            <div class="x-full-chart" id="x-full-chart">
              <div class="placeholder">Click a market to view chart</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Store chart instance
    overlay.chartInstance = null;

    // Filter button handlers
    overlay.querySelectorAll('.x-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.x-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        overlay.dataset.currentFilter = btn.dataset.filter;
        // Auto-select first tweet when changing filters
        this.loadXFullScreenTweets(overlay, true);
      });
    });

    // Close button
    overlay.querySelector('[data-action="close"]').addEventListener('click', () => {
      if (overlay.refreshInterval) clearInterval(overlay.refreshInterval);
      if (overlay.chartInstance) overlay.chartInstance.remove();
      overlay.remove();
    });

    // ESC to close - but only if no modal is open
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        // Don't close overlay if a modal is open (let the modal handle ESC)
        const openModal = document.querySelector('.bloomberg-orderbook-modal, .help-overlay');
        if (openModal) return;

        if (overlay.refreshInterval) clearInterval(overlay.refreshInterval);
        if (overlay.chartInstance) overlay.chartInstance.remove();
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Load initial data (with auto-select)
    this.loadXFullScreenTweets(overlay, true);

    // Auto-refresh tweets every 60 seconds (without auto-select)
    overlay.refreshInterval = setInterval(() => {
      this.loadXFullScreenTweets(overlay, false);
    }, 60000);

    this.showToast('X Full Screen: Click tweets to see related markets', 'info');
  },

  // Load tweets for full-screen X view
  async loadXFullScreenTweets(overlay, autoSelect = false) {
    const feedContainer = document.getElementById('x-full-feed');
    const filter = overlay.dataset.currentFilter;

    // Remember currently selected tweet URL to re-select after refresh
    const selectedUrl = feedContainer.querySelector('.x-full-tweet.selected')?.dataset.url;

    try {
      const response = await fetch('/api/x');
      const data = await response.json();

      if (!data.configured || !data.messages) {
        feedContainer.innerHTML = '<div class="placeholder">X API not configured</div>';
        return;
      }

      let tweets = data.messages;

      // Filter by region if not 'all'
      if (filter !== 'all') {
        // Map filter to regions
        const regionMap = {
          'ukraine': ['ukraine', 'global'],
          'mideast': ['mideast', 'global'],
          'iran': ['iran', 'mideast', 'global'],
          'us': ['us', 'global'],
        };
        const allowedRegions = regionMap[filter] || [filter, 'global'];
        tweets = tweets.filter(t => allowedRegions.includes(t.region));
      }

      if (tweets.length === 0) {
        feedContainer.innerHTML = '<div class="placeholder">No tweets for this filter</div>';
        return;
      }

      feedContainer.innerHTML = tweets.map(tweet => `
        <div class="x-full-tweet" data-url="${tweet.link}" data-text="${this.escapeAttr(tweet.text)}">
          <div class="x-full-tweet-header">
            <span class="x-full-tweet-source">${tweet.channel}</span>
            <span class="x-full-tweet-handle">${tweet.handle}</span>
            <span class="x-full-tweet-time">${this.formatRelativeTime(tweet.timestamp)}</span>
          </div>
          <div class="x-full-tweet-text">${this.escapeHtml(tweet.text)}</div>
        </div>
      `).join('');

      // Click tweet to find related markets
      feedContainer.querySelectorAll('.x-full-tweet').forEach(el => {
        el.addEventListener('click', () => {
          // Highlight selected tweet
          feedContainer.querySelectorAll('.x-full-tweet').forEach(t => t.classList.remove('selected'));
          el.classList.add('selected');

          // Find markets related to this tweet
          const tweetText = el.dataset.text;
          this.loadMarketsForTweet(overlay, tweetText);
        });

        // Double-click to open in X
        el.addEventListener('dblclick', () => {
          window.open(el.dataset.url, '_blank');
        });
      });

      // Re-select previously selected tweet (just highlight, don't trigger AI)
      if (selectedUrl) {
        const prevSelected = feedContainer.querySelector(`.x-full-tweet[data-url="${selectedUrl}"]`);
        if (prevSelected) {
          prevSelected.classList.add('selected');
        }
      } else if (autoSelect) {
        // Only auto-select first tweet on initial load
        const firstTweet = feedContainer.querySelector('.x-full-tweet');
        if (firstTweet) firstTweet.click();
      }

    } catch (error) {
      console.error('[X-FULL] Tweet load error:', error);
      feedContainer.innerHTML = '<div class="placeholder">Error loading tweets</div>';
    }
  },

  // Load markets related to a specific tweet using AI
  async loadMarketsForTweet(overlay, tweetText) {
    const marketsContainer = document.getElementById('x-full-markets');
    marketsContainer.innerHTML = '<div class="loading">AI analyzing tweet...</div>';

    // Ensure markets are loaded
    if (!MarketsModule.markets || MarketsModule.markets.length === 0) {
      await MarketsModule.fetchMarkets();
    }
    const allEvents = MarketsModule.markets || [];

    // Prepare market list for AI - all liquid markets ($1000+ volume), top 500
    const topMarkets = [...allEvents]
      .filter(m => (m.volume || 0) >= 1000)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 500);

    const marketList = topMarkets.map(m => ({ title: m.title }));

    let markets = [];

    try {
      // Call AI endpoint
      const response = await fetch('/api/match-markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet: tweetText, markets: marketList })
      });

      const data = await response.json();

      if (data.indices && Array.isArray(data.indices)) {
        markets = data.indices
          .filter(i => i >= 0 && i < topMarkets.length)
          .map(i => topMarkets[i]);
        console.log('[AI] Matched', markets.length, 'markets');
      }
    } catch (error) {
      console.error('[AI] Match error:', error);
      // Fallback to keyword matching
      markets = this.keywordMatchMarkets(tweetText, allEvents);
    }

    // If AI returned nothing, try keyword fallback
    if (markets.length === 0) {
      markets = this.keywordMatchMarkets(tweetText, allEvents);
    }

    // If no matches, show message
    if (markets.length === 0) {
      marketsContainer.innerHTML = '<div class="placeholder">No related markets found</div>';
      document.getElementById('x-full-chart').innerHTML = '<div class="placeholder">Click a market to view chart</div>';
      document.getElementById('x-full-chart-name').textContent = 'Select a market';
      return;
    }

    // Render markets
    marketsContainer.innerHTML = markets.map((event, i) => {
      const market = event.markets?.[0];

      // Parse outcomePrices (it's a JSON string)
      let price = '--';
      try {
        const prices = JSON.parse(market?.outcomePrices || '[]');
        if (prices[0]) price = (parseFloat(prices[0]) * 100).toFixed(0) + '%';
      } catch (e) {}

      // Parse clobTokenIds (it's a JSON string)
      let tokenId = '';
      try {
        const tokens = JSON.parse(market?.clobTokenIds || '[]');
        tokenId = tokens[0] || '';
      } catch (e) {}

      return `
        <div class="x-full-market" data-token="${tokenId}" data-title="${this.escapeAttr(event.title)}" data-index="${i}">
          <span class="x-full-market-num">${i + 1}</span>
          <span class="x-full-market-title">${event.title}</span>
          <span class="x-full-market-price">${price}</span>
        </div>
      `;
    }).join('');

    // Store markets for chart access
    overlay.currentMarkets = markets;

    // Click to load chart
    marketsContainer.querySelectorAll('.x-full-market').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        const event = overlay.currentMarkets[index];
        if (event) {
          marketsContainer.querySelectorAll('.x-full-market').forEach(m => m.classList.remove('selected'));
          el.classList.add('selected');
          this.loadXFullScreenChart(overlay, event);
        }
      });
    });

    // Auto-select first market
    const firstMarket = marketsContainer.querySelector('.x-full-market');
    if (firstMarket) firstMarket.click();
  },

  // Fallback keyword matching when AI is unavailable
  keywordMatchMarkets(tweetText, allEvents) {
    const stopWords = ['this', 'that', 'with', 'from', 'have', 'will', 'been', 'were', 'they', 'their', 'what', 'when', 'where', 'which', 'would', 'could', 'should', 'about', 'after', 'before', 'just', 'more', 'some', 'than', 'them', 'then', 'there', 'these', 'into', 'also', 'only', 'https'];
    const words = tweetText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stopWords.includes(w));

    const scored = allEvents.map(event => {
      const text = (event.title + ' ' + (event.description || '')).toLowerCase();
      let score = 0;
      words.forEach(word => {
        if (text.includes(word)) score++;
      });
      return { event, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || (b.event.volume || 0) - (a.event.volume || 0))
      .slice(0, 10)
      .map(s => s.event);
  },

  // Load chart for full-screen X view (supports multi-line)
  async loadXFullScreenChart(overlay, event) {
    const chartContainer = document.getElementById('x-full-chart');
    const chartName = document.getElementById('x-full-chart-name');
    const legendContainer = document.getElementById('x-full-chart-legend');

    chartName.textContent = event.title;
    legendContainer.innerHTML = '';

    // Remove existing chart
    if (overlay.chartInstance) {
      overlay.chartInstance.remove();
      overlay.chartInstance = null;
    }

    chartContainer.innerHTML = '';

    // Colors for multi-line chart
    const colors = ['#ff9500', '#00ff41', '#00a8ff', '#ff3b3b', '#ffcc00', '#ff00ff'];

    // Get markets to chart (up to 6 for multi-choice events)
    const marketsToChart = (event.markets || []).slice(0, 6);

    if (marketsToChart.length === 0) {
      chartContainer.innerHTML = '<div class="placeholder">No chart data</div>';
      return;
    }

    try {
      // Create chart
      const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight || 200,
        layout: {
          background: { color: '#111111' },
          textColor: '#888888',
        },
        grid: {
          vertLines: { color: '#222222' },
          horzLines: { color: '#222222' },
        },
        rightPriceScale: {
          borderColor: '#2a2a2a',
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: '#2a2a2a',
          timeVisible: true,
        },
      });

      overlay.chartInstance = chart;

      // Track series for clickable legend
      const seriesData = [];
      let hasData = false;

      // Load data for each market
      for (let i = 0; i < marketsToChart.length; i++) {
        const market = marketsToChart[i];

        // Parse token ID
        let tokenId = '';
        try {
          const tokens = JSON.parse(market.clobTokenIds || '[]');
          tokenId = tokens[0] || '';
        } catch (e) {}

        if (!tokenId) continue;

        try {
          const response = await fetch(`/api/chart/${tokenId}?interval=max`);
          const data = await response.json();

          if (!data.history || data.history.length === 0) continue;

          // Dedupe and format data
          const timeMap = new Map();
          data.history.forEach(point => {
            if (point.t && typeof point.p === 'number') {
              timeMap.set(point.t, point.p);
            }
          });

          const chartData = Array.from(timeMap.entries())
            .map(([time, value]) => ({ time, value }))
            .sort((a, b) => a.time - b.time);

          if (chartData.length === 0) continue;

          // Add series
          const color = colors[i % colors.length];
          const series = chart.addLineSeries({
            color: color,
            lineWidth: 2,
            priceFormat: {
              type: 'custom',
              formatter: (price) => (price * 100).toFixed(1) + '%',
            },
          });

          series.setData(chartData);
          hasData = true;

          // Track series for legend toggle
          const label = market.groupItemTitle || market.question || `Option ${i + 1}`;
          const shortLabel = label.length > 30 ? label.substring(0, 30) + '...' : label;
          seriesData.push({
            series,
            color,
            label: shortLabel,
            visible: true,
            marketData: { tokenId, title: label }
          });

        } catch (error) {
          console.error('[X-FULL] Chart load error for market', i, error);
        }
      }

      if (!hasData) {
        chartContainer.innerHTML = '<div class="placeholder">No chart data</div>';
        legendContainer.innerHTML = '';
        return;
      }

      // Build clickable legend
      legendContainer.innerHTML = '';
      seriesData.forEach((item, idx) => {
        const legendItem = document.createElement('span');
        legendItem.className = 'legend-item clickable';
        legendItem.innerHTML = `<span class="legend-color" style="background:${item.color}"></span>${item.label}`;
        legendItem.title = 'Click to isolate, click again to show all';

        legendItem.addEventListener('click', () => {
          const allVisible = seriesData.every(s => s.visible);
          const onlyThisVisible = seriesData.every((s, i) => i === idx ? s.visible : !s.visible);

          if (allVisible || !onlyThisVisible) {
            // Isolate: show only clicked
            seriesData.forEach((s, i) => {
              s.series.applyOptions({ visible: i === idx });
              s.visible = i === idx;
            });
            // Track focused market for BOOK command
            overlay.focusedMarket = seriesData[idx].marketData || null;
          } else {
            // Show all
            seriesData.forEach(s => {
              s.series.applyOptions({ visible: true });
              s.visible = true;
            });
            overlay.focusedMarket = null;
          }

          // Update legend styling
          legendContainer.querySelectorAll('.legend-item').forEach((el, i) => {
            el.classList.toggle('dimmed', !seriesData[i].visible);
          });

          chart.timeScale().fitContent();
        });

        legendContainer.appendChild(legendItem);
      });

      chart.timeScale().fitContent();

      // Set first market as default focused market for BOOK command
      if (seriesData.length > 0) {
        overlay.focusedMarket = seriesData[0].marketData;
      }

    } catch (error) {
      console.error('[X-FULL] Chart load error:', error);
      chartContainer.innerHTML = '<div class="placeholder">Error loading chart</div>';
    }
  },

  // Helper: format relative time
  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  },

  // Helper: escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Helper: escape for HTML attributes
  escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, ' ');
  },

  toggleOrderBook() {
    // Check if Bloomberg modal is already showing - toggle off
    const existingModal = document.querySelector('.bloomberg-orderbook-modal');
    if (existingModal) {
      existingModal.remove();
      this.showToast('Order book closed', 'info');
      return;
    }

    // Check if we're in XFULL view - get market from there
    const xFullOverlay = document.querySelector('.x-fullscreen-overlay');
    if (xFullOverlay) {
      // Check for focused market from legend click first
      if (xFullOverlay.focusedMarket?.tokenId) {
        this.showBloombergOrderBook(xFullOverlay.focusedMarket.tokenId, xFullOverlay.focusedMarket.title);
        return;
      }
      // Otherwise use selected market from list
      const selectedMarket = document.querySelector('.x-full-market.selected');
      if (selectedMarket) {
        const tokenId = selectedMarket.dataset.token;
        const title = selectedMarket.dataset.title;
        if (tokenId) {
          this.showBloombergOrderBook(tokenId, title);
          return;
        }
      }
      this.showToast('Select a market first to view order book', 'error');
      return;
    }

    // Normal mode - get market from ChartModule
    // Check for focused market first (isolated from multi-chart legend)
    if (ChartModule.focusedMarket?.tokenId) {
      this.showBloombergOrderBook(ChartModule.focusedMarket.tokenId, ChartModule.focusedMarket.title);
    } else if (ChartModule.currentMarket?.tokenId) {
      this.showBloombergOrderBook(ChartModule.currentMarket.tokenId, ChartModule.currentMarket.marketName);
    } else if (ChartModule.currentMarket?.multi) {
      this.showToast('Click a legend item to isolate a market first', 'info');
    } else {
      this.showToast('Select a market first to view order book', 'error');
    }
  },

  // Show order book as Bloomberg-style modal
  async showBloombergOrderBook(tokenId, title) {
    // Create Bloomberg-style order book modal
    const modal = document.createElement('div');
    modal.className = 'bloomberg-orderbook-modal';
    modal.innerHTML = `
      <div class="bob-container">
        <div class="bob-header">
          <div class="bob-title">
            <span class="bob-label">DEPTH OF BOOK</span>
            <span class="bob-market">${title}</span>
          </div>
          <button class="bob-close">ESC</button>
        </div>
        <div class="bob-content">
          <div class="loading">Loading order book...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.bob-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Fetch and render
    try {
      const response = await fetch(`/api/orderbook/${tokenId}`);
      const data = await response.json();
      console.log('[BOOK] Data received:', data);
      this.renderBloombergOrderBook(modal.querySelector('.bob-content'), data);
    } catch (error) {
      console.error('[BOOK] Error:', error);
      modal.querySelector('.bob-content').innerHTML = '<div class="bob-error">Error loading order book</div>';
    }
  },

  // Bloomberg-style order book render
  renderBloombergOrderBook(container, data) {
    if (!data || (!data.bids?.length && !data.asks?.length)) {
      container.innerHTML = '<div class="bob-error">No order book data available</div>';
      return;
    }

    // API returns: bids sorted ascending (lowest first), asks sorted descending (highest first)
    // Best bid = highest bid = last in array
    // Best ask = lowest ask = last in array
    // Sort properly: bids descending (best at top), asks ascending (best at top going down to spread)
    const bids = [...(data.bids || [])]
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 10);
    const asks = [...(data.asks || [])]
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 10);

    // Calculate max size for bar scaling
    const allSizes = [...bids, ...asks].map(o => parseFloat(o.size));
    const maxSize = Math.max(...allSizes, 1);

    const formatPrice = (price) => (parseFloat(price) * 100).toFixed(1);
    const formatSize = (size) => {
      const num = parseFloat(size);
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toFixed(0);
    };

    // Calculate spread - now bids[0] is best bid, asks[0] is best ask
    let spreadText = '--';
    let bestBidPrice = '--';
    let bestAskPrice = '--';
    if (bids.length && asks.length) {
      const bestBid = parseFloat(bids[0].price) * 100;
      const bestAsk = parseFloat(asks[0].price) * 100;
      spreadText = (bestAsk - bestBid).toFixed(1) + '¢';
      bestBidPrice = bestBid.toFixed(1) + '¢';
      bestAskPrice = bestAsk.toFixed(1) + '¢';
    }

    // Build Bloomberg-style layout
    let html = `
      <div class="bob-spread-bar">
        <span class="bob-best-bid">${bestBidPrice}</span>
        <span class="bob-spread-center">
          <span class="bob-spread-label">SPREAD</span>
          <span class="bob-spread-value">${spreadText}</span>
        </span>
        <span class="bob-best-ask">${bestAskPrice}</span>
      </div>
      <div class="bob-ladder">
        <div class="bob-side bob-asks">
          <div class="bob-side-header">
            <span>ASK</span>
            <span>SIZE</span>
            <span>PRICE</span>
          </div>
    `;

    // Asks: show from highest (far from spread) down to lowest (nearest spread)
    // So we reverse the sorted asks to show highest at top
    const asksDisplay = [...asks].reverse();
    asksDisplay.forEach(order => {
      const size = parseFloat(order.size);
      const barWidth = Math.min((size / maxSize) * 100, 100);
      html += `
        <div class="bob-row bob-ask-row">
          <div class="bob-depth-bar ask-bar" style="width:${barWidth}%"></div>
          <span class="bob-cell"></span>
          <span class="bob-cell bob-size">${formatSize(size)}</span>
          <span class="bob-cell bob-price">${formatPrice(order.price)}¢</span>
        </div>
      `;
    });

    html += `
        </div>
        <div class="bob-side bob-bids">
          <div class="bob-side-header">
            <span>PRICE</span>
            <span>SIZE</span>
            <span>BID</span>
          </div>
    `;

    // Bids: show from highest (nearest spread) to lowest (far from spread)
    // bids is already sorted descending, so just display in order
    bids.forEach(order => {
      const size = parseFloat(order.size);
      const barWidth = Math.min((size / maxSize) * 100, 100);
      html += `
        <div class="bob-row bob-bid-row">
          <div class="bob-depth-bar bid-bar" style="width:${barWidth}%"></div>
          <span class="bob-cell bob-price">${formatPrice(order.price)}¢</span>
          <span class="bob-cell bob-size">${formatSize(size)}</span>
          <span class="bob-cell"></span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  showFlights(region) {
    this.openTrackingOverlay('flights', region);
  },

  showShips(region) {
    this.openTrackingOverlay('ships', region);
  },

  openTrackingOverlay(mode = 'flights', regionArg = null, filter = 'all') {
    // Remove existing overlay if any
    const existing = document.querySelector('.tracking-overlay');
    if (existing) existing.remove();

    // Parse region
    let region = null;
    let lat = 30, lon = 40, zoom = 3; // Default: Middle East overview

    if (regionArg) {
      const regionKey = regionArg.toLowerCase().replace(/\s+/g, '');
      region = this.trackingRegions[regionKey];
      if (region) {
        lat = region.lat;
        lon = region.lon;
        zoom = region.zoom;
      } else {
        // Show available regions
        const available = Object.keys(this.trackingRegions).join(', ');
        this.showToast(`Unknown region. Try: ${available}`, 'error', 5000);
        return;
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'tracking-overlay';
    overlay.dataset.currentRegion = regionArg || '';
    overlay.dataset.currentFilter = filter;

    const isFlights = mode === 'flights';
    const isMilitary = filter === 'military';
    const title = isFlights ? 'FLIGHT TRACKER' : 'SHIP TRACKER';
    const regionLabel = region ? region.name : 'GLOBAL';
    const filterLabel = isFlights ? (isMilitary ? 'MILITARY' : 'ALL AIRCRAFT') : 'MILITARY + TANKERS';
    const badge = `${filterLabel} | ${regionLabel}`;

    // ADS-B: mapDim=0.6 darkens map, mil=1 shows only military aircraft
    // MarineTraffic: maptype:4 is satellite/dark, vtypes:3,8 = Military + Tankers
    let iframeSrc;
    if (isFlights) {
      const milParam = isMilitary ? '&mil=1' : '';
      iframeSrc = `https://globe.adsbexchange.com/?hideSidebar&hideButtons&mapDim=0.6&darkMode=true${milParam}&zoom=${zoom}&lat=${lat}&lon=${lon}`;
    } else {
      iframeSrc = `https://www.marinetraffic.com/en/ais/embed/zoom:${zoom}/centery:${lat}/centerx:${lon}/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:3,8/showmenu:/remember:false`;
    }

    // Quick region buttons for common hotspots
    const quickRegions = ['hormuz', 'ukraine', 'taiwan', 'redsea', 'usa'];

    overlay.innerHTML = `
      <div class="tracking-overlay-header">
        <div>
          <span class="tracking-overlay-title">${title}</span>
          <span class="tracking-overlay-badge">${badge}</span>
        </div>
        <div class="tracking-overlay-controls">
          <button class="tracking-overlay-btn ${isFlights ? 'active' : ''}" data-mode="flights">FLIGHTS</button>
          <button class="tracking-overlay-btn ${!isFlights ? 'active' : ''}" data-mode="ships">SHIPS</button>
          <span class="tracking-overlay-divider">|</span>
          ${isFlights ? `
            <button class="tracking-overlay-btn ${!isMilitary ? 'active' : ''}" data-filter="all">ALL</button>
            <button class="tracking-overlay-btn ${isMilitary ? 'active' : ''}" data-filter="military">MIL</button>
            <span class="tracking-overlay-divider">|</span>
          ` : ''}
          ${quickRegions.map(r => `
            <button class="tracking-overlay-btn tracking-region-btn" data-region="${r}">${this.trackingRegions[r].name}</button>
          `).join('')}
          <span class="tracking-overlay-divider">|</span>
          <button class="tracking-overlay-btn tracking-overlay-close" data-action="close">ESC</button>
        </div>
      </div>
      <div class="tracking-overlay-body">
        <iframe src="${iframeSrc}" allowfullscreen></iframe>
      </div>
    `;

    document.body.appendChild(overlay);

    // Store current mode for region switching
    overlay.dataset.currentMode = mode;

    // Button handlers
    overlay.querySelectorAll('.tracking-overlay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const switchMode = btn.dataset.mode;
        const switchRegion = btn.dataset.region;
        const switchFilter = btn.dataset.filter;

        if (action === 'close') {
          overlay.remove();
        } else if (switchMode) {
          const currentRegion = overlay.dataset.currentRegion;
          const currentFilter = overlay.dataset.currentFilter;
          this.openTrackingOverlay(switchMode, currentRegion || null, currentFilter);
        } else if (switchRegion) {
          const currentMode = overlay.dataset.currentMode;
          const currentFilter = overlay.dataset.currentFilter;
          this.openTrackingOverlay(currentMode, switchRegion, currentFilter);
        } else if (switchFilter) {
          const currentMode = overlay.dataset.currentMode;
          const currentRegion = overlay.dataset.currentRegion;
          this.openTrackingOverlay(currentMode, currentRegion || null, switchFilter);
        }
      });
    });

    // ESC key to close - but only if no modal is open
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.bloomberg-orderbook-modal, .help-overlay');
        if (openModal) return;

        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    this.showToast(`${title}: ${regionLabel} | Press ESC to close`, 'info');
  },

  // Full-screen chart
  showFullChart(keyword) {
    // Find the market to chart
    let marketData = null;

    if (keyword) {
      // Search for a market by keyword
      const kw = keyword.toLowerCase();
      const allEvents = MarketsModule.markets || [];

      for (const event of allEvents) {
        if (event.title.toLowerCase().includes(kw)) {
          marketData = event;
          break;
        }
      }

      if (!marketData) {
        this.showToast(`No market found matching "${keyword}"`, 'error');
        return;
      }
    } else {
      // Use current chart market
      if (ChartModule.currentMarket) {
        if (ChartModule.currentMarket.multi) {
          // Multi-chart (term structure or multiple choice)
          this.openChartOverlay({
            multi: true,
            title: ChartModule.currentMarket.eventTitle,
            dateMarkets: ChartModule.currentMarket.dateMarkets
          });
          return;
        } else {
          // Single market - find full data
          const tokenId = ChartModule.currentMarket.tokenId;
          const allEvents = MarketsModule.markets || [];

          for (const event of allEvents) {
            if (event.tokenId === tokenId) {
              marketData = event;
              break;
            }
            // Check markets within event
            if (event.markets) {
              for (const m of event.markets) {
                if (m.clobTokenIds?.includes(tokenId)) {
                  marketData = event;
                  break;
                }
              }
            }
          }

          if (!marketData) {
            // Fall back to basic info from ChartModule
            this.openChartOverlay({
              multi: false,
              title: ChartModule.currentMarket.marketName,
              tokenId: ChartModule.currentMarket.tokenId,
              price: null,
              change: null
            });
            return;
          }
        }
      } else {
        this.showToast('No chart loaded. Use CHART <keyword> or select a market first.', 'error');
        return;
      }
    }

    // Build chart data from event
    if (marketData.eventType === 'multiple-choice' && marketData.choices) {
      this.openChartOverlay({
        multi: true,
        title: marketData.title,
        dateMarkets: marketData.choices
      });
    } else if (marketData.eventType === 'date-series' && marketData.dateMarkets) {
      this.openChartOverlay({
        multi: true,
        title: marketData.title,
        dateMarkets: marketData.dateMarkets
      });
    } else {
      this.openChartOverlay({
        multi: false,
        title: marketData.title,
        tokenId: marketData.tokenId,
        price: marketData.price,
        change: marketData.priceChange,
        volume: marketData.volume
      });
    }
  },

  openChartOverlay(data) {
    // Remove existing overlay
    const existing = document.querySelector('.chart-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'chart-overlay';

    const intervals = ['1h', '6h', '1d', '1w', 'max'];
    const currentInterval = ChartModule.currentInterval || 'max';

    // Format price and change
    const priceStr = data.price ? `${(data.price * 100).toFixed(1)}%` : '';
    const changeVal = data.change || 0;
    const changeStr = changeVal !== 0 ? `${changeVal > 0 ? '+' : ''}${(changeVal * 100).toFixed(1)}%` : '';
    const changeClass = changeVal > 0 ? 'positive' : changeVal < 0 ? 'negative' : '';

    overlay.innerHTML = `
      <div class="chart-overlay-header">
        <div style="display: flex; align-items: center;">
          <span class="chart-overlay-title">CHART</span>
          <span class="chart-overlay-market">${data.title}</span>
          ${priceStr ? `<span class="chart-overlay-price">${priceStr}</span>` : ''}
          ${changeStr ? `<span class="chart-overlay-change ${changeClass}">${changeStr}</span>` : ''}
        </div>
        <div class="chart-overlay-controls">
          ${intervals.map(int => `
            <button class="chart-overlay-btn ${int === currentInterval ? 'active' : ''}" data-interval="${int}">${int.toUpperCase()}</button>
          `).join('')}
          <span class="tracking-overlay-divider">|</span>
          <button class="chart-overlay-btn" data-action="close">ESC TO CLOSE</button>
        </div>
      </div>
      <div class="chart-overlay-body">
        <div id="fullscreen-chart-container" class="chart-overlay-container"></div>
        <div class="chart-overlay-legend" id="fullscreen-chart-legend"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Create chart in overlay
    const container = document.getElementById('fullscreen-chart-container');
    const fullscreenChart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: '#111111' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: '#222222' },
        horzLines: { color: '#222222' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Store for interval changes
    overlay.chartInstance = fullscreenChart;
    overlay.chartData = data;
    overlay.seriesList = [];

    // Load chart data
    this.loadFullscreenChartData(overlay, currentInterval);

    // Button handlers
    overlay.querySelectorAll('.chart-overlay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const interval = btn.dataset.interval;

        if (action === 'close') {
          fullscreenChart.remove();
          overlay.remove();
        } else if (interval) {
          // Update active button
          overlay.querySelectorAll('[data-interval]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // Reload with new interval
          this.loadFullscreenChartData(overlay, interval);
        }
      });
    });

    // ESC to close - but only if no modal is open
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.bloomberg-orderbook-modal, .help-overlay');
        if (openModal) return;

        fullscreenChart.remove();
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Handle resize
    const resizeHandler = () => {
      fullscreenChart.resize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', resizeHandler);
    overlay.resizeHandler = resizeHandler;

    this.showToast(`CHART: ${data.title} | Press ESC to close`, 'info');
  },

  async loadFullscreenChartData(overlay, interval) {
    const chart = overlay.chartInstance;
    const data = overlay.chartData;
    const legendContainer = document.getElementById('fullscreen-chart-legend');

    // Clear existing series
    overlay.seriesList.forEach(s => chart.removeSeries(s));
    overlay.seriesList = [];
    legendContainer.innerHTML = '';

    const colors = ['#ff9500', '#00ff41', '#00a8ff', '#ff3b3b', '#ffcc00', '#ff00ff'];

    if (data.multi && data.dateMarkets) {
      // Multi-line chart
      for (let i = 0; i < Math.min(data.dateMarkets.length, 6); i++) {
        const dm = data.dateMarkets[i];
        if (!dm.tokenId) continue;

        try {
          const response = await fetch(`/api/chart/${dm.tokenId}?interval=${interval}`);
          const result = await response.json();

          if (!result.history || result.history.length === 0) continue;

          const timeMap = new Map();
          result.history.forEach(point => {
            if (point.t && typeof point.p === 'number') {
              timeMap.set(point.t, point.p);
            }
          });

          const chartData = Array.from(timeMap.entries())
            .map(([time, value]) => ({ time, value }))
            .sort((a, b) => a.time - b.time);

          if (chartData.length === 0) continue;

          const color = colors[i % colors.length];
          const series = chart.addLineSeries({
            color: color,
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            lastValueVisible: true,
            priceLineVisible: false,
            priceFormat: {
              type: 'custom',
              formatter: (price) => (price * 100).toFixed(1) + '%',
            },
          });
          series.setData(chartData);
          overlay.seriesList.push(series);

          // Add legend item
          legendContainer.innerHTML += `
            <span class="legend-item">
              <span class="legend-color" style="background:${color}"></span>
              ${dm.title}
            </span>
          `;
        } catch (error) {
          console.error('[CHART] Error loading', dm.title, error);
        }
      }
    } else {
      // Single line chart
      if (!data.tokenId) return;

      try {
        const response = await fetch(`/api/chart/${data.tokenId}?interval=${interval}`);
        const result = await response.json();

        if (result.history && result.history.length > 0) {
          const timeMap = new Map();
          result.history.forEach(point => {
            if (point.t && typeof point.p === 'number') {
              timeMap.set(point.t, point.p);
            }
          });

          const chartData = Array.from(timeMap.entries())
            .map(([time, value]) => ({ time, value }))
            .sort((a, b) => a.time - b.time);

          if (chartData.length > 0) {
            const series = chart.addLineSeries({
              color: colors[0],
              lineWidth: 2,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 4,
              lastValueVisible: true,
              priceLineVisible: true,
              priceFormat: {
                type: 'custom',
                formatter: (price) => (price * 100).toFixed(1) + '%',
              },
            });
            series.setData(chartData);
            overlay.seriesList.push(series);
          }
        }
      } catch (error) {
        console.error('[CHART] Error loading chart:', error);
      }
    }

    chart.timeScale().fitContent();
  },

  // === MARKET COMMANDS ===

  focusRegion(regionName) {
    if (!regionName) {
      this.showToast('Usage: GP <region> (iran, russia, china, etc.)', 'error');
      return;
    }

    let success = MapModule.focusRegion(regionName);
    if (!success) {
      const regionId = MapModule.getRegionByKeyword(regionName);
      if (regionId) {
        MapModule.focusRegion(regionId);
        success = true;
      }
    }

    if (success) {
      this.showToast(`GP ${regionName.toUpperCase()}: Focused`, 'info');
    } else {
      this.showToast(`Region not found: ${regionName.toUpperCase()}`, 'error');
    }
  },

  showVolume() {
    MarketsModule.renderTopMovers();
    this.showToast('VOL: Top volume geopolitical markets', 'info');
  },

  showHot() {
    MarketsModule.renderHotMarkets();
    this.showToast('HOT: Markets with highest 24hr volume', 'info');
  },

  showMovers() {
    MarketsModule.renderPriceMovers();
    this.showToast('MV: Biggest price movers (1 week change)', 'info');
  },

  showDomestic() {
    MarketsModule.renderDomesticMarkets();
    this.showToast('US: Domestic policy & elections', 'info');
  },

  showMarkets(regionName) {
    if (!regionName) {
      this.showToast('Usage: ALLQ <region>', 'error');
      return;
    }

    let regionId = regionName.toLowerCase().replace(/\s+/g, '');
    if (!MapModule.regions[regionId]) {
      regionId = MapModule.getRegionByKeyword(regionName);
    }

    if (regionId) {
      MapModule.focusRegion(regionId);
      MarketsModule.renderRegionMarkets(regionId);
      this.showToast(`ALLQ ${regionName.toUpperCase()}: Showing markets`, 'info');
    } else {
      this.showToast(`Region not found: ${regionName.toUpperCase()}`, 'error');
    }
  },

  // === ALERT COMMANDS ===

  showAlerts() {
    if (this.alerts.length === 0) {
      this.showToast('No alerts set. Use: SALT <region> <prob>', 'info');
      return;
    }

    const list = this.alerts.map((a, i) =>
      `${i + 1}. ${a.region.toUpperCase()} > ${a.threshold}%`
    ).join('\n');

    this.showToast(`ACTIVE ALERTS:\n${list}\n\nUse: ALRT DEL <num> to remove`, 'info', 5000);
  },

  setAlert(args) {
    const parts = args.split(/\s+/);
    if (parts.length < 2) {
      this.showToast('Usage: SALT <region> <probability>\nExample: SALT iran 50', 'error');
      return;
    }

    const region = parts[0];
    const threshold = parseInt(parts[1]);

    if (isNaN(threshold) || threshold < 1 || threshold > 99) {
      this.showToast('Threshold must be 1-99', 'error');
      return;
    }

    // Verify region exists
    let regionId = region.toLowerCase();
    if (!MapModule.regions[regionId]) {
      regionId = MapModule.getRegionByKeyword(region);
    }

    if (!regionId) {
      this.showToast(`Region not found: ${region.toUpperCase()}`, 'error');
      return;
    }

    this.alerts.push({
      region: regionId,
      threshold: threshold,
      created: Date.now()
    });

    this.saveAlerts();
    this.showToast(`ALERT SET: ${region.toUpperCase()} > ${threshold}%`, 'success');
  },

  saveAlerts() {
    localStorage.setItem('polymarket_alerts', JSON.stringify(this.alerts));
  },

  loadAlerts() {
    try {
      const saved = localStorage.getItem('polymarket_alerts');
      if (saved) {
        this.alerts = JSON.parse(saved);
        console.log('[ALERTS] Loaded', this.alerts.length, 'alerts');
      }
    } catch (e) {
      console.error('[ALERTS] Load error:', e);
    }
  },

  checkAlerts() {
    // Called periodically to check if any alert conditions are met
    this.alerts.forEach(alert => {
      const markets = MarketsModule.getMarketsForRegion(alert.region);
      markets.forEach(market => {
        const prob = Math.round(market.price * 100);
        if (prob >= alert.threshold) {
          this.showToast(
            `ALERT: ${market.title.substring(0, 40)}... at ${prob}%`,
            'warning',
            10000
          );
        }
      });
    });
  },

  // === SYSTEM COMMANDS ===

  grabScreen() {
    // Create a text summary to copy
    const markets = MarketsModule.getTopByVolume(5);
    const summary = markets.map(m =>
      `${m.title}: ${Math.round(m.price * 100)}% (${MarketsModule.formatVolume(m.volume)})`
    ).join('\n');

    const text = `POLYMARKET GEOPOLITICAL TERMINAL\n${new Date().toLocaleString()}\n\nTOP VOLUME:\n${summary}\n\nhttps://polymarket.com`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('GRAB: Summary copied to clipboard', 'success');
    }).catch(() => {
      this.showToast('GRAB: Copy failed', 'error');
    });
  },

  async refreshData() {
    this.showToast('Refreshing data...', 'info');

    await Promise.all([
      MarketsModule.fetchMarkets(),
      NewsModule.fetchNews(),
      OsintModule.fetchOsint()
    ]);

    MarketsModule.render();
    NewsModule.render();
    OsintModule.render();

    // Check alerts after refresh
    this.checkAlerts();

    this.showToast('Data refreshed', 'success');
  },

  // === UI HELPERS ===

  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<pre>${message}</pre>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // === PANEL EXPANSION ===

  togglePanel(panelType) {
    const terminal = document.querySelector('.terminal');
    const newsPanel = document.querySelector('.news-panel');
    const osintPanel = document.querySelector('.osint-panel');
    const feedsRow = document.querySelector('.feeds-row');
    const mapPanel = document.querySelector('.map-panel');
    const bottomRow = document.querySelector('.bottom-row');

    // If same panel is already expanded, collapse it
    if (this.expandedPanel === panelType) {
      terminal.classList.remove('panel-expanded');
      newsPanel.classList.remove('expanded', 'hidden');
      osintPanel.classList.remove('expanded', 'hidden');
      feedsRow.classList.remove('expanded');
      mapPanel.classList.remove('hidden');
      bottomRow.classList.remove('hidden');
      this.expandedPanel = null;
      this.showToast(`${panelType.toUpperCase()} panel collapsed`, 'info');
      return;
    }

    // Expand the selected panel
    terminal.classList.add('panel-expanded');
    mapPanel.classList.add('hidden');
    bottomRow.classList.add('hidden');
    feedsRow.classList.add('expanded');

    if (panelType === 'news') {
      newsPanel.classList.add('expanded');
      newsPanel.classList.remove('hidden');
      osintPanel.classList.add('hidden');
      osintPanel.classList.remove('expanded');
    } else if (panelType === 'osint') {
      osintPanel.classList.add('expanded');
      osintPanel.classList.remove('hidden');
      newsPanel.classList.add('hidden');
      newsPanel.classList.remove('expanded');
    }

    this.expandedPanel = panelType;
    this.showToast(`${panelType.toUpperCase()} panel expanded. Type ${panelType.toUpperCase()} again to collapse.`, 'info');
  },

  // === MARKET NAVIGATION ===

  // Update the markets list for navigation
  updateMarketsList() {
    const container = document.getElementById('top-movers');
    const items = container.querySelectorAll('.market-item');
    this.marketsList = Array.from(items).map(item => ({
      element: item,
      slug: item.dataset.slug
    }));
  },

  // Select a market by index
  selectMarket(index) {
    this.updateMarketsList();

    if (this.marketsList.length === 0) {
      this.showToast('No markets to select', 'error');
      return;
    }

    if (index < 0 || index >= this.marketsList.length) {
      this.showToast(`Invalid selection. Use 1-${this.marketsList.length}`, 'error');
      return;
    }

    // Clear previous selection
    this.marketsList.forEach(m => m.element.classList.remove('selected'));

    // Select new market
    this.selectedMarketIndex = index;
    const market = this.marketsList[index];
    market.element.classList.add('selected');
    market.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Get market title for toast
    const title = market.element.querySelector('.market-title')?.textContent || 'Market';
    this.showToast(`[${index + 1}] ${title.substring(0, 40)}...\nPress ENTER or GO to open`, 'info');
  },

  // Select next market
  nextMarket() {
    this.updateMarketsList();
    if (this.marketsList.length === 0) return;

    const nextIndex = this.selectedMarketIndex < 0
      ? 0
      : (this.selectedMarketIndex + 1) % this.marketsList.length;
    this.selectMarket(nextIndex);
  },

  // Select previous market
  prevMarket() {
    this.updateMarketsList();
    if (this.marketsList.length === 0) return;

    const prevIndex = this.selectedMarketIndex <= 0
      ? this.marketsList.length - 1
      : this.selectedMarketIndex - 1;
    this.selectMarket(prevIndex);
  },

  // Open the selected market on Polymarket
  openSelectedMarket() {
    if (this.selectedMarketIndex < 0 || !this.marketsList[this.selectedMarketIndex]) {
      this.showToast('No market selected. Press 1-9 or use ] to select.', 'error');
      return;
    }

    const slug = this.marketsList[this.selectedMarketIndex].slug;
    if (slug) {
      window.open(`https://polymarket.com/event/${slug}`, '_blank');
      this.showToast('Opening market on Polymarket...', 'success');
    }
  }
};

// Add toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    position: fixed;
    top: 60px;
    right: 20px;
    padding: 12px 20px;
    background: var(--bg-panel);
    border: 1px solid var(--border-color);
    color: var(--text-bright);
    font-family: var(--font-mono);
    font-size: 11px;
    z-index: 1000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    max-width: 350px;
  }
  .toast.show {
    opacity: 1;
    transform: translateX(0);
  }
  .toast pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: inherit;
  }
  .toast-info { border-left: 3px solid var(--accent); }
  .toast-success { border-left: 3px solid var(--positive); }
  .toast-error { border-left: 3px solid var(--negative); }
  .toast-warning { border-left: 3px solid var(--warning); }

  /* Help overlay */
  .help-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .help-modal {
    background: var(--bg-panel);
    border: 2px solid var(--text-primary);
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }
  .help-header {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--text-primary);
    color: var(--bg-primary);
  }
  .help-title {
    font-weight: 700;
    font-size: 14px;
  }
  .help-version {
    font-size: 11px;
  }
  .help-content {
    padding: 16px;
  }
  .help-section {
    margin-bottom: 16px;
  }
  .help-section-title {
    color: var(--text-primary);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-color);
  }
  .help-cmd {
    display: flex;
    padding: 4px 0;
    font-size: 11px;
  }
  .help-usage {
    color: var(--accent);
    min-width: 150px;
  }
  .help-desc {
    color: var(--text-secondary);
  }
  .help-keys {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 11px;
    color: var(--text-secondary);
  }
  .help-key {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 2px 8px;
    color: var(--text-bright);
    margin-right: 4px;
  }
  .help-footer {
    padding: 8px 16px;
    text-align: center;
    font-size: 10px;
    color: var(--text-dim);
    border-top: 1px solid var(--border-color);
  }

  /* Selected market highlight */
  .market-item.selected {
    background: var(--bg-hover) !important;
    border-left: 3px solid var(--text-primary) !important;
    padding-left: 5px;
  }
  .market-item.selected .market-title {
    color: var(--text-primary) !important;
  }
  .region-market.selected {
    background: var(--bg-hover) !important;
    border-left: 3px solid var(--text-primary) !important;
  }

  /* X Full Screen Overlay */
  .x-fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 42px;
    background: var(--bg-primary);
    z-index: 1500;
    display: flex;
    flex-direction: column;
  }

  .x-full-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--bg-secondary);
    border-bottom: 2px solid var(--text-primary);
  }

  .x-full-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .x-full-logo {
    font-size: 20px;
  }

  .x-full-filters {
    display: flex;
    gap: 4px;
  }

  .x-filter-btn {
    background: var(--bg-panel);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 6px 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .x-filter-btn:hover {
    background: var(--bg-hover);
    color: var(--text-bright);
  }

  .x-filter-btn.active {
    background: var(--text-primary);
    color: var(--bg-primary);
    border-color: var(--text-primary);
  }

  .x-full-close {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-dim);
    padding: 6px 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    cursor: pointer;
  }

  .x-full-close:hover {
    color: var(--negative);
    border-color: var(--negative);
  }

  .x-full-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .x-full-left {
    width: 45%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-color);
  }

  .x-full-feed-header {
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .x-full-feed {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .x-full-tweet {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.15s;
  }

  .x-full-tweet:hover {
    background: var(--bg-hover);
  }

  .x-full-tweet.selected {
    background: var(--bg-hover);
    border-left: 3px solid var(--accent);
  }

  .x-full-tweet-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .x-full-tweet-source {
    font-size: 10px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--text-primary);
    padding: 2px 6px;
    border-radius: 2px;
  }

  .x-full-tweet-handle {
    font-size: 10px;
    color: var(--text-dim);
  }

  .x-full-tweet-time {
    font-size: 9px;
    color: var(--text-dim);
    margin-left: auto;
  }

  .x-full-tweet-text {
    font-size: 12px;
    color: var(--text-bright);
    line-height: 1.5;
  }

  .x-full-right {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .x-full-markets-section {
    height: 40%;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--border-color);
  }

  .x-full-markets-header {
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .x-full-markets {
    flex: 1;
    overflow-y: auto;
  }

  .x-full-market {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.15s;
  }

  .x-full-market:hover {
    background: var(--bg-hover);
  }

  .x-full-market.selected {
    background: var(--bg-hover);
    border-left: 3px solid var(--accent);
  }

  .x-full-market-num {
    font-size: 10px;
    color: var(--text-dim);
    width: 20px;
  }

  .x-full-market-title {
    flex: 1;
    font-size: 11px;
    color: var(--text-bright);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 12px;
  }

  .x-full-market-price {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .x-full-chart-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .x-full-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .x-full-chart-name {
    font-weight: 400;
    color: var(--text-secondary);
    max-width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .x-full-chart {
    flex: 1;
    background: #111111;
  }

  .x-full-chart .placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    font-size: 12px;
  }

  .x-full-chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-size: 10px;
    min-height: 0;
  }

  .x-full-chart-legend:empty {
    display: none;
  }

  .x-full-chart-legend .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    transition: opacity 0.2s, color 0.2s;
  }

  .x-full-chart-legend .legend-item.clickable {
    cursor: pointer;
  }

  .x-full-chart-legend .legend-item.clickable:hover {
    color: var(--text-bright);
  }

  .x-full-chart-legend .legend-item.dimmed {
    opacity: 0.3;
  }

  .x-full-chart-legend .legend-item.dimmed:hover {
    opacity: 0.6;
  }

  .x-full-chart-legend .legend-color {
    width: 12px;
    height: 3px;
    border-radius: 1px;
  }

  /* Bloomberg-style Order Book Modal */
  .bloomberg-orderbook-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5000;
  }

  .bob-container {
    background: #0a0a0a;
    border: 2px solid var(--text-primary);
    width: 400px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .bob-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--text-primary);
    color: #000;
  }

  .bob-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bob-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .bob-market {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.8;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bob-close {
    background: #000;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    cursor: pointer;
  }

  .bob-close:hover {
    background: var(--negative);
    color: #fff;
  }

  .bob-content {
    padding: 12px;
    overflow-y: auto;
  }

  .bob-error {
    color: var(--text-dim);
    text-align: center;
    padding: 20px;
    font-size: 11px;
  }

  .bob-spread-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    margin-bottom: 12px;
  }

  .bob-best-bid {
    font-size: 14px;
    font-weight: 700;
    color: var(--positive);
  }

  .bob-best-ask {
    font-size: 14px;
    font-weight: 700;
    color: var(--negative);
  }

  .bob-spread-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .bob-spread-label {
    font-size: 9px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .bob-spread-value {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .bob-ladder {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bob-side {
    display: flex;
    flex-direction: column;
  }

  .bob-asks {
    margin-bottom: 4px;
  }

  .bob-side-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 4px 8px;
    font-size: 9px;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border-color);
    text-align: center;
  }

  .bob-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 6px 8px;
    position: relative;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .bob-depth-bar {
    position: absolute;
    top: 0;
    height: 100%;
    opacity: 0.15;
  }

  .bob-ask-row .bob-depth-bar {
    right: 0;
    background: var(--negative);
  }

  .bob-bid-row .bob-depth-bar {
    left: 0;
    background: var(--positive);
  }

  .bob-cell {
    text-align: center;
    z-index: 1;
  }

  .bob-ask-row {
    color: var(--negative);
  }

  .bob-bid-row {
    color: var(--positive);
  }

  .bob-price {
    font-weight: 600;
  }

  .bob-size {
    color: var(--text-secondary);
  }

  .bob-ask-row .bob-size,
  .bob-bid-row .bob-size {
    color: inherit;
    opacity: 0.8;
  }

  .x-full-chart-section {
    position: relative;
  }
`;
document.head.appendChild(toastStyles);
