# Polymarket Terminal - Project State

Last updated: January 18, 2026

## Project Overview
"SITUATION MONITOR" - A Bloomberg Terminal-style dashboard for monitoring Polymarket prediction markets with geopolitical focus.

**Live URL:** https://situation-monitor-sch.vercel.app
**GitHub:** https://github.com/scott-c-hughes/polymarket-terminal
**Local:** http://localhost:3000

## Tech Stack
- **Backend:** Node.js + Express (server.js)
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Map:** Leaflet.js with CartoDB dark tiles
- **Charts:** Lightweight Charts (TradingView)
- **APIs:** Polymarket CLOB, X/Twitter API, Telegram API, Claude AI (Haiku)
- **Hosting:** Vercel (serverless)

## Key Features Implemented

### Core Features
1. **Interactive Map** - Dark theme world map with glowing markers for active markets
2. **Markets Panel** - Multiple views: Top Volume (VOL), Hot Markets (HOT), Price Movers (MV), US Domestic (US), Region-specific (GP/FOCUS)
3. **News Monitor** - Aggregated RSS feeds from Reuters, BBC, Al Jazeera, AP
4. **Price Charts** - Single and multi-line charts with timeframe selection (1h, 6h, 1d, 1w, max)
5. **Flight/Ship Tracking** - Embedded ADS-B Exchange and MarineTraffic (FLIGHTS/SHIPS commands)
6. **Header Prices** - SPY, VIX, DXY, GOLD, OIL, BTC from Yahoo Finance
7. **News Ticker** - Scrolling headlines at top
8. **Command System** - Bloomberg-style commands (F1 for help)

### NEW: X.com/Twitter Integration
- Real-time feed from OSINT accounts (@sentdefender, @Osinttechnical, @Aurora_Intel, @IntelCrab, @OAlexanderDK, @Osint613, @NotWoofers, @Faytuks)
- **XFULL command** - Full-screen X view with AI-powered tweet-to-market matching
- Click any tweet to see related Polymarket markets (uses Claude Haiku for matching)
- Multi-line charts show all outcomes for an event
- Clickable legend items to isolate individual markets

### NEW: Telegram Integration
- Live feed from OSINT Telegram channels (Abu Ali Express, Rybar, Intel Slava Z, etc.)
- Toggle between X and Telegram in OSINT panel
- Click messages to see related markets

### NEW: Order Book Display
- **BOOK command** - Shows Bloomberg-style order book modal
- Displays top 8 bids (green) and asks (red) with sizes
- Works from any view - chart, XFULL, or after clicking a market
- Proper sorting: best bid (highest) at top, best ask (lowest) at top

### NEW: AI-Powered Market Matching
- `/api/match-markets` endpoint uses Claude Haiku
- Searches top 500 liquid markets (>$1000 volume)
- Context-aware: knows Trump cabinet members, political figures
- Falls back to keyword matching if AI unavailable

### NEW: Clickable Chart Legends
- Multi-line charts have clickable legend items
- Click to isolate a single market line
- Click again to show all
- BOOK command works on isolated market

## File Structure
```
polymarket-terminal/
├── server.js              # Express backend, all API endpoints
├── telegram-auth.js       # Script to generate Telegram session
├── vercel.json            # Vercel deployment config
├── package.json
├── .env                   # API keys (not in git)
├── public/
│   ├── index.html         # Main HTML layout
│   ├── css/
│   │   └── terminal.css   # Bloomberg-style dark theme
│   └── js/
│       ├── app.js         # Main app initialization
│       ├── map.js         # Leaflet map module
│       ├── markets.js     # Market data & rendering
│       ├── news.js        # RSS feed handling
│       ├── osint.js       # X/Telegram feeds, XFULL view
│       ├── chart.js       # Price charts with multi-line support
│       ├── commands.js    # Command parser, XFULL, order book modal
│       ├── orderbook.js   # Order book sidebar (legacy, modal in commands.js)
│       └── related-markets.js  # AI market matching for news/telegram
│   └── data/
│       └── locations.js   # Geographic database
```

## Environment Variables (.env)
```
X_BEARER_TOKEN=...         # Twitter/X API Bearer Token
ANTHROPIC_API_KEY=...      # Claude API for AI matching
TELEGRAM_API_ID=38904462
TELEGRAM_API_HASH=...
TELEGRAM_SESSION=...       # Generated via telegram-auth.js
```

## Key Commands
| Command | Description |
|---------|-------------|
| GP/FOCUS <region> | Zoom to region and show its markets |
| VOL | Top volume geopolitical markets |
| HOT | Markets with highest 24hr volume |
| MV | Biggest price movers (1 week) |
| US | US domestic markets |
| X / TWITTER | Show X feed in OSINT panel |
| XFULL | Full-screen X view with AI market matching |
| TELEGRAM | Show Telegram feed in OSINT panel |
| BOOK / ORDERBOOK | Show order book for current market |
| CHART [keyword] | Full-screen chart |
| FLIGHTS [region] | Flight tracker overlay |
| SHIPS [region] | Ship tracker overlay |
| NEWS | Expand news panel |
| F1 | Help menu |
| ESC | Close overlays/modals |

## API Endpoints (server.js)
| Endpoint | Description |
|----------|-------------|
| `/api/markets` | Polymarket events (geopolitical filtered) |
| `/api/news` | Aggregated RSS feeds |
| `/api/x` | X/Twitter feed from OSINT accounts |
| `/api/telegram` | Telegram messages from OSINT channels |
| `/api/prices` | Stock/crypto prices from Yahoo Finance |
| `/api/chart/:tokenId` | Price history for charts |
| `/api/orderbook/:tokenId` | Order book from Polymarket CLOB |
| `/api/match-markets` | AI-powered tweet-to-market matching |

## Recent Session Changes (Jan 18, 2026)
1. **X.com Integration** - Full Twitter feed with XFULL view
2. **Telegram Integration** - Live Telegram feed from OSINT channels
3. **Order Book Modal** - Bloomberg-style centered modal (BOOK command)
4. **AI Market Matching** - Claude Haiku matches tweets/news to markets
5. **Clickable Chart Legends** - Isolate individual markets in multi-line charts
6. **Default Focused Market** - BOOK works immediately after selecting a market
7. **Command Line in Overlays** - Visible in XFULL, FLIGHTS, SHIPS views
8. **Political Context in AI** - Added Trump cabinet members to AI prompt

## Known Issues / Notes
- News click opens related markets modal (single click), opens article (double click)
- Multi-choice events show all outcomes in chart with colored legend
- Order book shows 98% spread for some markets - this is real (illiquid markets)
- Telegram requires session auth - run `node telegram-auth.js` to set up

## Deployment
```bash
# Local
node server.js

# Deploy to Vercel
npx vercel --prod --yes
npx vercel alias <url> situation-monitor-sch.vercel.app

# Environment variables are set in Vercel dashboard
```

## Potential Future Enhancements
- Polymarket trading integration (buy/sell orders)
- Position tracking
- Price alerts with notifications
- Historical data export
- Mobile layout optimization
