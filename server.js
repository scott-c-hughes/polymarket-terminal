require('dotenv').config();
const express = require('express');
const RSSParser = require('rss-parser');
const fetch = require('node-fetch');
const path = require('path');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram/tl');
const { translate } = require('google-translate-api-x');
const { TwitterApi } = require('twitter-api-v2');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json()); // For parsing JSON bodies
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
let telegramCache = { data: null, timestamp: 0 };
let xCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 30000; // 30 seconds
const TELEGRAM_CACHE_DURATION = 30000; // 30 seconds
const X_CACHE_DURATION = 60000; // 60 seconds (to avoid rate limits)

// ============ TELEGRAM CONFIGURATION ============

// Telegram API credentials (from environment variables)
const TELEGRAM_API_ID = parseInt(process.env.TELEGRAM_API_ID) || 0;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH || '';
const TELEGRAM_SESSION = process.env.TELEGRAM_SESSION || '';

// OSINT Telegram channels - verified working
const TELEGRAM_CHANNELS = [
  // === UKRAINE / RUSSIA (4 working) ===
  { handle: 'wartranslated', name: 'War Translated', region: 'ukraine' },
  { handle: 'ukrainenowenglish', name: 'Ukraine NOW', region: 'ukraine' },
  { handle: 'DeepStateUA', name: 'DeepState UA', region: 'ukraine' },
  { handle: 'operativnoZSU', name: 'ZSU Operative', region: 'ukraine' },

  // === MIDDLE EAST / ISRAEL / GAZA (4 working) ===
  { handle: 'IDFofficial', name: 'IDF Official', region: 'mideast' },
  { handle: 'sitreports', name: 'SITREP', region: 'mideast' },
  { handle: 'AbuAliExpress', name: 'Abu Ali Express', region: 'mideast' },
  { handle: 'CIG_telegram', name: 'Conflict Intel', region: 'mideast' },

  // === IRAN (1 working) ===
  { handle: 'IranIntl_En', name: 'Iran International', region: 'iran' },

  // === GLOBAL OSINT (2 working) ===
  { handle: 'intelofficer', name: 'Intel Officer', region: 'global' },
  { handle: 'liveuamap', name: 'Liveuamap', region: 'global' },
];

// Telegram client instance (lazy initialized)

// ============ X/TWITTER CONFIGURATION ============

// X API credentials (from environment variables)
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN || '';

// OSINT X accounts to monitor
const X_ACCOUNTS = [
  // Global / Breaking
  { handle: 'sentdefender', name: 'OSINTDefender', region: 'global' },
  { handle: 'Osinttechnical', name: 'OSINT Technical', region: 'global' },
  { handle: 'Aurora_Intel', name: 'Aurora Intel', region: 'global' },

  // Ukraine / Russia
  { handle: 'IntelCrab', name: 'Intel Crab', region: 'ukraine' },
  { handle: 'OAlexanderDK', name: 'Oliver Alexander', region: 'ukraine' },

  // Middle East / Israel / Iran
  { handle: 'Osint613', name: 'Open Source Intel', region: 'mideast' },
  { handle: 'NotWoofers', name: 'NotWoofers', region: 'mideast' },
  { handle: 'Faytuks', name: 'Faytuks', region: 'mideast' },
];

// X client instance (lazy initialized)
let xClient = null;

// Initialize X client
function initXClient() {
  if (!X_BEARER_TOKEN) {
    console.log('[X] Bearer token not configured');
    return null;
  }

  if (xClient) {
    return xClient;
  }

  try {
    xClient = new TwitterApi(X_BEARER_TOKEN);
    console.log('[X] Client initialized');
    return xClient;
  } catch (error) {
    console.error('[X] Client init error:', error.message);
    return null;
  }
}

// Fetch tweets from monitored accounts
async function fetchXTweets() {
  const client = initXClient();
  if (!client) {
    return { error: 'X API not configured', accounts: X_ACCOUNTS };
  }

  const tweets = [];

  for (const account of X_ACCOUNTS) {
    try {
      // Get user ID first
      const user = await client.v2.userByUsername(account.handle);
      if (!user.data) {
        console.log(`[X] User not found: @${account.handle}`);
        continue;
      }

      // Get recent tweets
      const timeline = await client.v2.userTimeline(user.data.id, {
        max_results: 10,
        'tweet.fields': ['created_at', 'text'],
        exclude: ['retweets', 'replies'],
      });

      if (timeline.data?.data) {
        for (const tweet of timeline.data.data) {
          tweets.push({
            channel: account.name,
            handle: `@${account.handle}`,
            region: account.region,
            text: tweet.text,
            timestamp: new Date(tweet.created_at).getTime(),
            link: `https://x.com/${account.handle}/status/${tweet.id}`,
            id: tweet.id
          });
        }
        console.log(`[X] Fetched ${timeline.data.data.length} tweets from @${account.handle}`);
      }
    } catch (error) {
      console.error(`[X] Error fetching @${account.handle}:`, error.message);
    }
  }

  // Sort by timestamp (newest first)
  tweets.sort((a, b) => b.timestamp - a.timestamp);

  return tweets;
}
let telegramClient = null;
let telegramConnected = false;

// Initialize Telegram client
async function initTelegramClient() {
  if (!TELEGRAM_API_ID || !TELEGRAM_API_HASH) {
    console.log('[TELEGRAM] API credentials not configured');
    return null;
  }

  if (telegramClient && telegramConnected) {
    return telegramClient;
  }

  try {
    const session = new StringSession(TELEGRAM_SESSION);
    telegramClient = new TelegramClient(session, TELEGRAM_API_ID, TELEGRAM_API_HASH, {
      connectionRetries: 3,
      useWSS: true,
    });

    await telegramClient.connect();
    telegramConnected = true;
    console.log('[TELEGRAM] Client connected successfully');

    // If no session string, user needs to authenticate
    if (!TELEGRAM_SESSION) {
      console.log('[TELEGRAM] No session string. Run auth script to generate one.');
    }

    return telegramClient;
  } catch (error) {
    console.error('[TELEGRAM] Connection error:', error.message);
    telegramConnected = false;
    return null;
  }
}

// Detect if text contains non-English characters that need translation
// Covers: Russian, Ukrainian, Hebrew, Arabic, Persian/Farsi
function needsTranslation(text) {
  // Cyrillic (Russian, Ukrainian)
  const hasCyrillic = /[а-яА-ЯёЁіїєґІЇЄҐ]/.test(text);
  // Hebrew
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  // Arabic (includes Persian/Farsi)
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

  return hasCyrillic || hasHebrew || hasArabic;
}

// Translation cache to avoid repeated API calls
const translationCache = new Map();
const MAX_CACHE_SIZE = 500;

// Rate limiting for translation
let lastTranslateTime = 0;
const TRANSLATE_DELAY_MS = 200; // 200ms between translations

// Translate text to English if it's not in English
async function translateToEnglish(text) {
  if (!text || !needsTranslation(text)) {
    return { text, translated: false };
  }

  // Check cache first
  const cacheKey = text.substring(0, 100);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Rate limit
  const now = Date.now();
  const timeSinceLast = now - lastTranslateTime;
  if (timeSinceLast < TRANSLATE_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, TRANSLATE_DELAY_MS - timeSinceLast));
  }
  lastTranslateTime = Date.now();

  try {
    const result = await translate(text, { to: 'en', autoCorrect: false });
    const translated = {
      text: result.text,
      translated: true,
      originalLang: result.from?.language?.iso || 'auto'
    };

    // Cache the result
    if (translationCache.size >= MAX_CACHE_SIZE) {
      // Clear oldest entries
      const keysToDelete = Array.from(translationCache.keys()).slice(0, 100);
      keysToDelete.forEach(k => translationCache.delete(k));
    }
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (error) {
    // Don't log every error - just return original text
    return { text, translated: false };
  }
}

// Fetch messages from monitored channels
async function fetchTelegramMessages() {
  const client = await initTelegramClient();
  if (!client) {
    return { error: 'Telegram not configured', channels: TELEGRAM_CHANNELS };
  }

  const messages = [];

  const successfulChannels = [];

  for (const channel of TELEGRAM_CHANNELS) {
    try {
      const entity = await client.getEntity(channel.handle);
      const result = await client.getMessages(entity, { limit: 10 }); // Get more messages

      let channelMsgCount = 0;
      for (const msg of result) {
        if (msg.message && msg.message.length > 20) { // Skip very short messages
          const originalText = msg.message.substring(0, 800); // Allow longer messages
          const { text, translated, originalLang } = await translateToEnglish(originalText);

          messages.push({
            channel: channel.name,
            handle: `@${channel.handle}`,
            region: channel.region,
            text: text,
            originalText: translated ? originalText : null,
            translated: translated,
            originalLang: originalLang,
            timestamp: msg.date * 1000, // Convert to milliseconds
            link: `https://t.me/${channel.handle}/${msg.id}`,
            id: msg.id
          });
          channelMsgCount++;
        }
      }
      if (channelMsgCount > 0) {
        successfulChannels.push(channel.handle);
      }
    } catch (error) {
      // Silently skip invalid channels - don't spam logs
    }
  }

  if (successfulChannels.length > 0) {
    console.log(`[TELEGRAM] Fetched from ${successfulChannels.length} channels: ${successfulChannels.join(', ')}`);
  }

  // Sort by timestamp (newest first)
  messages.sort((a, b) => b.timestamp - a.timestamp);

  return messages;
}

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

// Telegram OSINT feed
app.get('/api/telegram', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (telegramCache.data && (now - telegramCache.timestamp) < TELEGRAM_CACHE_DURATION) {
      return res.json(telegramCache.data);
    }

    // Check if Telegram is configured
    if (!TELEGRAM_API_ID || !TELEGRAM_API_HASH) {
      return res.json({
        configured: false,
        message: 'Telegram API not configured',
        channels: TELEGRAM_CHANNELS.map(c => ({
          name: c.name,
          handle: `@${c.handle}`,
          region: c.region,
          url: `https://t.me/${c.handle}`
        })),
        instructions: 'Set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_SESSION environment variables'
      });
    }

    // Check if session is provided
    if (!TELEGRAM_SESSION) {
      return res.json({
        configured: true,
        authenticated: false,
        message: 'Telegram session not configured. Run auth script first.',
        channels: TELEGRAM_CHANNELS.map(c => ({
          name: c.name,
          handle: `@${c.handle}`,
          region: c.region,
          url: `https://t.me/${c.handle}`
        })),
        instructions: 'Run: node telegram-auth.js to generate a session string'
      });
    }

    // Fetch messages
    const result = await fetchTelegramMessages();

    // Handle error response
    if (result.error) {
      return res.json({
        configured: true,
        authenticated: false,
        message: result.error,
        channels: result.channels
      });
    }

    // Cache and return messages
    const response = {
      configured: true,
      authenticated: true,
      messages: result,
      timestamp: now
    };

    telegramCache = { data: response, timestamp: now };
    res.json(response);

  } catch (error) {
    console.error('[TELEGRAM] API error:', error.message);
    res.status(500).json({
      configured: false,
      error: 'Failed to fetch Telegram messages',
      message: error.message
    });
  }
});

// X/Twitter OSINT feed
app.get('/api/x', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (xCache.data && (now - xCache.timestamp) < X_CACHE_DURATION) {
      return res.json(xCache.data);
    }

    // Check if X is configured
    if (!X_BEARER_TOKEN) {
      return res.json({
        configured: false,
        message: 'X API not configured',
        accounts: X_ACCOUNTS.map(a => ({
          name: a.name,
          handle: `@${a.handle}`,
          region: a.region,
          url: `https://x.com/${a.handle}`
        })),
        instructions: 'Set X_BEARER_TOKEN environment variable. Get it from https://developer.x.com/en/portal/dashboard'
      });
    }

    // Fetch tweets
    const result = await fetchXTweets();

    // Handle error response
    if (result.error) {
      return res.json({
        configured: true,
        authenticated: false,
        message: result.error,
        accounts: result.accounts
      });
    }

    // Cache and return tweets
    const response = {
      configured: true,
      authenticated: true,
      messages: result,
      timestamp: now
    };

    xCache = { data: response, timestamp: now };
    res.json(response);

  } catch (error) {
    console.error('[X] API error:', error.message);
    res.status(500).json({
      configured: false,
      error: 'Failed to fetch X tweets',
      message: error.message
    });
  }
});

// Polymarket Order Book (public CLOB API - no auth needed)
app.get('/api/orderbook/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Fetch order book from Polymarket CLOB API
    const response = await fetch(`https://clob.polymarket.com/book?token_id=${tokenId}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('[ORDERBOOK] API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// AI-powered tweet to market matching
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
let anthropicClient = null;

function getAnthropicClient() {
  if (!ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

app.post('/api/match-markets', async (req, res) => {
  try {
    const { tweet, markets } = req.body;

    if (!tweet || !markets || !Array.isArray(markets)) {
      return res.status(400).json({ error: 'Missing tweet or markets' });
    }

    const client = getAnthropicClient();
    if (!client) {
      return res.status(500).json({ error: 'Anthropic API not configured' });
    }

    // Build market list for Claude
    const marketList = markets.map((m, i) => `${i}: ${m.title}`).join('\n');

    const prompt = `You are analyzing a news headline or social media post to find relevant prediction markets.

CONTENT:
"${tweet}"

AVAILABLE MARKETS:
${marketList}

CONTEXT - KEY POLITICAL FIGURES (2025):
- Trump Cabinet: Pam Bondi (AG), Pete Hegseth (Defense), Marco Rubio (State), Kristi Noem (DHS), Tulsi Gabbard (DNI), Kash Patel (FBI), RFK Jr (HHS), Scott Bessent (Treasury), Howard Lutnick (Commerce), Doug Burgum (Interior), Sean Duffy (Transportation)
- Other figures: Elon Musk (DOGE), JD Vance (VP), Mike Johnson (Speaker), Tom Homan (Border Czar)
- International: Putin, Zelensky, Netanyahu, Xi Jinping, Kim Jong Un, Khamenei

Your task: Return indices of markets that are RELEVANT to this content. Be INCLUSIVE - match on:
- People mentioned (directly or by last name only, e.g. "Bondi" = Pam Bondi = AG = Trump cabinet markets)
- Geographic regions (countries, conflicts, territories)
- Political events (confirmations, pardons, executive orders, tariffs, etc.)
- Topics discussed (immigration, trade, war, elections, etc.)
- Indirect relevance (a tweet about a cabinet member relates to cabinet confirmation markets)

Return ONLY a JSON array of market indices, like: [0, 5, 12]
If no markets are relevant, return: []
Do not include any explanation, just the JSON array.`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse the response
    const text = response.content[0].text.trim();
    console.log('[AI] Match response:', text);

    let indices = [];
    try {
      indices = JSON.parse(text);
      if (!Array.isArray(indices)) indices = [];
    } catch (e) {
      // Try to extract array from response
      const match = text.match(/\[[\d,\s]*\]/);
      if (match) {
        indices = JSON.parse(match[0]);
      }
    }

    res.json({ indices });

  } catch (error) {
    console.error('[AI] Match error:', error.message);
    res.status(500).json({ error: 'AI matching failed', message: error.message });
  }
});

// Start server (only when running locally, not on Vercel)
if (process.env.VERCEL !== '1') {
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
}

// Export for Vercel
module.exports = app;
