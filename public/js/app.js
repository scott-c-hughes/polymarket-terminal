// ============================================
// MAIN APP - Initialization and coordination
// ============================================

const App = {
  refreshInterval: null,
  pricesInterval: null,
  REFRESH_RATE: 30000, // Refresh every 30 seconds
  PRICES_RATE: 60000, // Refresh prices every 60 seconds

  // Initialize the terminal
  async init() {
    console.log('='.repeat(50));
    console.log('POLYMARKET GEOPOLITICAL TERMINAL');
    console.log('='.repeat(50));

    // Start clock
    this.startClock();

    // Initialize map
    await MapModule.init();

    // Initialize commands
    CommandsModule.init();

    // Function bar click handlers
    document.querySelectorAll('.fn-key').forEach(key => {
      key.addEventListener('click', () => {
        const cmd = key.dataset.cmd;
        if (cmd) CommandsModule.execute(cmd);
      });
    });

    // Load initial data
    await this.loadAllData();

    // Load prices
    await this.fetchPrices();

    // Start auto-refresh
    this.startAutoRefresh();

    // Focus command input
    document.getElementById('command-input').focus();

    console.log('[APP] Terminal ready');
  },

  // Load all data sources
  async loadAllData() {
    console.log('[APP] Loading data...');

    try {
      await Promise.all([
        MarketsModule.fetchMarkets(),
        NewsModule.fetchNews(),
        OsintModule.fetchOsint()
      ]);

      // Update map markers based on market data
      MapModule.updateFromMarkets(MarketsModule.markets);

      // Render all panels
      MarketsModule.render();
      NewsModule.render();
      OsintModule.render();

      // Update news ticker
      this.updateNewsTicker();

      console.log('[APP] All data loaded');
    } catch (error) {
      console.error('[APP] Error loading data:', error);
    }
  },

  // Fetch and display market prices
  async fetchPrices() {
    try {
      const response = await fetch('/api/prices');
      const prices = await response.json();

      this.updatePriceDisplay('SPY', prices.SPY);
      this.updatePriceDisplay('VIX', prices.VIX);
      this.updatePriceDisplay('DXY', prices.DXY);
      this.updatePriceDisplay('GOLD', prices.GOLD);
      this.updatePriceDisplay('OIL', prices.OIL);
      this.updatePriceDisplay('BTC', prices.BTC);

      console.log('[APP] Prices updated');
    } catch (error) {
      console.error('[APP] Error fetching prices:', error);
    }
  },

  // Update a single price display
  updatePriceDisplay(symbol, data) {
    const item = document.querySelector(`.price-item[data-symbol="${symbol}"]`);
    if (!item || !data) return;

    const valueEl = item.querySelector('.price-value');
    const changeEl = item.querySelector('.price-change');

    // Format price based on symbol
    let priceStr;
    if (symbol === 'BTC') {
      priceStr = data.price >= 1000 ? `${(data.price / 1000).toFixed(1)}K` : data.price.toFixed(0);
    } else if (symbol === 'GOLD') {
      priceStr = data.price.toFixed(0);
    } else if (symbol === 'VIX' || symbol === 'DXY') {
      priceStr = data.price.toFixed(2);
    } else {
      priceStr = data.price.toFixed(2);
    }

    valueEl.textContent = priceStr;

    // Format change
    const changeVal = data.change || 0;
    const sign = changeVal >= 0 ? '+' : '';
    changeEl.textContent = `${sign}${changeVal.toFixed(2)}%`;
    changeEl.className = 'price-change ' + (changeVal >= 0 ? 'positive' : 'negative');
  },

  // Update news ticker with latest headlines
  updateNewsTicker() {
    const tickerEl = document.getElementById('news-ticker');
    if (!tickerEl || !NewsModule.news || NewsModule.news.length === 0) return;

    // Get latest 20 news items
    const items = NewsModule.news.slice(0, 20);

    tickerEl.innerHTML = items.map(item => `
      <span class="ticker-item">
        ${item.title}
        <span class="ticker-source">[${item.source}]</span>
      </span>
    `).join('');

    // Duplicate for seamless loop
    tickerEl.innerHTML += tickerEl.innerHTML;

    // Adjust animation duration based on content length
    const contentWidth = tickerEl.scrollWidth / 2;
    const duration = Math.max(15, contentWidth / 300); // 300px per second (fast)
    tickerEl.style.animationDuration = `${duration}s`;
  },

  // Start the clock
  startClock() {
    const clockEl = document.getElementById('clock');

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // Start auto-refresh
  startAutoRefresh() {
    // Main data refresh
    this.refreshInterval = setInterval(() => {
      console.log('[APP] Auto-refreshing...');
      this.loadAllData();
    }, this.REFRESH_RATE);

    // Prices refresh (every minute)
    this.pricesInterval = setInterval(() => {
      this.fetchPrices();
    }, this.PRICES_RATE);
  },

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
};

// Start the app when page loads
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
