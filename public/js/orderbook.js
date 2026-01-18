// ============================================
// ORDER BOOK MODULE - Polymarket order book display
// ============================================

const OrderBookModule = {
  visible: false,
  currentTokenId: null,
  refreshInterval: null,
  REFRESH_RATE: 10000, // 10 seconds

  // Fetch order book from server
  async fetchOrderBook(tokenId) {
    if (!tokenId) return null;

    try {
      const response = await fetch(`/api/orderbook/${tokenId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ORDERBOOK] Fetch error:', error);
      return null;
    }
  },

  // Show order book for a market
  async show(tokenId, marketName) {
    if (!tokenId) {
      console.log('[ORDERBOOK] No token ID provided');
      return;
    }

    this.currentTokenId = tokenId;
    this.visible = true;

    // Add order book container if it doesn't exist
    this.ensureContainer();

    // Show the container
    const container = document.getElementById('orderbook-container');
    container.classList.add('visible');

    // Update title
    const titleEl = document.getElementById('orderbook-title');
    if (titleEl) titleEl.textContent = marketName || 'Order Book';

    // Fetch and render
    await this.refresh();

    // Start auto-refresh
    this.startRefresh();

    console.log('[ORDERBOOK] Showing order book for', tokenId);
  },

  // Hide order book
  hide() {
    this.visible = false;
    this.stopRefresh();

    const container = document.getElementById('orderbook-container');
    if (container) {
      container.classList.remove('visible');
    }

    console.log('[ORDERBOOK] Hidden');
  },

  // Toggle order book visibility
  toggle() {
    if (this.visible) {
      this.hide();
    } else if (ChartModule.currentMarket?.tokenId) {
      this.show(ChartModule.currentMarket.tokenId, ChartModule.currentMarket.marketName);
    } else {
      console.log('[ORDERBOOK] No market selected');
      return false;
    }
    return true;
  },

  // Refresh current order book
  async refresh() {
    if (!this.currentTokenId || !this.visible) return;

    const data = await this.fetchOrderBook(this.currentTokenId);
    this.render(data);
  },

  // Start auto-refresh
  startRefresh() {
    if (this.refreshInterval) return;

    this.refreshInterval = setInterval(() => {
      if (this.visible) {
        this.refresh();
      }
    }, this.REFRESH_RATE);
  },

  // Stop auto-refresh
  stopRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  // Ensure container exists
  ensureContainer() {
    if (document.getElementById('orderbook-container')) return;

    const chartPanel = document.querySelector('.chart-panel');
    if (!chartPanel) return;

    const container = document.createElement('div');
    container.id = 'orderbook-container';
    container.className = 'orderbook-container';
    container.innerHTML = `
      <div class="orderbook-header">
        <span class="orderbook-title" id="orderbook-title">ORDER BOOK</span>
        <button class="orderbook-close" onclick="OrderBookModule.hide()">×</button>
      </div>
      <div class="orderbook-content" id="orderbook-content">
        <div class="loading">Loading...</div>
      </div>
    `;

    chartPanel.appendChild(container);
  },

  // Format price as percentage
  formatPrice(price) {
    const pct = parseFloat(price) * 100;
    return pct.toFixed(1) + '¢';
  },

  // Format size
  formatSize(size) {
    const num = parseFloat(size);
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  },

  // Render order book
  render(data) {
    const content = document.getElementById('orderbook-content');
    if (!content) return;

    if (!data || (!data.bids && !data.asks)) {
      content.innerHTML = '<div class="placeholder">No order book data</div>';
      return;
    }

    // API returns: bids ascending (lowest first), asks descending (highest first)
    // We need: bids descending (best/highest first), asks ascending (best/lowest first)
    const bids = [...(data.bids || [])]
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 8);
    const asks = [...(data.asks || [])]
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 8);

    // Calculate max size for bar widths
    const allSizes = [...bids, ...asks].map(o => parseFloat(o.size));
    const maxSize = Math.max(...allSizes, 1);

    // Build HTML
    let html = '<div class="orderbook-grid">';

    // Header
    html += `
      <div class="orderbook-row orderbook-header-row">
        <span class="orderbook-col-price">PRICE</span>
        <span class="orderbook-col-size">SIZE</span>
        <span class="orderbook-col-total">TOTAL</span>
      </div>
    `;

    // Asks (sell orders) - display from highest (far from spread) to lowest (best, near spread)
    const asksDisplay = [...asks].reverse(); // Reverse so highest at top, lowest near spread
    let askTotal = 0;
    const askTotals = asksDisplay.map(order => {
      askTotal += parseFloat(order.size);
      return askTotal;
    }).reverse();

    asksDisplay.forEach((order, i) => {
      const size = parseFloat(order.size);
      const barWidth = (size / maxSize) * 100;
      const total = askTotals[i];
      html += `
        <div class="orderbook-row orderbook-ask">
          <div class="orderbook-bar ask-bar" style="width: ${barWidth}%"></div>
          <span class="orderbook-col-price">${this.formatPrice(order.price)}</span>
          <span class="orderbook-col-size">${this.formatSize(size)}</span>
          <span class="orderbook-col-total">${this.formatSize(total)}</span>
        </div>
      `;
    });

    // Spread - now bids[0] is best bid (highest), asks[0] is best ask (lowest)
    if (bids.length > 0 && asks.length > 0) {
      const bestBid = parseFloat(bids[0].price);
      const bestAsk = parseFloat(asks[0].price);
      const spread = ((bestAsk - bestBid) * 100).toFixed(1);
      html += `
        <div class="orderbook-row orderbook-spread">
          <span>SPREAD: ${spread}¢</span>
        </div>
      `;
    }

    // Bids (buy orders) - display from highest (best, near spread) to lowest (far from spread)
    let bidTotal = 0;
    bids.forEach(order => {
      const size = parseFloat(order.size);
      bidTotal += size;
      const barWidth = (size / maxSize) * 100;
      html += `
        <div class="orderbook-row orderbook-bid">
          <div class="orderbook-bar bid-bar" style="width: ${barWidth}%"></div>
          <span class="orderbook-col-price">${this.formatPrice(order.price)}</span>
          <span class="orderbook-col-size">${this.formatSize(size)}</span>
          <span class="orderbook-col-total">${this.formatSize(bidTotal)}</span>
        </div>
      `;
    });

    html += '</div>';
    content.innerHTML = html;
  }
};

// Add styles for order book
const orderbookStyles = document.createElement('style');
orderbookStyles.textContent = `
  /* Order Book Container */
  .orderbook-container {
    position: absolute;
    top: 32px;
    right: 0;
    width: 200px;
    height: calc(100% - 32px);
    background: var(--bg-panel);
    border-left: 1px solid var(--border-color);
    display: none;
    flex-direction: column;
    z-index: 10;
  }

  .orderbook-container.visible {
    display: flex;
  }

  .orderbook-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .orderbook-title {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.5px;
  }

  .orderbook-close {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }

  .orderbook-close:hover {
    color: var(--negative);
  }

  .orderbook-content {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .orderbook-grid {
    display: flex;
    flex-direction: column;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }

  .orderbook-row {
    display: flex;
    padding: 3px 4px;
    position: relative;
  }

  .orderbook-header-row {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2px;
    color: var(--text-dim);
    font-size: 9px;
  }

  .orderbook-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    opacity: 0.2;
    pointer-events: none;
  }

  .ask-bar {
    background: var(--negative);
  }

  .bid-bar {
    background: var(--positive);
  }

  .orderbook-col-price {
    flex: 1;
    z-index: 1;
  }

  .orderbook-col-size {
    width: 50px;
    text-align: right;
    z-index: 1;
  }

  .orderbook-col-total {
    width: 50px;
    text-align: right;
    color: var(--text-dim);
    z-index: 1;
  }

  .orderbook-ask {
    color: var(--negative);
  }

  .orderbook-bid {
    color: var(--positive);
  }

  .orderbook-spread {
    justify-content: center;
    padding: 6px 4px;
    color: var(--text-secondary);
    font-size: 9px;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    margin: 4px 0;
  }

  /* Adjust chart container when order book is visible */
  .chart-panel {
    position: relative;
  }

  .orderbook-container.visible + .chart-container,
  .chart-panel:has(.orderbook-container.visible) .chart-container {
    width: calc(100% - 200px);
  }
`;
document.head.appendChild(orderbookStyles);
