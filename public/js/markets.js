// ============================================
// MARKETS MODULE - Polymarket data handling
// With term structure display for multi-date events
// ============================================

const MarketsModule = {
  markets: [],
  lastUpdate: null,
  currentView: 'volume',  // Track current view: 'volume', 'hot', 'movers', 'domestic', or region ID
  currentRegion: null,

  // Format volume for display (e.g., 1.2M, 500K)
  formatVolume(vol) {
    if (!vol) return '$0';
    if (vol >= 1000000) {
      return '$' + (vol / 1000000).toFixed(1) + 'M';
    }
    if (vol >= 1000) {
      return '$' + (vol / 1000).toFixed(0) + 'K';
    }
    return '$' + vol.toFixed(0);
  },

  // Parse date from groupItemTitle (e.g., "March 31", "December 31, 2025")
  parseDate(dateStr) {
    if (!dateStr) return null;

    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    const str = dateStr.toLowerCase().trim();

    // Try to match "Month Day" or "Month Day, Year"
    const match = str.match(/(\w+)\s+(\d+)(?:,?\s*(\d{4}))?/);
    if (match) {
      const month = months[match[1]];
      const day = parseInt(match[2]);
      const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

      if (month !== undefined && day) {
        return new Date(year, month, day);
      }
    }

    return null;
  },

  // Check if a groupItemTitle looks like a date
  isDateTitle(title) {
    if (!title) return false;
    return this.parseDate(title) !== null;
  },

  // Detect event type: 'binary', 'date-series', or 'multiple-choice'
  getEventType(event) {
    const markets = event.markets || [];
    if (markets.length <= 1) return 'binary';

    // Check if markets have groupItemTitles
    const titledMarkets = markets.filter(m => m.groupItemTitle);
    if (titledMarkets.length < 2) return 'binary';

    // Check if titles are dates
    const dateCount = titledMarkets.filter(m => this.isDateTitle(m.groupItemTitle)).length;

    // If most titles are dates, it's a date series
    if (dateCount >= titledMarkets.length * 0.5) return 'date-series';

    // Otherwise it's multiple choice
    return 'multiple-choice';
  },

  // Format date for display (short format)
  formatDateShort(date) {
    if (!date) return '?';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year !== currentYear) {
      return `${month} ${day} '${String(year).slice(-2)}`;
    }
    return `${month} ${day}`;
  },

  // Get price from market object
  getMarketPrice(market) {
    if (market.lastTradePrice) {
      return parseFloat(market.lastTradePrice);
    }
    if (market.outcomePrices) {
      const prices = market.outcomePrices.replace(/[\[\]"]/g, '').split(',');
      return parseFloat(prices[0]) || 0;
    }
    return 0;
  },

  // Get token ID from market (for chart)
  getTokenId(market) {
    if (market.clobTokenIds) {
      try {
        const ids = JSON.parse(market.clobTokenIds);
        return ids[0]; // "Yes" token
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Process event into structured format with term structure or multiple choice
  processEvent(event) {
    const markets = event.markets || [];
    const eventType = this.getEventType(event);

    // Get first market's token ID for chart
    const firstMarket = markets[0];
    const tokenId = firstMarket ? this.getTokenId(firstMarket) : null;

    // Binary event - single market
    if (eventType === 'binary') {
      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        volume: event.volume || 0,
        eventType: 'binary',
        price: firstMarket ? this.getMarketPrice(firstMarket) : 0,
        tokenId: tokenId,
        dateMarkets: [],
        choices: []
      };
    }

    // Date series - term structure (existing behavior)
    if (eventType === 'date-series') {
      const dateMarkets = markets
        .map(m => ({
          title: m.groupItemTitle || m.question || '',
          date: this.parseDate(m.groupItemTitle),
          price: this.getMarketPrice(m),
          id: m.id,
          tokenId: this.getTokenId(m)
        }))
        .filter(m => m.date !== null)
        .sort((a, b) => a.date - b.date);

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        volume: event.volume || 0,
        eventType: 'date-series',
        hasMultipleDates: true,
        price: dateMarkets[0]?.price || 0,
        tokenId: dateMarkets[0]?.tokenId || tokenId,
        dateMarkets: dateMarkets,
        choices: []
      };
    }

    // Multiple choice - each market is a choice
    const choices = markets
      .map(m => ({
        title: m.groupItemTitle || m.question || '',
        price: this.getMarketPrice(m),
        id: m.id,
        tokenId: this.getTokenId(m),
        volume: m.volumeNum || parseFloat(m.volume) || 0
      }))
      .filter(m => m.title)
      .sort((a, b) => b.price - a.price); // Sort by probability descending

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      volume: event.volume || 0,
      eventType: 'multiple-choice',
      hasMultipleDates: false,
      price: choices[0]?.price || 0,
      tokenId: choices[0]?.tokenId || tokenId,
      dateMarkets: [],
      choices: choices
    };
  },

  // Fetch markets from our backend
  async fetchMarkets() {
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();

      if (Array.isArray(data)) {
        this.markets = data;
        this.lastUpdate = new Date();
        console.log('[MARKETS] Fetched', data.length, 'geopolitical events');
      }

      return this.markets;
    } catch (error) {
      console.error('[MARKETS] Fetch error:', error);
      return [];
    }
  },

  // Get top events by volume (processed)
  getTopByVolume(limit = 10) {
    return this.markets
      .filter(m => m.markets && m.markets.length > 0)
      .slice(0, limit)
      .map(event => this.processEvent(event));
  },

  // Get top events by 24hr volume (HOT markets)
  getTopBy24hrVolume(limit = 10) {
    return [...this.markets]
      .filter(m => m.markets && m.markets.length > 0 && m.volume24hr > 0)
      .sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0))
      .slice(0, limit)
      .map(event => ({
        ...this.processEvent(event),
        volume24hr: event.volume24hr,
        volumeRatio: event.volumeRatio
      }));
  },

  // Get top movers by price change
  getTopMovers(limit = 10) {
    return [...this.markets]
      .filter(m => m.markets && m.markets.length > 0 && m.maxPriceChange > 0)
      .sort((a, b) => (b.maxPriceChange || 0) - (a.maxPriceChange || 0))
      .slice(0, limit)
      .map(event => ({
        ...this.processEvent(event),
        priceChange: event.priceChangeDirection,
        maxPriceChange: event.maxPriceChange
      }));
  },

  // Get US domestic markets
  getDomesticMarkets(limit = 10) {
    // Keywords that strongly indicate US domestic content
    const domesticKeywords = [
      'doge', 'deportation', 'tariff', 'fed ', 'fed?', 'rate cut', 'speaker', 'cabinet',
      'pardon', 'shutdown', 'impeach', 'sanctuary', 'migrant', 'ice ',
      'national guard', 'supreme court', 'attorney general', 'fbi', 'doj',
      'midterm', 'senate ', 'house ', 'congress', 'budget', 'deficit', 'elon',
      'democratic ', 'republican ', 'gop', 'democrat', 'u.s.', 'usa',
      'presidential nominee', 'presidential election'
    ];

    // Keywords that indicate international content (exclude these)
    const internationalKeywords = [
      'iran', 'russia', 'ukraine', 'china', 'taiwan', 'israel', 'gaza',
      'venezuela', 'nato', 'ceasefire', 'strike on', 'korea', 'syria',
      'brazil', 'portugal', 'netherlands', 'dutch', 'france', 'macron',
      'uk ', 'starmer', 'germany', 'italy', 'spain', 'mexico', 'canada',
      'colombia', 'argentina', 'putin', 'zelensky', 'netanyahu', 'xi jinping',
      'greenland', 'denmark', 'panama', 'world cup', 'champions league'
    ];

    return [...this.markets]
      .filter(m => {
        if (!m.markets || m.markets.length === 0) return false;
        const text = (m.title + ' ' + (m.description || '')).toLowerCase();

        // Exclude if it's clearly international
        const isInternational = internationalKeywords.some(kw => text.includes(kw));
        if (isInternational) return false;

        // Include if it matches domestic keywords
        return domesticKeywords.some(kw => text.includes(kw));
      })
      .slice(0, limit)
      .map(event => this.processEvent(event));
  },

  // Get markets for a specific region (uses MapModule's pre-computed location matches)
  getMarketsForRegion(regionId) {
    // Use MapModule's location-matched markets if available
    const locationMarkets = MapModule.getMarketsForLocation?.(regionId);
    if (locationMarkets && locationMarkets.length > 0) {
      return locationMarkets.map(event => this.processEvent(event));
    }

    // Fallback to keyword search
    const region = MapModule.regions[regionId];
    if (!region) return [];

    const keywords = region.keywords;

    return this.markets
      .filter(event => {
        const text = (event.title + ' ' + (event.description || '')).toLowerCase();
        return keywords.some(kw => text.includes(kw));
      })
      .map(event => this.processEvent(event));
  },

  // Create visual probability bar
  createProbBar(prob) {
    const filled = Math.round(prob / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  },

  // Render event based on its type (binary, date-series, or multiple-choice)
  renderTermStructure(event, index) {
    const num = index !== undefined ? `<span class="market-num">${index + 1}</span>` : '';
    const tokenId = event.tokenId || '';

    // Multiple choice event - show top choices
    if (event.eventType === 'multiple-choice' && event.choices.length > 1) {
      const firstToken = event.choices[0]?.tokenId || tokenId;
      const choiceItems = event.choices.slice(0, 4).map(choice => {
        const prob = Math.round(choice.price * 100);
        // Truncate long titles
        const shortTitle = choice.title.length > 12 ? choice.title.slice(0, 11) + '…' : choice.title;
        return `<span class="term-item choice-item" data-token="${choice.tokenId || ''}" data-title="${event.title} - ${choice.title}"><span class="term-date">${shortTitle}</span><span class="term-prob">${prob}%</span></span>`;
      }).join('');

      const moreCount = event.choices.length > 4 ? `<span class="choice-more">+${event.choices.length - 4}</span>` : '';

      return `
        <div class="market-item market-term market-multichoice" data-slug="${event.slug}" data-token="${firstToken}" data-title="${event.title}">
          <div class="market-header">
            ${num}
            <span class="market-title" title="${event.title}">${event.title}</span>
            <span class="market-volume">${this.formatVolume(event.volume)}</span>
          </div>
          <div class="term-structure choice-structure">
            ${choiceItems}${moreCount}
          </div>
        </div>
      `;
    }

    // Date series - term structure view
    if (event.eventType === 'date-series' && event.dateMarkets.length > 1) {
      const firstToken = event.dateMarkets[0]?.tokenId || tokenId;
      const termItems = event.dateMarkets.slice(0, 4).map(dm => {
        const prob = Math.round(dm.price * 100);
        const dateStr = this.formatDateShort(dm.date);
        return `<span class="term-item" data-token="${dm.tokenId || ''}" data-title="${event.title} - ${dm.title}"><span class="term-date">${dateStr}</span><span class="term-prob">${prob}%</span></span>`;
      }).join('');

      return `
        <div class="market-item market-term" data-slug="${event.slug}" data-token="${firstToken}" data-title="${event.title}">
          <div class="market-header">
            ${num}
            <span class="market-title" title="${event.title}">${event.title}</span>
            <span class="market-volume">${this.formatVolume(event.volume)}</span>
          </div>
          <div class="term-structure">
            ${termItems}
          </div>
        </div>
      `;
    }

    // Binary - simple display
    const prob = Math.round(event.price * 100);
    return `
      <div class="market-item" data-slug="${event.slug}" data-token="${tokenId}" data-title="${event.title}">
        ${num}
        <span class="market-title" title="${event.title}">${event.title}</span>
        <span class="market-price">${prob}%</span>
        <span class="market-volume">${this.formatVolume(event.volume)}</span>
      </div>
    `;
  },

  // Render term structure with optional extra info (24hr vol, price change)
  renderTermStructureWithStats(event, index, statType = null) {
    const num = index !== undefined ? `<span class="market-num">${index + 1}</span>` : '';
    const tokenId = event.tokenId || '';

    // Build stat display based on type
    let statHtml = '';
    if (statType === 'hot' && event.volume24hr) {
      statHtml = `<span class="market-stat hot">24h: ${this.formatVolume(event.volume24hr)}</span>`;
    } else if (statType === 'mover' && event.priceChange !== undefined) {
      const pct = (event.priceChange * 100).toFixed(1);
      const sign = event.priceChange >= 0 ? '+' : '';
      const cls = event.priceChange >= 0 ? 'positive' : 'negative';
      statHtml = `<span class="market-stat ${cls}">${sign}${pct}%</span>`;
    }

    // Multiple choice event
    if (event.eventType === 'multiple-choice' && event.choices.length > 1) {
      const firstToken = event.choices[0]?.tokenId || tokenId;
      const choiceItems = event.choices.slice(0, 4).map(choice => {
        const prob = Math.round(choice.price * 100);
        const shortTitle = choice.title.length > 12 ? choice.title.slice(0, 11) + '…' : choice.title;
        return `<span class="term-item choice-item" data-token="${choice.tokenId || ''}" data-title="${event.title} - ${choice.title}"><span class="term-date">${shortTitle}</span><span class="term-prob">${prob}%</span></span>`;
      }).join('');

      const moreCount = event.choices.length > 4 ? `<span class="choice-more">+${event.choices.length - 4}</span>` : '';

      return `
        <div class="market-item market-term market-multichoice" data-slug="${event.slug}" data-token="${firstToken}" data-title="${event.title}">
          <div class="market-header">
            ${num}
            <span class="market-title" title="${event.title}">${event.title}</span>
            ${statHtml || `<span class="market-volume">${this.formatVolume(event.volume)}</span>`}
          </div>
          <div class="term-structure choice-structure">
            ${choiceItems}${moreCount}
          </div>
        </div>
      `;
    }

    // Date series event
    if (event.eventType === 'date-series' && event.dateMarkets.length > 1) {
      const firstToken = event.dateMarkets[0]?.tokenId || tokenId;
      const termItems = event.dateMarkets.slice(0, 4).map(dm => {
        const prob = Math.round(dm.price * 100);
        const dateStr = this.formatDateShort(dm.date);
        return `<span class="term-item" data-token="${dm.tokenId || ''}" data-title="${event.title} - ${dm.title}"><span class="term-date">${dateStr}</span><span class="term-prob">${prob}%</span></span>`;
      }).join('');

      return `
        <div class="market-item market-term" data-slug="${event.slug}" data-token="${firstToken}" data-title="${event.title}">
          <div class="market-header">
            ${num}
            <span class="market-title" title="${event.title}">${event.title}</span>
            ${statHtml || `<span class="market-volume">${this.formatVolume(event.volume)}</span>`}
          </div>
          <div class="term-structure">
            ${termItems}
          </div>
        </div>
      `;
    }

    // Binary event
    const prob = Math.round(event.price * 100);
    return `
      <div class="market-item" data-slug="${event.slug}" data-token="${tokenId}" data-title="${event.title}">
        ${num}
        <span class="market-title" title="${event.title}">${event.title}</span>
        <span class="market-price">${prob}%</span>
        ${statHtml || `<span class="market-volume">${this.formatVolume(event.volume)}</span>`}
      </div>
    `;
  },

  // General render method - renders current view
  render() {
    console.log('[MARKETS] render() called, currentView:', this.currentView, 'currentRegion:', this.currentRegion);
    if (this.currentView === 'hot') {
      this.renderHotMarkets();
    } else if (this.currentView === 'movers') {
      this.renderPriceMovers();
    } else if (this.currentView === 'domestic') {
      this.renderDomesticMarkets();
    } else if (this.currentView === 'region' && this.currentRegion) {
      this.renderRegionMarkets(this.currentRegion);
    } else {
      this.renderTopMovers();
    }
  },

  // Render US DOMESTIC markets
  renderDomesticMarkets() {
    this.currentView = 'domestic';
    this.currentRegion = null;
    const container = document.getElementById('top-movers');
    const events = this.getDomesticMarkets(10);

    // Update panel header
    const title = document.querySelector('.movers-panel .panel-title');
    const badge = document.querySelector('.movers-panel .panel-badge');
    if (title) title.textContent = 'US DOMESTIC';
    if (badge) { badge.textContent = 'USA'; badge.style.color = '#00a8ff'; }

    if (events.length === 0) {
      container.innerHTML = '<div class="placeholder">No US domestic markets found</div>';
      return;
    }

    container.innerHTML = events.map((e, i) => this.renderTermStructure(e, i)).join('');
    this._displayedEvents = events;

    if (typeof ChartModule !== 'undefined') ChartModule.resize();
    this.attachMarketClickHandlers(container);
  },

  // Render HOT markets (by 24hr volume)
  renderHotMarkets() {
    this.currentView = 'hot';
    this.currentRegion = null;
    const container = document.getElementById('top-movers');
    const events = this.getTopBy24hrVolume(8);

    // Update panel header
    const title = document.querySelector('.movers-panel .panel-title');
    const badge = document.querySelector('.movers-panel .panel-badge');
    if (title) title.textContent = 'HOT MARKETS';
    if (badge) { badge.textContent = '24HR'; badge.style.color = '#ff9500'; }

    if (events.length === 0) {
      container.innerHTML = '<div class="placeholder">No 24hr volume data available</div>';
      return;
    }

    container.innerHTML = events.map((e, i) => this.renderTermStructureWithStats(e, i, 'hot')).join('');
    this._displayedEvents = events;

    if (typeof ChartModule !== 'undefined') ChartModule.resize();
    this.attachMarketClickHandlers(container);
  },

  // Render MOVERS (by price change)
  renderPriceMovers() {
    this.currentView = 'movers';
    this.currentRegion = null;
    const container = document.getElementById('top-movers');
    const events = this.getTopMovers(8);

    // Update panel header
    const title = document.querySelector('.movers-panel .panel-title');
    const badge = document.querySelector('.movers-panel .panel-badge');
    if (title) title.textContent = 'PRICE MOVERS';
    if (badge) { badge.textContent = '1WK'; badge.style.color = '#00ff41'; }

    if (events.length === 0) {
      container.innerHTML = '<div class="placeholder">No price movement data available</div>';
      return;
    }

    container.innerHTML = events.map((e, i) => this.renderTermStructureWithStats(e, i, 'mover')).join('');
    this._displayedEvents = events;

    if (typeof ChartModule !== 'undefined') ChartModule.resize();
    this.attachMarketClickHandlers(container);
  },

  // Attach click handlers to market items
  attachMarketClickHandlers(container) {
    container.querySelectorAll('.market-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        const event = this._displayedEvents[index];
        const termItem = e.target.closest('.term-item');
        const vol24hr = event?.volume24hr || null;

        // Clicked on a specific term/choice item
        if (termItem && termItem.dataset.token) {
          ChartModule.loadChart(termItem.dataset.token, termItem.dataset.title, null, vol24hr);
          return;
        }

        // Multiple choice event - show all choices on chart
        if (event && event.eventType === 'multiple-choice' && event.choices.length > 1) {
          ChartModule.loadMultiChart(event.choices, event.title, null, vol24hr);
          return;
        }

        // Date series event - show all dates on chart
        if (event && event.eventType === 'date-series' && event.dateMarkets.length > 1) {
          ChartModule.loadMultiChart(event.dateMarkets, event.title, null, vol24hr);
          return;
        }

        // Binary event - single chart
        const token = item.dataset.token;
        const title = item.dataset.title;
        if (token) ChartModule.loadChart(token, title, null, vol24hr);
      });

      item.addEventListener('dblclick', () => {
        const slug = item.dataset.slug;
        if (slug) window.open(`https://polymarket.com/event/${slug}`, '_blank');
      });
    });
  },

  // Render top markets panel (by volume)
  renderTopMovers() {
    this.currentView = 'volume';
    this.currentRegion = null;
    const container = document.getElementById('top-movers');
    const events = this.getTopByVolume(6);

    // Restore panel header to default
    const title = document.querySelector('.movers-panel .panel-title');
    const badge = document.querySelector('.movers-panel .panel-badge');
    if (title) title.textContent = 'TOP VOLUME';
    if (badge) { badge.textContent = 'ALL TIME'; badge.style.color = ''; }

    if (events.length === 0) {
      container.innerHTML = '<div class="placeholder">No market data available</div>';
      return;
    }

    container.innerHTML = events.map((e, i) => this.renderTermStructure(e, i)).join('');

    // Store processed events for chart access
    this._displayedEvents = events;

    // Trigger chart resize after DOM update
    if (typeof ChartModule !== 'undefined') {
      ChartModule.resize();
    }

    // Add click handlers using shared handler
    this.attachMarketClickHandlers(container);
  },

  // Render region markets panel with term structure
  // Now renders to top-movers container instead of separate region-markets
  renderRegionMarkets(regionId) {
    this.currentView = 'region';
    this.currentRegion = regionId;
    const container = document.getElementById('top-movers');
    if (!container) return;

    const events = this.getMarketsForRegion(regionId);

    if (events.length === 0) {
      container.innerHTML = '<div class="placeholder">No markets found for this region</div>';
      return;
    }

    container.innerHTML = events.map(event => {
      // Multiple choice event
      if (event.eventType === 'multiple-choice' && event.choices.length > 1) {
        const choiceItems = event.choices.slice(0, 6).map(choice => {
          const prob = Math.round(choice.price * 100);
          const bar = this.createProbBar(choice.price * 100);
          return `
            <div class="region-term-row">
              <span class="region-term-date" style="color: var(--accent);">${choice.title}</span>
              <span class="region-term-bar">${bar}</span>
              <span class="region-term-prob">${prob}%</span>
            </div>
          `;
        }).join('');

        return `
          <div class="region-market region-market-term" data-slug="${event.slug}">
            <div class="region-market-title" style="color: var(--accent);">${event.title}</div>
            <div class="region-market-vol-header">${this.formatVolume(event.volume)} volume</div>
            <div class="region-term-structure">
              ${choiceItems}
            </div>
          </div>
        `;
      }

      // Date series event
      if (event.eventType === 'date-series' && event.dateMarkets.length > 1) {
        const termItems = event.dateMarkets.map(dm => {
          const prob = Math.round(dm.price * 100);
          const dateStr = this.formatDateShort(dm.date);
          const bar = this.createProbBar(dm.price * 100);
          return `
            <div class="region-term-row">
              <span class="region-term-date">${dateStr}</span>
              <span class="region-term-bar">${bar}</span>
              <span class="region-term-prob">${prob}%</span>
            </div>
          `;
        }).join('');

        return `
          <div class="region-market region-market-term" data-slug="${event.slug}">
            <div class="region-market-title">${event.title}</div>
            <div class="region-market-vol-header">${this.formatVolume(event.volume)} volume</div>
            <div class="region-term-structure">
              ${termItems}
            </div>
          </div>
        `;
      }

      // Binary event - simple display
      const prob = Math.round(event.price * 100);
      return `
        <div class="region-market" data-slug="${event.slug}">
          <div class="region-market-title">${event.title}</div>
          <div class="region-market-stats">
            <span class="region-market-prob">${prob}%</span>
            <span class="region-market-vol">${this.formatVolume(event.volume)} vol</span>
          </div>
        </div>
      `;
    }).join('');

    // Store processed events for chart access
    this._displayedEvents = events;

    // Trigger chart resize after DOM update
    if (typeof ChartModule !== 'undefined') {
      ChartModule.resize();
    }

    // Add click handlers
    container.querySelectorAll('.region-market').forEach((item, index) => {
      item.addEventListener('click', () => {
        const event = this._displayedEvents[index];
        const vol24hr = event?.volume24hr || null;

        // Multiple choice - show all choices on chart
        if (event && event.eventType === 'multiple-choice' && event.choices.length > 1) {
          ChartModule.loadMultiChart(event.choices, event.title, null, vol24hr);
          return;
        }

        // Date series - show all dates on chart
        if (event && event.eventType === 'date-series' && event.dateMarkets.length > 1) {
          ChartModule.loadMultiChart(event.dateMarkets, event.title, null, vol24hr);
          return;
        }

        // Binary - single chart
        if (event && event.tokenId) {
          ChartModule.loadChart(event.tokenId, event.title, null, vol24hr);
        }
      });

      item.addEventListener('dblclick', () => {
        const slug = item.dataset.slug;
        if (slug) {
          window.open(`https://polymarket.com/event/${slug}`, '_blank');
        }
      });
    });
  },

  // Search markets by keyword
  searchMarkets(keyword) {
    const kw = keyword.toLowerCase();
    return this.markets.filter(event => {
      const text = (event.title + ' ' + (event.description || '')).toLowerCase();
      return text.includes(kw);
    });
  },

  // Get total volume across all geo markets
  getTotalVolume() {
    return this.markets.reduce((sum, m) => sum + (m.volume || 0), 0);
  }
};

// Listen for region selection
document.addEventListener('regionSelected', (e) => {
  const { regionId } = e.detail;
  MarketsModule.renderRegionMarkets(regionId);
});
