// ============================================
// MAP MODULE - Dynamic markers based on market data
// Only shows locations with active markets
// Blinking markers for high trading activity
// ============================================

const MapModule = {
  map: null,
  markers: {},          // locationId -> marker
  activeLocations: {},  // locationId -> { markets: [], volume24hr: 0 }
  selectedRegion: null,

  // Activity thresholds for blinking (24hr volume in USD)
  ACTIVITY_HIGH: 100000,    // $100K+ 24hr volume = high activity (blinking)
  ACTIVITY_MEDIUM: 25000,   // $25K+ = medium activity (larger marker)

  // Initialize the map
  init() {
    // Use LOCATIONS from locations.js
    this.regions = window.LOCATIONS || {};

    // Create map centered on world view
    this.map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // Add dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    console.log('[MAP] Initialized with', Object.keys(this.regions).length, 'possible locations');
  },

  // Match a market to locations based on keywords
  matchMarketToLocations(market) {
    const text = (market.title + ' ' + (market.description || '')).toLowerCase();
    const matchedLocations = [];

    for (const [locationId, location] of Object.entries(this.regions)) {
      const matched = location.keywords.some(keyword => {
        // Exact word boundary matching for short keywords
        if (keyword.length <= 3) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          return regex.test(text);
        }
        return text.includes(keyword.toLowerCase());
      });

      if (matched) {
        matchedLocations.push(locationId);
      }
    }

    return matchedLocations;
  },

  // Update markers based on current market data
  // Called by app.js after fetching markets
  updateFromMarkets(markets) {
    // Reset active locations
    this.activeLocations = {};

    // Match each market to locations
    markets.forEach(market => {
      const locations = this.matchMarketToLocations(market);

      locations.forEach(locationId => {
        if (!this.activeLocations[locationId]) {
          this.activeLocations[locationId] = {
            markets: [],
            volume24hr: 0,
            totalVolume: 0
          };
        }

        this.activeLocations[locationId].markets.push(market);
        this.activeLocations[locationId].volume24hr += (market.volume24hr || 0);
        this.activeLocations[locationId].totalVolume += (market.volume || 0);
      });
    });

    // Update map markers
    this.syncMarkers();

    console.log('[MAP] Updated:', Object.keys(this.activeLocations).length, 'active locations from', markets.length, 'markets');
  },

  // Sync markers with active locations
  syncMarkers() {
    const activeLocationIds = new Set(Object.keys(this.activeLocations));

    // Remove markers for locations that no longer have markets
    for (const [locationId, marker] of Object.entries(this.markers)) {
      if (!activeLocationIds.has(locationId)) {
        this.map.removeLayer(marker);
        delete this.markers[locationId];
      }
    }

    // Add/update markers for active locations
    for (const [locationId, data] of Object.entries(this.activeLocations)) {
      const location = this.regions[locationId];
      if (!location) continue;

      if (this.markers[locationId]) {
        // Update existing marker
        this.updateMarkerStyle(locationId, data);
      } else {
        // Create new marker
        this.createMarker(locationId, location, data);
      }
    }
  },

  // Create a new marker
  createMarker(locationId, location, data) {
    const activityLevel = this.getActivityLevel(data.volume24hr);
    const markerSize = this.getMarkerSize(activityLevel, data.markets.length);

    const marker = L.circleMarker(location.coords, {
      radius: markerSize,
      fillColor: this.getMarkerColor(activityLevel),
      fillOpacity: this.getMarkerOpacity(activityLevel),
      color: this.getMarkerColor(activityLevel),
      weight: 2,
      className: activityLevel === 'high' ? 'hotspot-marker high-activity' : 'hotspot-marker'
    });

    marker.locationId = locationId;
    marker.bindPopup(this.createPopupContent(location, data));

    marker.on('click', () => {
      this.selectRegion(locationId);
    });

    marker.addTo(this.map);
    this.markers[locationId] = marker;

    // Force CSS class update for blinking (Leaflet doesn't always apply className)
    if (activityLevel === 'high') {
      setTimeout(() => {
        const el = marker.getElement();
        if (el) el.classList.add('high-activity');
      }, 10);
    }
  },

  // Update marker style based on activity
  updateMarkerStyle(locationId, data) {
    const marker = this.markers[locationId];
    if (!marker) return;

    const activityLevel = this.getActivityLevel(data.volume24hr);
    const markerSize = this.getMarkerSize(activityLevel, data.markets.length);
    const location = this.regions[locationId];

    marker.setStyle({
      fillColor: this.getMarkerColor(activityLevel),
      fillOpacity: this.getMarkerOpacity(activityLevel),
      color: this.getMarkerColor(activityLevel)
    });
    marker.setRadius(markerSize);

    // Update popup
    marker.setPopupContent(this.createPopupContent(location, data));

    // Handle high-activity blinking
    const el = marker.getElement();
    if (el) {
      if (activityLevel === 'high') {
        el.classList.add('high-activity');
      } else {
        el.classList.remove('high-activity');
      }
    }
  },

  // Get activity level based on 24hr volume
  getActivityLevel(volume24hr) {
    if (volume24hr >= this.ACTIVITY_HIGH) return 'high';
    if (volume24hr >= this.ACTIVITY_MEDIUM) return 'medium';
    return 'low';
  },

  // Get marker size based on activity and market count
  getMarkerSize(activityLevel, marketCount) {
    const baseSize = Math.min(6 + marketCount * 1.5, 12);

    switch (activityLevel) {
      case 'high': return baseSize + 4;
      case 'medium': return baseSize + 2;
      default: return baseSize;
    }
  },

  // Get marker color based on activity
  getMarkerColor(activityLevel) {
    switch (activityLevel) {
      case 'high': return '#ff3b3b';    // Red for high activity
      case 'medium': return '#ff9500';  // Orange for medium
      default: return '#ff9500';        // Orange default
    }
  },

  // Get marker opacity based on activity
  getMarkerOpacity(activityLevel) {
    switch (activityLevel) {
      case 'high': return 0.7;
      case 'medium': return 0.5;
      default: return 0.3;
    }
  },

  // Create popup content
  createPopupContent(location, data) {
    const marketCount = data.markets.length;
    const vol24h = this.formatVolume(data.volume24hr);

    return `
      <div class="popup-title">${location.name}</div>
      <div class="popup-count">${marketCount} active market${marketCount !== 1 ? 's' : ''}</div>
      <div class="popup-count">24h volume: ${vol24h}</div>
    `;
  },

  // Format volume
  formatVolume(vol) {
    if (!vol || vol === 0) return '$0';
    if (vol >= 1000000) return '$' + (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return '$' + Math.round(vol / 1000) + 'K';
    return '$' + Math.round(vol);
  },

  // Focus on a specific region
  focusRegion(regionId) {
    const id = regionId.toLowerCase().replace(/\s+/g, '');

    // Try exact match first
    let location = this.regions[id];

    // Try to find by keyword if exact match fails
    if (!location) {
      for (const [locId, loc] of Object.entries(this.regions)) {
        if (loc.keywords.some(k => k.toLowerCase() === id || locId === id)) {
          location = loc;
          break;
        }
      }
    }

    if (!location) {
      console.warn('[MAP] Region not found:', regionId);
      return false;
    }

    // Find the locationId
    const locationId = Object.entries(this.regions).find(([_, l]) => l === location)?.[0];

    this.map.setView(location.coords, location.zoom, {
      animate: true,
      duration: 0.5
    });

    if (locationId) {
      this.selectRegion(locationId);
    }
    return true;
  },

  // Select a region (highlight it and show markets)
  selectRegion(locationId) {
    const location = this.regions[locationId];
    if (!location) return;

    this.selectedRegion = locationId;

    // Update header
    document.getElementById('map-focus').textContent = location.name.toUpperCase();

    // Update movers panel header
    const moversTitle = document.querySelector('.movers-panel .panel-title');
    const moversBadge = document.querySelector('.movers-panel .panel-badge');
    if (moversTitle) moversTitle.textContent = location.name.toUpperCase() + ' MARKETS';
    if (moversBadge) {
      const data = this.activeLocations[locationId];
      const marketCount = data ? data.markets.length : 0;
      moversBadge.textContent = marketCount + ' MKT' + (marketCount !== 1 ? 'S' : '');
    }

    // Highlight the selected marker, dim others
    for (const [id, marker] of Object.entries(this.markers)) {
      const data = this.activeLocations[id];
      if (id === locationId) {
        marker.setStyle({
          fillColor: '#00ff41',
          color: '#00ff41',
          fillOpacity: 0.8
        });
        marker.setRadius(14);
        marker.getElement()?.classList.remove('high-activity');
      } else {
        // Restore normal style
        const activityLevel = data ? this.getActivityLevel(data.volume24hr) : 'low';
        marker.setStyle({
          fillColor: this.getMarkerColor(activityLevel),
          color: this.getMarkerColor(activityLevel),
          fillOpacity: this.getMarkerOpacity(activityLevel) * 0.5 // Dim non-selected
        });
        marker.setRadius(this.getMarkerSize(activityLevel, data?.markets.length || 1) * 0.8);
      }
    }

    // Trigger event for markets module
    document.dispatchEvent(new CustomEvent('regionSelected', {
      detail: { regionId: locationId, region: location }
    }));
  },

  // Reset to world view
  resetView() {
    this.map.setView([20, 0], 2, {
      animate: true,
      duration: 0.5
    });

    this.selectedRegion = null;
    document.getElementById('map-focus').textContent = 'WORLD VIEW';

    // Restore movers panel header
    const moversTitle = document.querySelector('.movers-panel .panel-title');
    const moversBadge = document.querySelector('.movers-panel .panel-badge');
    if (moversTitle) moversTitle.textContent = 'TOP VOLUME';
    if (moversBadge) moversBadge.textContent = 'ALL TIME';

    // Restore all markers to normal style
    for (const [id, marker] of Object.entries(this.markers)) {
      const data = this.activeLocations[id];
      const activityLevel = data ? this.getActivityLevel(data.volume24hr) : 'low';

      marker.setStyle({
        fillColor: this.getMarkerColor(activityLevel),
        color: this.getMarkerColor(activityLevel),
        fillOpacity: this.getMarkerOpacity(activityLevel)
      });
      marker.setRadius(this.getMarkerSize(activityLevel, data?.markets.length || 1));

      // Restore blinking for high activity
      const el = marker.getElement();
      if (el && activityLevel === 'high') {
        el.classList.add('high-activity');
      }
    }
  },

  // Get region by keyword match (used by commands)
  getRegionByKeyword(keyword) {
    const kw = keyword.toLowerCase();
    for (const [id, location] of Object.entries(this.regions)) {
      if (location.keywords.some(k => kw.includes(k) || k.includes(kw))) {
        return id;
      }
    }
    return null;
  },

  // Get markets for a location (for region markets display)
  getMarketsForLocation(locationId) {
    return this.activeLocations[locationId]?.markets || [];
  }
};
