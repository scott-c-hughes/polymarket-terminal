// ============================================
// OSINT MODULE - Live tracking resources & X accounts
// With embedded flight/ship tracking
// ============================================

const OsintModule = {
  tweets: [],
  accounts: [],
  filterKeyword: null,
  currentView: 'osint', // 'osint', 'flights', 'ships'

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
    this.render();
  },

  // Render OSINT panel
  render() {
    const container = document.getElementById('osint-feed');
    const panelTitle = document.querySelector('.osint-panel .panel-title');
    const panelBadge = document.querySelector('.osint-panel .panel-badge');

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
            <button class="track-btn" data-view="osint">← OSINT</button>
            <button class="track-btn" data-view="ships">SHIPS →</button>
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
            <button class="track-btn" data-view="flights">← FLIGHTS</button>
            <button class="track-btn" data-view="osint">OSINT →</button>
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

      html += '</div>';
      container.innerHTML = html;

      // Add click handlers for links
      container.querySelectorAll('.osint-link').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.dataset.url;
          if (url) window.open(url, '_blank');
        });
      });

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
        if (view === 'flights') this.showFlights();
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
`;
document.head.appendChild(osintStyles);
