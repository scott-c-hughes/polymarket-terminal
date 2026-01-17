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

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
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
      const allEvents = MarketsModule.allEvents || [];

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
          const allEvents = MarketsModule.allEvents || [];

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

    // ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
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

    MarketsModule.renderTopMovers();
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
`;
document.head.appendChild(toastStyles);
