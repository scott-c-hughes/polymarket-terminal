// ============================================
// OSINT MODULE - Live tracking resources & X accounts
// With embedded flight/ship tracking
// ============================================

const OsintModule = {
  tweets: [],
  accounts: [],
  filterKeyword: null,
  currentView: 'osint', // 'osint', 'telegram', 'x', 'flights', 'ships'
  telegramData: null,
  telegramRefreshInterval: null,
  TELEGRAM_REFRESH_RATE: 60000, // 60 seconds
  xData: null,
  xRefreshInterval: null,
  X_REFRESH_RATE: 60000, // 60 seconds

  // OSINT tracking resources - free tools
  resources: [
    // Live Conflict Maps
    { category: 'CONFLICT MAPS', items: [
      { name: 'Liveuamap Ukraine', url: 'https://liveuamap.com/', icon: '🗺️' },
      { name: 'Liveuamap Israel', url: 'https://israelpalestine.liveuamap.com/', icon: '🗺️' },
      { name: 'Liveuamap Syria', url: 'https://syria.liveuamap.com/', icon: '🗺️' },
      { name: 'ACLED Conflict Data', url: 'https://acleddata.com/dashboard/', icon: '📊' },
      { name: 'GeoConfirmed', url: 'https://geoconfirmed.org/', icon: '✓' },
    ]},
    // Flight & Ship Tracking
    { category: 'TRACKING', items: [
      { name: 'ADS-B Exchange', url: 'https://globe.adsbexchange.com/', icon: '✈️' },
      { name: 'Flightradar24', url: 'https://www.flightradar24.com/', icon: '✈️' },
      { name: 'MarineTraffic', url: 'https://www.marinetraffic.com/', icon: '🚢' },
      { name: 'VesselFinder', url: 'https://www.vesselfinder.com/', icon: '🚢' },
    ]},
    // Satellite & Imagery
    { category: 'SATELLITE', items: [
      { name: 'Sentinel Hub', url: 'https://apps.sentinel-hub.com/eo-browser/', icon: '🛰️' },
      { name: 'NASA Worldview', url: 'https://worldview.earthdata.nasa.gov/', icon: '🛰️' },
      { name: 'Zoom Earth', url: 'https://zoom.earth/', icon: '🌍' },
    ]},
  ],

  // Recommended X/Twitter OSINT accounts
  xAccounts: [
    { handle: '@Osint613', desc: 'Middle East OSINT' },
    { handle: '@sentdefender', desc: 'Global conflicts' },
    { handle: '@IntelCrab', desc: 'Breaking geopolitical' },
    { handle: '@Aurora_Intel', desc: 'Military tracking' },
    { handle: '@bellingcat', desc: 'Investigative OSINT' },
    { handle: '@christaborowski', desc: 'Geopolitical analysis' },
    { handle: '@RALee85', desc: 'Russia/Ukraine military' },
    { handle: '@TheIntelLab', desc: 'Intel analysis' },
  ],

  // Fetch OSINT feed from our backend
  async fetchOsint() {
    try {
      const response = await fetch('/api/osint');
      const data = await response.json();

      if (data.message === 'Twitter API not configured') {
        this.accounts = data.accounts || [];
        this.tweets = [];
        console.log('[OSINT] Twitter API not configured - showing resources');
      } else if (Array.isArray(data)) {
        this.tweets = data;
        console.log('[OSINT] Fetched', data.length, 'tweets');
      }

      return this.tweets;
    } catch (error) {
      console.error('[OSINT] Fetch error:', error);
      return [];
    }
  },

  // Set keyword filter
  setFilter(keyword) {
    this.filterKeyword = keyword || null;
    this.render();
  },

  // Clear filter
  clearFilter() {
    this.filterKeyword = null;
    this.render();
  },

  // Get filtered tweets
  getFilteredTweets() {
    if (!this.filterKeyword || this.tweets.length === 0) {
      return this.tweets;
    }

    const kw = this.filterKeyword.toLowerCase();
    return this.tweets.filter(tweet =>
      tweet.text.toLowerCase().includes(kw) ||
      tweet.account.toLowerCase().includes(kw)
    );
  },

  // Show flight tracking
  showFlights(region = null) {
    this.currentView = 'flights';
    this.render();
  },

  // Show ship tracking
  showShips() {
    this.currentView = 'ships';
    this.render();
  },

  // Show OSINT resources
  showOsint() {
    this.currentView = 'osint';
    this.stopTelegramRefresh();
    this.render();
  },

  // Show Telegram feed
  showTelegram() {
    this.currentView = 'telegram';
    this.stopXRefresh();
    this.render();
    this.fetchTelegram();
    this.startTelegramRefresh();
  },

  // Show X feed
  showX() {
    this.currentView = 'x';
    this.stopTelegramRefresh();
    this.render();
    this.fetchX();
    this.startXRefresh();
  },

  // Fetch X tweets
  async fetchX() {
    try {
      const response = await fetch('/api/x');
      const data = await response.json();
      this.xData = data;
      console.log('[OSINT] Fetched X data:', data.configured ? 'configured' : 'not configured');

      // Re-render if we're on the X view
      if (this.currentView === 'x') {
        this.renderXView();
      }

      return data;
    } catch (error) {
      console.error('[OSINT] X fetch error:', error);
      return null;
    }
  },

  // Start auto-refresh for X
  startXRefresh() {
    if (this.xRefreshInterval) return;
    this.xRefreshInterval = setInterval(() => {
      if (this.currentView === 'x') {
        console.log('[OSINT] Auto-refreshing X...');
        this.fetchX();
      }
    }, this.X_REFRESH_RATE);
  },

  // Stop auto-refresh for X
  stopXRefresh() {
    if (this.xRefreshInterval) {
      clearInterval(this.xRefreshInterval);
      this.xRefreshInterval = null;
    }
  },

  // Fetch Telegram messages
  async fetchTelegram() {
    try {
      const response = await fetch('/api/telegram');
      const data = await response.json();
      this.telegramData = data;
      console.log('[OSINT] Fetched Telegram data:', data.configured ? 'configured' : 'not configured');

      // Re-render if we're on the telegram view
      if (this.currentView === 'telegram') {
        this.renderTelegramView();
      }

      return data;
    } catch (error) {
      console.error('[OSINT] Telegram fetch error:', error);
      return null;
    }
  },

  // Start auto-refresh for Telegram
  startTelegramRefresh() {
    if (this.telegramRefreshInterval) return;
    this.telegramRefreshInterval = setInterval(() => {
      if (this.currentView === 'telegram') {
        console.log('[OSINT] Auto-refreshing Telegram...');
        this.fetchTelegram();
      }
    }, this.TELEGRAM_REFRESH_RATE);
  },

  // Stop auto-refresh for Telegram
  stopTelegramRefresh() {
    if (this.telegramRefreshInterval) {
      clearInterval(this.telegramRefreshInterval);
      this.telegramRefreshInterval = null;
    }
  },

  // Format relative time
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

  // Render Telegram view
  renderTelegramView() {
    const container = document.getElementById('osint-feed');
    const panelTitle = document.querySelector('.osint-panel .panel-title');
    const panelBadge = document.querySelector('.osint-panel .panel-badge');

    if (panelTitle) panelTitle.textContent = 'TELEGRAM OSINT';
    if (panelBadge) { panelBadge.textContent = 'LIVE'; panelBadge.style.color = '#00ff41'; }

    // Check if data loaded
    if (!this.telegramData) {
      container.innerHTML = '<div class="loading">Loading Telegram feed...</div>';
      return;
    }

    // Not configured - show setup instructions
    if (!this.telegramData.configured) {
      container.innerHTML = `
        <div class="telegram-setup">
          <div class="telegram-notice">TELEGRAM API NOT CONFIGURED</div>
          <div class="telegram-instructions">
            <p>To enable live Telegram OSINT:</p>
            <ol>
              <li>Go to <a href="https://my.telegram.org" target="_blank">my.telegram.org</a></li>
              <li>Log in with your phone number</li>
              <li>Create an "App" to get api_id and api_hash</li>
              <li>Run: <code>node telegram-auth.js</code></li>
              <li>Set the environment variables</li>
            </ol>
          </div>
          <div class="telegram-channels-header">MONITORED CHANNELS (click to open):</div>
          ${(this.telegramData.channels || []).map(ch => `
            <div class="telegram-channel-link" data-url="${ch.url}">
              <span class="telegram-handle">${ch.handle}</span>
              <span class="telegram-channel-name">${ch.name}</span>
              <span class="telegram-region">${ch.region.toUpperCase()}</span>
            </div>
          `).join('')}
          <div class="tracking-controls osint-nav">
            <button class="track-btn active" data-view="telegram">TELEGRAM</button>
            <button class="track-btn" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      this.attachTelegramLinks(container);
      return;
    }

    // Not authenticated - show auth instructions
    if (!this.telegramData.authenticated) {
      container.innerHTML = `
        <div class="telegram-setup">
          <div class="telegram-notice">TELEGRAM SESSION REQUIRED</div>
          <div class="telegram-instructions">
            <p>${this.telegramData.message || 'Run the authentication script to connect.'}</p>
            <code>node telegram-auth.js</code>
          </div>
          <div class="telegram-channels-header">MONITORED CHANNELS (click to open):</div>
          ${(this.telegramData.channels || []).map(ch => `
            <div class="telegram-channel-link" data-url="${ch.url}">
              <span class="telegram-handle">${ch.handle}</span>
              <span class="telegram-channel-name">${ch.name}</span>
              <span class="telegram-region">${ch.region.toUpperCase()}</span>
            </div>
          `).join('')}
          <div class="tracking-controls osint-nav">
            <button class="track-btn active" data-view="telegram">TELEGRAM</button>
            <button class="track-btn" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      this.attachTelegramLinks(container);
      return;
    }

    // Show messages
    const messages = this.telegramData.messages || [];

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="telegram-feed">
          <div class="placeholder">No messages found</div>
          <div class="tracking-controls osint-nav">
            <button class="track-btn active" data-view="telegram">TELEGRAM</button>
            <button class="track-btn" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      return;
    }

    container.innerHTML = `
      <div class="telegram-feed">
        <div class="telegram-messages">
          ${messages.map(msg => `
            <div class="telegram-message" data-url="${msg.link}" data-text="${this.escapeAttr(msg.text)}">
              <div class="telegram-message-header">
                <span class="telegram-channel-badge">${msg.channel}</span>
                <span class="telegram-handle">${msg.handle}</span>
                ${msg.translated ? '<span class="telegram-translated">TRANSLATED</span>' : ''}
                <span class="telegram-time">${this.formatRelativeTime(msg.timestamp)}</span>
              </div>
              <div class="telegram-message-text">${this.escapeHtml(msg.text)}</div>
            </div>
          `).join('')}
        </div>
        <div class="tracking-controls osint-nav">
          <button class="track-btn active" data-view="telegram">TELEGRAM</button>
          <button class="track-btn" data-view="osint">RESOURCES</button>
          <button class="track-btn" data-view="flights">FLIGHTS</button>
          <button class="track-btn" data-view="ships">SHIPS</button>
        </div>
      </div>
    `;

    // Click shows related markets, double-click opens in Telegram
    container.querySelectorAll('.telegram-message').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.dataset.text;
        if (text && typeof RelatedMarketsModule !== 'undefined') {
          RelatedMarketsModule.showModal(text, 'telegram');
        }
      });

      item.addEventListener('dblclick', () => {
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });

    this.attachTrackingControls(container);
  },

  // Render X view
  renderXView() {
    const container = document.getElementById('osint-feed');
    const panelTitle = document.querySelector('.osint-panel .panel-title');
    const panelBadge = document.querySelector('.osint-panel .panel-badge');

    if (panelTitle) panelTitle.textContent = 'X OSINT';
    if (panelBadge) { panelBadge.textContent = 'LIVE'; panelBadge.style.color = '#00ff41'; }

    // Check if data loaded
    if (!this.xData) {
      container.innerHTML = '<div class="loading">Loading X feed...</div>';
      return;
    }

    // Not configured - show setup instructions
    if (!this.xData.configured) {
      container.innerHTML = `
        <div class="x-setup">
          <div class="x-notice">X API NOT CONFIGURED</div>
          <div class="x-instructions">
            <p>To enable live X OSINT:</p>
            <ol>
              <li>Go to <a href="https://developer.x.com/en/portal/dashboard" target="_blank">developer.x.com</a></li>
              <li>Create a project/app</li>
              <li>Get your Bearer Token</li>
              <li>Set <code>X_BEARER_TOKEN</code> in .env</li>
            </ol>
            <p style="margin-top: 8px; color: var(--warning);">Note: Basic tier is $100/month</p>
          </div>
          <div class="x-accounts-header">MONITORED ACCOUNTS (click to open):</div>
          ${(this.xData.accounts || []).map(acc => `
            <div class="x-account-link" data-url="${acc.url}">
              <span class="x-handle">${acc.handle}</span>
              <span class="x-account-name">${acc.name}</span>
              <span class="x-region">${acc.region.toUpperCase()}</span>
            </div>
          `).join('')}
          <div class="tracking-controls osint-nav">
            <button class="track-btn" data-view="telegram">TELEGRAM</button>
            <button class="track-btn active" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      this.attachXLinks(container);
      return;
    }

    // Show messages
    const messages = this.xData.messages || [];

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="x-feed">
          <div class="placeholder">No tweets found</div>
          <div class="tracking-controls osint-nav">
            <button class="track-btn" data-view="telegram">TELEGRAM</button>
            <button class="track-btn active" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      return;
    }

    container.innerHTML = `
      <div class="x-feed">
        <div class="x-messages">
          ${messages.map(msg => `
            <div class="x-message" data-url="${msg.link}" data-text="${this.escapeAttr(msg.text)}">
              <div class="x-message-header">
                <span class="x-channel-badge">${msg.channel}</span>
                <span class="x-handle">${msg.handle}</span>
                <span class="x-time">${this.formatRelativeTime(msg.timestamp)}</span>
              </div>
              <div class="x-message-text">${this.escapeHtml(msg.text)}</div>
            </div>
          `).join('')}
        </div>
        <div class="tracking-controls osint-nav">
          <button class="track-btn" data-view="telegram">TELEGRAM</button>
          <button class="track-btn active" data-view="x">X</button>
          <button class="track-btn" data-view="osint">RESOURCES</button>
          <button class="track-btn" data-view="flights">FLIGHTS</button>
          <button class="track-btn" data-view="ships">SHIPS</button>
        </div>
      </div>
    `;

    // Click shows related markets, double-click opens in X
    container.querySelectorAll('.x-message').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.dataset.text;
        if (text && typeof RelatedMarketsModule !== 'undefined') {
          RelatedMarketsModule.showModal(text, 'x');
        }
      });

      item.addEventListener('dblclick', () => {
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });

    this.attachTrackingControls(container);
  },

  // Attach click handlers for X account links
  attachXLinks(container) {
    container.querySelectorAll('.x-account-link').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });
  },

  // Escape attribute for data-text
  escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, ' ');
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Attach click handlers for Telegram channel links
  attachTelegramLinks(container) {
    container.querySelectorAll('.telegram-channel-link').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });
  },

  // Render OSINT panel
  render() {
    const container = document.getElementById('osint-feed');
    const panelTitle = document.querySelector('.osint-panel .panel-title');
    const panelBadge = document.querySelector('.osint-panel .panel-badge');

    // Telegram view
    if (this.currentView === 'telegram') {
      this.renderTelegramView();
      return;
    }

    // X view
    if (this.currentView === 'x') {
      this.renderXView();
      return;
    }

    // Flight tracking view
    if (this.currentView === 'flights') {
      if (panelTitle) panelTitle.textContent = 'FLIGHT TRACKER';
      if (panelBadge) { panelBadge.textContent = 'ADS-B'; panelBadge.style.color = '#00ff41'; }

      container.innerHTML = `
        <div class="tracking-embed">
          <iframe
            src="https://globe.adsbexchange.com/?hideSidebar&hideButtons&mapDim=0&zoom=3&lat=35&lon=35"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <div class="tracking-controls">
            <button class="track-btn" data-view="telegram">TELEGRAM</button>
            <button class="track-btn" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn active" data-view="flights">FLIGHTS</button>
            <button class="track-btn" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      return;
    }

    // Ship tracking view
    if (this.currentView === 'ships') {
      if (panelTitle) panelTitle.textContent = 'SHIP TRACKER';
      if (panelBadge) { panelBadge.textContent = 'AIS'; panelBadge.style.color = '#00a8ff'; }

      container.innerHTML = `
        <div class="tracking-embed">
          <iframe
            src="https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:30/centerx:45/maptype:4/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:/remember:false"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <div class="tracking-controls">
            <button class="track-btn" data-view="telegram">TELEGRAM</button>
            <button class="track-btn" data-view="x">X</button>
            <button class="track-btn" data-view="osint">RESOURCES</button>
            <button class="track-btn" data-view="flights">FLIGHTS</button>
            <button class="track-btn active" data-view="ships">SHIPS</button>
          </div>
        </div>
      `;
      this.attachTrackingControls(container);
      return;
    }

    // Default OSINT view
    if (panelTitle) panelTitle.textContent = 'OSINT RESOURCES';
    if (panelBadge) { panelBadge.textContent = 'TOOLS'; panelBadge.style.color = ''; }

    // Show resources and accounts
    {
      let html = '<div class="osint-resources">';

      // Render tracking resources
      this.resources.forEach(category => {
        html += `<div class="osint-category">${category.category}</div>`;
        category.items.forEach(item => {
          html += `
            <div class="osint-link" data-url="${item.url}">
              <span class="osint-icon">${item.icon}</span>
              <span class="osint-name">${item.name}</span>
              <span class="osint-arrow">→</span>
            </div>
          `;
        });
      });

      // X Accounts section
      html += `<div class="osint-category">X/OSINT ACCOUNTS</div>`;
      this.xAccounts.forEach(acc => {
        const handle = acc.handle.replace('@', '');
        html += `
          <div class="osint-link" data-url="https://x.com/${handle}">
            <span class="osint-icon">𝕏</span>
            <span class="osint-name">${acc.handle}</span>
            <span class="osint-desc">${acc.desc}</span>
          </div>
        `;
      });

      // Navigation controls
      html += `
        <div class="tracking-controls osint-nav">
          <button class="track-btn" data-view="telegram">TELEGRAM</button>
          <button class="track-btn" data-view="x">X</button>
          <button class="track-btn active" data-view="osint">RESOURCES</button>
          <button class="track-btn" data-view="flights">FLIGHTS</button>
          <button class="track-btn" data-view="ships">SHIPS</button>
        </div>
      `;

      html += '</div>';
      container.innerHTML = html;

      // Add click handlers for links
      container.querySelectorAll('.osint-link').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.dataset.url;
          if (url) window.open(url, '_blank');
        });
      });

      this.attachTrackingControls(container);
      return;
    }

    // Render actual tweets if API is configured
    const tweets = this.getFilteredTweets();

    if (tweets.length === 0) {
      container.innerHTML = this.filterKeyword
        ? `<div class="placeholder">No tweets matching "${this.filterKeyword}"</div>`
        : '<div class="loading">Loading OSINT feed...</div>';
      return;
    }

    container.innerHTML = tweets.slice(0, 10).map(tweet => `
      <div class="osint-item" data-url="${tweet.url}">
        <div class="osint-account">${tweet.account}</div>
        <div class="osint-text">${tweet.text}</div>
        <div class="news-time">${tweet.time}</div>
      </div>
    `).join('');

    container.querySelectorAll('.osint-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      });
    });
  },

  // Attach click handlers to tracking control buttons
  attachTrackingControls(container) {
    container.querySelectorAll('.track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view === 'telegram') this.showTelegram();
        else if (view === 'x') this.showX();
        else if (view === 'flights') this.showFlights();
        else if (view === 'ships') this.showShips();
        else this.showOsint();
      });
    });
  }
};

// CSS for OSINT resources and tracking embeds
const osintStyles = document.createElement('style');
osintStyles.textContent = `
  /* Tracking embed container */
  .tracking-embed {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 150px;
  }

  .tracking-embed iframe {
    flex: 1;
    width: 100%;
    min-height: 120px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .tracking-controls {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
  }

  .tracking-controls.osint-nav {
    position: sticky;
    bottom: 0;
    margin-top: auto;
  }

  .track-btn {
    flex: 1;
    padding: 4px 8px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }

  .track-btn:hover {
    background: var(--bg-panel);
    color: var(--text-bright);
    border-color: var(--text-primary);
  }

  .track-btn.active {
    background: var(--text-primary);
    color: var(--bg-primary);
    border-color: var(--text-primary);
  }

  .osint-resources {
    padding: 4px;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .osint-category {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-primary);
    padding: 6px 4px 4px;
    margin-top: 4px;
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .osint-category:first-child {
    margin-top: 0;
  }

  .osint-link {
    display: flex;
    align-items: center;
    padding: 5px 4px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.15s;
  }

  .osint-link:hover {
    background: var(--bg-hover);
  }

  .osint-link:last-child {
    border-bottom: none;
  }

  .osint-icon {
    width: 18px;
    font-size: 11px;
    text-align: center;
    margin-right: 6px;
  }

  .osint-name {
    flex: 1;
    font-size: 11px;
    color: var(--text-bright);
  }

  .osint-desc {
    font-size: 9px;
    color: var(--text-dim);
    margin-left: 8px;
  }

  .osint-arrow {
    font-size: 10px;
    color: var(--text-dim);
    margin-left: 4px;
  }

  .osint-setup {
    padding: 10px;
  }

  .osint-notice {
    color: var(--warning);
    font-size: 10px;
    margin-bottom: 12px;
    padding: 6px;
    border: 1px dashed var(--warning);
  }

  .osint-accounts-header {
    color: var(--text-secondary);
    font-size: 10px;
    margin-bottom: 8px;
  }

  .osint-account-link {
    padding: 4px 0;
    cursor: pointer;
  }

  .osint-account-link:hover {
    background: var(--bg-hover);
  }

  .osint-tip {
    margin-top: 12px;
    font-size: 9px;
    color: var(--text-dim);
    font-style: italic;
  }

  /* Telegram Feed Styles */
  .telegram-feed {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
  }

  .telegram-messages {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .telegram-message {
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.15s;
  }

  .telegram-message:hover {
    background: var(--bg-hover);
  }

  .telegram-message:last-child {
    border-bottom: none;
  }

  .telegram-message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .telegram-channel-badge {
    font-size: 9px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--accent);
    padding: 1px 5px;
    border-radius: 2px;
  }

  .telegram-handle {
    font-size: 10px;
    color: var(--text-dim);
  }

  .telegram-time {
    font-size: 9px;
    color: var(--text-dim);
    margin-left: auto;
  }

  .telegram-translated {
    font-size: 8px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--positive);
    padding: 1px 4px;
    border-radius: 2px;
  }

  .telegram-message-text {
    font-size: 11px;
    color: var(--text-bright);
    line-height: 1.4;
    word-break: break-word;
  }

  /* Telegram Setup Styles */
  .telegram-setup {
    padding: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .telegram-notice {
    color: var(--warning);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px dashed var(--warning);
    text-align: center;
  }

  .telegram-instructions {
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    padding: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }

  .telegram-instructions p {
    margin-bottom: 8px;
  }

  .telegram-instructions ol {
    margin: 0;
    padding-left: 16px;
  }

  .telegram-instructions li {
    margin-bottom: 4px;
  }

  .telegram-instructions a {
    color: var(--accent);
    text-decoration: none;
  }

  .telegram-instructions a:hover {
    text-decoration: underline;
  }

  .telegram-instructions code {
    background: var(--bg-hover);
    padding: 2px 6px;
    color: var(--positive);
    font-family: var(--font-mono);
    display: inline-block;
    margin-top: 4px;
  }

  .telegram-channels-header {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-primary);
    padding: 6px 4px 4px;
    margin-top: 8px;
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .telegram-channel-link {
    display: flex;
    align-items: center;
    padding: 6px 4px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.15s;
  }

  .telegram-channel-link:hover {
    background: var(--bg-hover);
  }

  .telegram-channel-link .telegram-handle {
    font-size: 11px;
    color: var(--accent);
    min-width: 120px;
  }

  .telegram-channel-name {
    font-size: 10px;
    color: var(--text-secondary);
    flex: 1;
  }

  .telegram-region {
    font-size: 8px;
    font-weight: 600;
    color: var(--text-dim);
    background: var(--bg-hover);
    padding: 2px 4px;
    border-radius: 2px;
  }

  /* X Feed Styles */
  .x-feed {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
  }

  .x-messages {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .x-message {
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.15s;
  }

  .x-message:hover {
    background: var(--bg-hover);
  }

  .x-message:last-child {
    border-bottom: none;
  }

  .x-message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .x-channel-badge {
    font-size: 9px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--text-primary);
    padding: 1px 5px;
    border-radius: 2px;
  }

  .x-handle {
    font-size: 10px;
    color: var(--text-dim);
  }

  .x-time {
    font-size: 9px;
    color: var(--text-dim);
    margin-left: auto;
  }

  .x-message-text {
    font-size: 11px;
    color: var(--text-bright);
    line-height: 1.4;
    word-break: break-word;
  }

  /* X Setup Styles */
  .x-setup {
    padding: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .x-notice {
    color: var(--warning);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px dashed var(--warning);
    text-align: center;
  }

  .x-instructions {
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    padding: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }

  .x-instructions p {
    margin-bottom: 8px;
  }

  .x-instructions ol {
    margin: 0;
    padding-left: 16px;
  }

  .x-instructions li {
    margin-bottom: 4px;
  }

  .x-instructions a {
    color: var(--accent);
    text-decoration: none;
  }

  .x-instructions a:hover {
    text-decoration: underline;
  }

  .x-instructions code {
    background: var(--bg-hover);
    padding: 2px 6px;
    color: var(--positive);
    font-family: var(--font-mono);
    display: inline-block;
    margin-top: 4px;
  }

  .x-accounts-header {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-primary);
    padding: 6px 4px 4px;
    margin-top: 8px;
    border-bottom: 1px solid var(--border-color);
    letter-spacing: 0.5px;
  }

  .x-account-link {
    display: flex;
    align-items: center;
    padding: 6px 4px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.15s;
  }

  .x-account-link:hover {
    background: var(--bg-hover);
  }

  .x-account-link .x-handle {
    font-size: 11px;
    color: var(--text-primary);
    min-width: 120px;
  }

  .x-account-name {
    font-size: 10px;
    color: var(--text-secondary);
    flex: 1;
  }

  .x-region {
    font-size: 8px;
    font-weight: 600;
    color: var(--text-dim);
    background: var(--bg-hover);
    padding: 2px 4px;
    border-radius: 2px;
  }
`;
document.head.appendChild(osintStyles);
