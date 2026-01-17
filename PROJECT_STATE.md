# Polymarket Terminal - Project State

Last updated: January 17, 2026

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
- **Hosting:** Vercel (serverless)

## Key Features Implemented
1. **Interactive Map** - Dark theme world map with glowing markers for active markets
2. **Markets Panel** - Multiple views: Top Volume (VOL), Hot Markets (HOT), Price Movers (MV), US Domestic (US), Region-specific (GP/FOCUS)
3. **News Monitor** - Aggregated RSS feeds from Reuters, BBC, Al Jazeera, AP
4. **OSINT Resources** - Curated list of Twitter/X accounts for geopolitical intelligence
5. **Price Charts** - Single and multi-line charts with timeframe selection (1h, 6h, 1d, 1w, max)
6. **Flight/Ship Tracking** - Embedded ADS-B Exchange and MarineTraffic (FLIGHTS/SHIPS commands)
7. **Header Prices** - SPY, VIX, DXY, GOLD, OIL, BTC from Yahoo Finance
8. **News Ticker** - Scrolling headlines at top
9. **Command System** - Bloomberg-style commands (F1 for help)

## File Structure
```
polymarket-terminal/
├── server.js              # Express backend, API proxies
├── vercel.json            # Vercel deployment config
├── package.json
├── public/
│   ├── index.html         # Main HTML layout
│   ├── css/
│   │   └── terminal.css   # Bloomberg-style dark theme
│   └── js/
│       ├── app.js         # Main app initialization
│       ├── map.js         # Leaflet map module
│       ├── markets.js     # Market data & rendering (has view persistence)
│       ├── news.js        # RSS feed handling
│       ├── osint.js       # OSINT resources display
│       ├── chart.js       # Price charts (shows 24hr volume in title)
│       └── commands.js    # Command parser & handlers
│   └── data/
│       └── locations.js   # Geographic database (countries, states, cities)
```

## Recent Changes (This Session)
1. **Removed Breaking News API** - Was stale/redundant with News Monitor
2. **Volume Display** - Shows actual 24hr trading volume in chart title (not fake histogram)
3. **View State Persistence** - Markets panel now remembers current view (region, hot, movers, etc.) during auto-refresh
4. **News Ticker Fix** - Uses content hash to prevent animation reset during refresh
5. **Added European Countries** - Slovakia, Czech Republic, Croatia, Slovenia, Bulgaria, Lithuania, Latvia, Estonia added to locations.js
6. **Vercel Deployment** - Deployed with --public flag, custom alias situation-monitor-sch.vercel.app

## Key Commands
| Command | Description |
|---------|-------------|
| GP/FOCUS <region> | Zoom to region and show its markets |
| VOL | Top volume geopolitical markets |
| HOT | Markets with highest 24hr volume |
| MV | Biggest price movers (1 week) |
| US | US domestic markets |
| CHART [keyword] | Full-screen chart |
| FLIGHTS [region] | Flight tracker overlay |
| SHIPS [region] | Ship tracker overlay |
| NEWS | Expand news panel |
| OSINT | Show OSINT resources |
| F1 | Help menu |

## Known Working State
- GP SLOVAKIA now works (was missing from locations, fixed)
- Markets view persists during 30-second auto-refresh
- News ticker doesn't reset during refresh
- 24hr volume displays in chart titles

## API Endpoints (server.js)
- `/api/markets` - Polymarket events (geopolitical filtered)
- `/api/news` - Aggregated RSS feeds
- `/api/osint` - Twitter/X OSINT accounts
- `/api/prices` - Stock/crypto prices from Yahoo Finance
- `/api/chart/:tokenId` - Price history for charts

## Deployment Notes
- Vercel requires `--public` flag to disable login requirement
- Custom alias: `npx vercel alias <deployment-url> situation-monitor-sch.vercel.app`
- Server exports `app` for Vercel serverless: `module.exports = app;`

## Potential Future Enhancements
- Polymarket API key integration for real volume data (requires py-clob-client)
- Price alerts with notifications
- Historical data export
- Mobile layout optimization
