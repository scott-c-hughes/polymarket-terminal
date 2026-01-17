// ============================================
// CHART MODULE - Polymarket price charts
// Using Lightweight Charts (TradingView)
// Supports multi-line term structure overlay
// ============================================

const ChartModule = {
  chart: null,
  series: [],  // Array of line series for multi-date
  currentMarket: null,
  currentInterval: 'max',  // Current time interval

  // Color palette for multiple lines
  colors: [
    '#ff9500',  // Orange (primary)
    '#00ff41',  // Green
    '#00a8ff',  // Blue
    '#ff3b3b',  // Red
    '#ffcc00',  // Yellow
    '#ff00ff',  // Magenta
  ],

  // Initialize chart with dark theme
  init() {
    const container = document.getElementById('chart-container');
    // Clear container completely
    container.innerHTML = '';

    // Create fresh chart
    this.chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 180,
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    this.series = [];
  },

  // Clear all series and recreate chart
  clearSeries() {
    // Destroy and recreate chart to avoid rendering issues
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
    this.series = [];
    this.init();
  },

  // Add a line series
  addSeries(color) {
    const series = this.chart.addLineSeries({
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
    this.series.push(series);
    return series;
  },

  // Format volume for display
  formatVolume(vol) {
    if (!vol) return '$0';
    if (vol >= 1000000) return '$' + (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return '$' + (vol / 1000).toFixed(0) + 'K';
    return '$' + vol.toFixed(0);
  },

  // Set active timeframe button
  setActiveTimeframe(interval) {
    this.currentInterval = interval;
    document.querySelectorAll('.tf-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.interval === interval);
    });
  },

  // Load single chart
  async loadChart(tokenId, marketName, interval = null, volume24hr = null) {
    if (!tokenId) {
      console.error('[CHART] No token ID provided');
      return;
    }

    const useInterval = interval || this.currentInterval;
    document.getElementById('chart-market-name').textContent = marketName || 'Loading...';

    if (!this.chart) {
      this.init();
    }

    this.clearSeries();

    try {
      const response = await fetch(`/api/chart/${tokenId}?interval=${useInterval}`);
      const data = await response.json();

      if (!data.history || data.history.length === 0) {
        console.log('[CHART] No history data for', useInterval);
        document.getElementById('chart-market-name').textContent = marketName + ' (No data)';
        return;
      }

      // Deduplicate by timestamp (Lightweight Charts requires unique times)
      const timeMap = new Map();
      data.history.forEach(point => {
        if (point.t && typeof point.p === 'number') {
          timeMap.set(point.t, point.p);  // Later values overwrite earlier for same timestamp
        }
      });

      const chartData = Array.from(timeMap.entries())
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => a.time - b.time);

      if (chartData.length === 0) {
        console.log('[CHART] No valid data points for', useInterval);
        document.getElementById('chart-market-name').textContent = marketName + ' (No data)';
        return;
      }

      const series = this.addSeries(this.colors[0]);
      series.setData(chartData);

      this.chart.timeScale().fitContent();

      this.currentMarket = { tokenId, marketName, volume24hr };

      // Display market name with 24hr volume if available
      const volText = volume24hr ? ` (24hr: ${this.formatVolume(volume24hr)})` : '';
      document.getElementById('chart-market-name').textContent = marketName + volText;
      console.log('[CHART] Loaded', chartData.length, 'points for', useInterval);

    } catch (error) {
      console.error('[CHART] Error:', error);
      document.getElementById('chart-market-name').textContent = marketName + ' (Error)';
    }
  },

  // Load multi-line chart for term structure
  async loadMultiChart(dateMarkets, eventTitle, interval = null, volume24hr = null) {
    if (!dateMarkets || dateMarkets.length === 0) {
      console.error('[CHART] No date markets provided');
      return;
    }

    const useInterval = interval || this.currentInterval;
    document.getElementById('chart-market-name').textContent = eventTitle + ' (Loading...)';

    if (!this.chart) {
      this.init();
    }

    this.clearSeries();

    // Remove old legend
    const container = document.getElementById('chart-container');
    const oldLegend = container.querySelector('.chart-legend');
    if (oldLegend) oldLegend.remove();

    // Build legend HTML
    let legendHtml = '<div class="chart-legend">';
    let loadedCount = 0;

    // Load each date's chart data
    for (let i = 0; i < Math.min(dateMarkets.length, 6); i++) {
      const dm = dateMarkets[i];
      if (!dm.tokenId) continue;

      try {
        const response = await fetch(`/api/chart/${dm.tokenId}?interval=${useInterval}`);
        const data = await response.json();

        if (!data.history || data.history.length === 0) continue;

        // Deduplicate by timestamp (Lightweight Charts requires unique times)
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

        const color = this.colors[i % this.colors.length];
        const series = this.addSeries(color);
        series.setData(chartData);
        loadedCount++;
        console.log(`[CHART] Loaded ${dm.title}: ${chartData.length} points, range ${chartData[0]?.value?.toFixed(3)} - ${chartData[chartData.length-1]?.value?.toFixed(3)}`);

        // Add to legend
        const label = dm.title || `Contract ${i + 1}`;
        legendHtml += `<span class="legend-item"><span class="legend-color" style="background:${color}"></span>${label}</span>`;

      } catch (error) {
        console.error('[CHART] Error loading', dm.title, error);
      }
    }

    legendHtml += '</div>';

    if (loadedCount > 0) {
      container.insertAdjacentHTML('beforeend', legendHtml);
      this.chart.timeScale().fitContent();

      // Display title with 24hr volume if available
      const volText = volume24hr ? ` (24hr: ${this.formatVolume(volume24hr)})` : '';
      document.getElementById('chart-market-name').textContent = eventTitle + volText;
    } else {
      document.getElementById('chart-market-name').textContent = eventTitle + ' (No data for ' + useInterval + ')';
    }

    this.currentMarket = { multi: true, dateMarkets, eventTitle, volume24hr };
  },

  // Refresh current chart
  async refresh() {
    if (this.currentMarket) {
      if (this.currentMarket.multi) {
        await this.loadMultiChart(this.currentMarket.dateMarkets, this.currentMarket.eventTitle);
      } else {
        await this.loadChart(this.currentMarket.tokenId, this.currentMarket.marketName);
      }
    }
  },

  // Force resize the chart (call after DOM changes)
  resize() {
    if (this.chart) {
      const container = document.getElementById('chart-container');
      if (container) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          const width = container.clientWidth;
          const height = container.clientHeight || 180;
          this.chart.resize(width, height);
          this.chart.timeScale().fitContent();
        }, 50);
      }
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => ChartModule.init(), 100);

  // Handle window resize
  window.addEventListener('resize', () => {
    if (ChartModule.chart) {
      const container = document.getElementById('chart-container');
      ChartModule.chart.resize(container.clientWidth, container.clientHeight || 180);
    }
  });

  // Timeframe button handlers
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const interval = btn.dataset.interval;
      console.log('[CHART] Timeframe clicked:', interval);
      ChartModule.setActiveTimeframe(interval);

      // Reload current chart with new interval
      if (ChartModule.currentMarket) {
        // Show loading state
        document.getElementById('chart-market-name').textContent = 'Loading ' + interval + '...';

        if (ChartModule.currentMarket.multi) {
          await ChartModule.loadMultiChart(
            ChartModule.currentMarket.dateMarkets,
            ChartModule.currentMarket.eventTitle,
            interval
          );
        } else {
          await ChartModule.loadChart(
            ChartModule.currentMarket.tokenId,
            ChartModule.currentMarket.marketName,
            interval
          );
        }
      } else {
        console.log('[CHART] No market selected yet');
      }
    });
  });
});
