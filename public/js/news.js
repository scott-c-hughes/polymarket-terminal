// ============================================
// NEWS MODULE - RSS feed display
// ============================================

const NewsModule = {
  news: [],
  filterKeyword: null,

  // Fetch news from our backend
  async fetchNews() {
    try {
      // Show refreshing indicator
      const badge = document.querySelector('.news-panel .panel-badge');
      if (badge) badge.textContent = '...';

      const response = await fetch('/api/news');
      const data = await response.json();

      if (Array.isArray(data)) {
        this.news = data;
        this.lastUpdate = new Date();
        console.log('[NEWS] Fetched', data.length, 'articles');
      }

      // Update badge with count
      if (badge) badge.textContent = `${this.news.length}`;

      return this.news;
    } catch (error) {
      console.error('[NEWS] Fetch error:', error);
      const badge = document.querySelector('.news-panel .panel-badge');
      if (badge) badge.textContent = 'ERR';
      return [];
    }
  },

  // Format relative time
  formatTime(timestamp) {
    if (!timestamp || isNaN(timestamp)) return '--';

    const now = Date.now();
    const diff = now - timestamp;

    // Handle future timestamps (RSS feed timezone issues)
    if (diff < 0) return 'New';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '<1m';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  },

  // Get filtered news
  getFilteredNews() {
    if (!this.filterKeyword) {
      return this.news;
    }

    const kw = this.filterKeyword.toLowerCase();
    return this.news.filter(item =>
      item.title.toLowerCase().includes(kw) ||
      item.source.toLowerCase().includes(kw)
    );
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

  // Render news panel
  render() {
    const container = document.getElementById('news-feed');
    const news = this.getFilteredNews();

    if (news.length === 0) {
      container.innerHTML = this.filterKeyword
        ? `<div class="placeholder">No news matching "${this.filterKeyword}"</div>`
        : '<div class="loading">Loading news...</div>';
      return;
    }

    container.innerHTML = news.slice(0, 30).map(item => `
      <div class="news-item" data-url="${item.link}" data-title="${this.escapeAttr(item.title)}">
        <div class="news-source">${item.source}</div>
        <div class="news-title">${item.title}</div>
        <div class="news-time">${this.formatTime(item.timestamp)}</div>
      </div>
    `).join('');

    // Click shows related markets, double-click opens article
    container.querySelectorAll('.news-item').forEach(item => {
      item.addEventListener('click', () => {
        const title = item.dataset.title;
        if (title && typeof RelatedMarketsModule !== 'undefined') {
          RelatedMarketsModule.showModal(title, 'news');
        }
      });

      item.addEventListener('dblclick', () => {
        const url = item.dataset.url;
        if (url) {
          window.open(url, '_blank');
        }
      });
    });
  },

  // Escape attribute for data-title
  escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};
