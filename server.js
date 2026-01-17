const express = require('express');
const RSSParser = require('rss-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const rssParser = new RSSParser();

// Serve static files from 'public' folder with no-cache for JS files
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js') || filepath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// RSS feed URLs - geopolitical + US domestic + OSINT
const RSS_FEEDS = [
  // === BREAKING / WIRE-STYLE ===
  { name: 'Google World', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en' },
  { name: 'Google US', url: 'https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE?hl=en-US&gl=US&ceid=US:en' },
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml' },

  // === US POLITICS / DOMESTIC ===
  { name: 'Axios', url: 'https://api.axios.com/feed/' },
  { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories' },
  { name: 'The Hill', url: 'https://thehill.com/feed/' },

  // === MIDDLE EAST / ISRAEL ===
  { name: 'Times of Israel', url: 'https://www.timesofisrael.com/feed/' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },

  // === UKRAINE / RUSSIA / EUROPE ===
  { name: 'Ukr Pravda', url: 'https://www.pravda.com.ua/eng/rss/' },
  { name: 'Moscow Times', url: 'https://www.themoscowtimes.com/rss/news' },
  { name: 'EUROPP (LSE)', url: 'https://blogs.lse.ac.uk/europpblog/feed/' },
  { name: 'DW Europe', url: 'https://rss.dw.com/xml/rss-en-eu' },

  // === IRAN ===
  { name: 'Iran Intl', url: 'https://www.iranintl.com/en/feed' },

  // === ASIA-PACIFIC ===
  { name: 'Yonhap Korea', url: 'https://en.yna.co.kr/RSS/news.xml' },
  { name: 'SCMP Asia', url: 'https://www.scmp.com/rss/91/feed' },
  { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss/feed/nar' },
  { name: 'NHK Japan', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml' },

  // === VENEZUELA / LATAM ===
  { name: 'Caracas Chron', url: 'https://www.caracaschronicles.com/feed/' },

  // === DEFENSE / MILITARY ===
  { name: 'Defense One', url: 'https://www.defenseone.com/rss/all/' },
  { name: 'War on Rocks', url: 'https://warontherocks.com/feed/' },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/' },

  // === ANALYSIS / THINK TANKS ===
  { name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/' },

  // === OSINT / INVESTIGATIVE ===
  { name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/' }
];

// Polymarket API base URL
const POLYMARKET_API = 'https://gamma-api.polymarket.com';

// Cache to avoid hammering APIs
let marketsCache = { data: null, timestamp: 0 };
let newsCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 30000; // 30 seconds

// ============ API ROUTES ============

// Get markets from Polymarket
app.get('/api/markets', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (marketsCache.data && (now - marketsCache.timestamp) < CACHE_DURATION) {
      return res.json(marketsCache.data);
    }

    // Fetch from Polymarket - get high-volume active events
    const response = await fetch(`${POLYMARKET_API}/events?closed=false&limit=500&order=volume&ascending=false`);
    const events = await response.json();

    // === TAG-BASED FILTERING (Polymarket's taxonomy) ===

    // Tags that indicate relevant situational content
    const includeTags = new Set([
      // Geopolitical
      'geopolitics', 'middle-east', 'ukraine', 'israel', 'iran', 'venezuela',
      'russia', 'china', 'taiwan', 'korea', 'syria', 'nato',
      // Policy & governance
      'trump-presidency', 'us-government', 'trade-war', 'foreign-policy',
      'economic-policy', 'congress', 'senate', 'house',
      // US Domestic
      'doge', 'immigration', 'trump-cabinet', 'courts', 'fed-rates', 'fed',
      'midterms', 'primaries', 'budget', 'deficit',
      // Elections
      'world-elections', 'global-elections', 'us-presidential-election',
    ]);

    // Tags that indicate content to EXCLUDE (sports, crypto prices, entertainment)
    const excludeTags = new Set([
      // Sports
      'sports', 'games', 'basketball', 'soccer', 'nba', 'ncaa', 'ncaa-basketball',
      'nfl', 'nfl-playoffs', 'mlb', 'nhl', 'tennis', 'golf', 'ufc', 'boxing',
      'formula-1', 'cricket', 'rugby',
      // Crypto price speculation
      'crypto-prices', 'hit-price', 'pre-market',
      // Entertainment
      'pop-culture', 'movies', 'oscars', 'awards', 'music', 'celebrities',
      'video-games', 'gta-vi', 'taylor-swift', 'tv-shows', 'streaming',
    ]);

    // Keyword fallback for events that might not be well-tagged
    const includeKeywords = [
      // Geopolitical hotspots
      'iran', 'tehran', 'venezuela', 'russia', 'ukraine', 'china', 'taiwan',
      'israel', 'gaza', 'syria', 'korea', 'pakistan', 'hormuz',
      // Leaders
      'maduro', 'khamenei', 'putin', 'xi jinping', 'netanyahu', 'zelensky',
      // Organizations
      'hezbollah', 'hamas', 'nato', 'irgc',
      // Military/conflict
      'ceasefire', 'invasion', 'invade', 'airstrike', 'strike on', 'troops',
      // US domestic policy
      'deportation', 'tariff', 'doge', 'executive order', 'pardon',
      'speaker', 'cabinet', 'fed ', 'rate cut', 'shutdown', 'impeach',
      'sanctuary', 'border', 'migrant', 'ice ', 'national guard',
      'supreme court', 'attorney general', 'fbi', 'doj',
    ];

    // Keywords that indicate exclusion (even if tags don't catch it)
    const excludeKeywords = [
      'what price will', 'bitcoin', 'ethereum', 'solana', 'dogecoin',
      'super bowl', 'nba champion', 'world series', 'stanley cup',
      'oscars', 'grammy', 'emmy', 'golden globe',
    ];

    const filteredEvents = events.filter(event => {
      // Skip closed, resolved, or archived events
      if (event.closed || event.archived || !event.active) {
        return false;
      }

      // Must have at least one active market
      const hasActiveMarket = event.markets?.some(m => !m.closed && m.active);
      if (!hasActiveMarket) {
        return false;
      }

      // Get event's tags as slugs
      const eventTags = new Set((event.tags || []).map(t => t.slug));
      const text = (event.title + ' ' + (event.description || '')).toLowerCase();

      // EXCLUDE if any exclude tag matches
      for (const tag of excludeTags) {
        if (eventTags.has(tag)) {
          return false;
        }
      }

      // EXCLUDE if any exclude keyword matches
      for (const kw of excludeKeywords) {
        if (text.includes(kw)) {
          return false;
        }
      }

      // INCLUDE if any include tag matches
      for (const tag of includeTags) {
        if (eventTags.has(tag)) {
          return true;
        }
      }

      // INCLUDE if any include keyword matches (fallback for poorly-tagged events)
      for (const kw of includeKeywords) {
        if (text.includes(kw)) {
          return true;
        }
      }

      // Default: exclude
      return false;
    })
    // Filter out closed markets and add computed fields
    .map(event => {
      const activeMarkets = event.markets?.filter(m => !m.closed && m.active) || [];

      // Compute max price change across all markets in this event
      const priceChanges = activeMarkets
        .map(m => Math.abs(m.oneWeekPriceChange || 0))
        .filter(c => c > 0);
      const maxPriceChange = priceChanges.length > 0 ? Math.max(...priceChanges) : 0;

      // Get the actual price change (with sign) from the market with biggest absolute move
      const biggestMover = activeMarkets.reduce((best, m) => {
        const change = Math.abs(m.oneWeekPriceChange || 0);
        return change > Math.abs(best?.oneWeekPriceChange || 0) ? m : best;
      }, null);

      return {
        ...event,
        markets: activeMarkets,
        // Add computed fields for sorting
        volume24hr: event.volume24hr || 0,
        volumeRatio: event.volume24hr && event.volume ? (event.volume24hr / event.volume) : 0,
        maxPriceChange: maxPriceChange,
        priceChangeDirection: biggestMover?.oneWeekPriceChange || 0
      };
    })
    // Sort by total volume (highest first)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0));

    // Update cache
    marketsCache = { data: filteredEvents, timestamp: now };

    res.json(filteredEvents);
  } catch (error) {
    console.error('Polymarket API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Get aggregated news from RSS feeds
app.get('/api/news', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (newsCache.data && (now - newsCache.timestamp) < CACHE_DURATION) {
      return res.json(newsCache.data);
    }

    // Fetch all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await rssParser.parseURL(feed.url);
        return parsed.items.slice(0, 10).map(item => ({
          source: feed.name,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          timestamp: new Date(item.pubDate).getTime()
        }));
      } catch (err) {
        console.error(`RSS error (${feed.name}):`, err.message);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const currentTime = Date.now();

    // Flatten, cap future timestamps, and sort by date (newest first)
    const sortedNews = results
      .flat()
      .map(item => ({
        ...item,
        // Cap future timestamps to now (RSS feeds sometimes have timezone issues)
        timestamp: item.timestamp > currentTime ? currentTime : item.timestamp
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // Limit items per source to prevent one feed from dominating
    const MAX_PER_SOURCE = 4;
    const sourceCounts = {};
    const allNews = sortedNews.filter(item => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
      return sourceCounts[item.source] <= MAX_PER_SOURCE;
    }).slice(0, 100);

    // Update cache
    newsCache = { data: allNews, timestamp: now };

    res.json(allNews);
  } catch (error) {
    console.error('News fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get price history for a market (for charts)
// Polymarket API intervals: 1m, 1h, 6h, 1d, 1w, max
// Fidelity = resolution in minutes (1 = minute-by-minute)
app.get('/api/chart/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const interval = req.query.interval || 'max';

    // Set fidelity based on interval for optimal resolution
    const fidelityMap = {
      '1h': 1,    // 1-minute resolution for 1 hour
      '6h': 5,    // 5-minute resolution for 6 hours
      '1d': 15,   // 15-minute resolution for 1 day
      '1w': 60,   // 1-hour resolution for 1 week
      'max': 60   // 1-hour resolution for all time
    };
    const fidelity = fidelityMap[interval] || 60;

    const response = await fetch(
      `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=${interval}&fidelity=${fidelity}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Chart API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Market prices (Gold, Oil, BTC, etc.)
let pricesCache = { data: null, timestamp: 0 };
const PRICES_CACHE_DURATION = 60000; // 1 minute

app.get('/api/prices', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (pricesCache.data && (now - pricesCache.timestamp) < PRICES_CACHE_DURATION) {
      return res.json(pricesCache.data);
    }

    // Fetch prices in parallel
    const [cryptoRes, goldRes, oilRes, spyRes, vixRes, dxyRes] = await Promise.all([
      // Bitcoin from CoinGecko
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
        .then(r => r.json()).catch(() => null),
      // Gold from Yahoo Finance
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d')
        .then(r => r.json()).catch(() => null),
      // Crude Oil (WTI) from Yahoo Finance
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=2d')
        .then(r => r.json()).catch(() => null),
      // S&P 500 from Yahoo Finance
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=2d')
        .then(r => r.json()).catch(() => null),
      // VIX from Yahoo Finance
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=2d')
        .then(r => r.json()).catch(() => null),
      // DXY (Dollar Index) from Yahoo Finance
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1d&range=2d')
        .then(r => r.json()).catch(() => null),
    ]);

    // Parse Yahoo Finance response
    const parseYahoo = (data) => {
      if (!data?.chart?.result?.[0]) return null;
      const result = data.chart.result[0];
      const quote = result.indicators?.quote?.[0];
      const meta = result.meta;
      if (!quote || !meta) return null;

      const closes = quote.close.filter(c => c !== null);
      const price = meta.regularMarketPrice || closes[closes.length - 1];
      const prevClose = meta.previousClose || closes[closes.length - 2] || price;
      const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

      return { price, change };
    };

    const prices = {
      BTC: cryptoRes?.bitcoin ? {
        price: cryptoRes.bitcoin.usd,
        change: cryptoRes.bitcoin.usd_24h_change || 0
      } : null,
      GOLD: parseYahoo(goldRes),
      OIL: parseYahoo(oilRes),
      SPY: parseYahoo(spyRes),
      VIX: parseYahoo(vixRes),
      DXY: parseYahoo(dxyRes),
      timestamp: now
    };

    pricesCache = { data: prices, timestamp: now };
    res.json(prices);

  } catch (error) {
    console.error('Prices API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Placeholder for Twitter/X OSINT feed
// This requires Twitter API credentials ($100/month)
app.get('/api/osint', async (req, res) => {
  // Return placeholder data for now
  // We'll implement Twitter API later if you get API access
  res.json({
    message: 'Twitter API not configured',
    accounts: [
      '@Osint613',
      '@sentdefender',
      '@IntelCrab',
      '@ve_osint',
      '@bellingcat'
    ],
    instructions: 'To enable live X/OSINT feed, add Twitter API credentials'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║              SITUATION MONITOR                            ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║                                                           ║
║   Open this URL in your browser to view the terminal      ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
