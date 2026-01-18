// ============================================
// RELATED MARKETS MODULE - Connect news/Telegram to markets
// Uses actual Polymarket tags for matching
// ============================================

const RelatedMarketsModule = {
  // Map news triggers to Polymarket tag slugs
  // Tags should match what Polymarket actually uses (see server.js includeTags)
  topicToTags: {
    // === GEOPOLITICAL - EUROPE/RUSSIA ===
    ukraine: {
      triggers: ['ukraine', 'ukrainian', 'zelensky', 'zelenskyy', 'kyiv', 'kiev', 'crimea',
                 'donbas', 'donetsk', 'luhansk', 'kharkiv', 'kherson', 'zaporizhzhia',
                 'bakhmut', 'avdiivka', 'kursk', 'zsu', 'azov', 'dnipro', 'odesa', 'mariupol',
                 'front line', 'counteroffensive', 'himars', 'patriot missile', 'leopard tank',
                 'abrams tank', 'f-16', 'shahed drone', 'geran drone', 'war of attrition'],
      tags: ['ukraine', 'russia', 'zelensky', 'putin', 'nato', 'ceasefire', 'crimea', 'geopolitics']
    },
    russia: {
      triggers: ['russia', 'russian', 'putin', 'kremlin', 'moscow', 'wagner', 'prigozhin',
                 'medvedev', 'lavrov', 'navalny', 'shoigu', 'gerasimov', 'fsb', 'gru',
                 'belgorod', 'rostov', 'bryansk', 'russian military'],
      tags: ['russia', 'putin', 'ukraine', 'nato', 'sanctions', 'geopolitics']
    },

    // === GEOPOLITICAL - MIDDLE EAST ===
    israel: {
      triggers: ['israel', 'israeli', 'gaza', 'hamas', 'netanyahu', 'idf', 'tel aviv',
                 'jerusalem', 'west bank', 'rafah', 'hostage', 'palestinian', 'palestine',
                 'khan younis', 'mossad', 'iron dome', 'qassam', 'philadelphi corridor',
                 'kibbutz', 'settler', 'october 7', 'oct 7', 'gallant', 'knesset'],
      tags: ['israel', 'gaza', 'hamas', 'netanyahu', 'palestine', 'middle-east', 'ceasefire', 'hostage', 'geopolitics']
    },
    hezbollah: {
      triggers: ['hezbollah', 'lebanon', 'lebanese', 'nasrallah', 'beirut', 'litani river',
                 'southern lebanon', 'dahieh', 'pager explosion', 'radwan force'],
      tags: ['hezbollah', 'lebanon', 'israel', 'middle-east', 'geopolitics']
    },
    iran: {
      triggers: ['iran', 'iranian', 'tehran', 'ayatollah', 'khamenei', 'irgc', 'natanz',
                 'enrichment', 'uranium enrichment', 'centrifuge', 'fordow', 'breakout time',
                 'nuclear threshold', 'axis of resistance', 'quds force', 'ballistic missile',
                 'shahab', 'persian gulf', 'strait of hormuz'],
      tags: ['iran', 'nuclear', 'middle-east', 'sanctions', 'geopolitics']
    },
    syria: {
      triggers: ['syria', 'syrian', 'damascus', 'assad', 'aleppo', 'idlib', 'hts', 'al-jolani',
                 'hayat tahrir', 'white helmets', 'sdf', 'latakia', 'tartus'],
      tags: ['syria', 'assad', 'middle-east', 'geopolitics']
    },
    yemen: {
      triggers: ['yemen', 'yemeni', 'houthi', 'sanaa', 'red sea', 'bab el-mandeb', 'aden',
                 'marib', 'ship attack', 'commercial vessel', 'suez alternative'],
      tags: ['yemen', 'houthi', 'middle-east', 'red-sea', 'geopolitics']
    },
    saudiarabia: {
      triggers: ['saudi', 'saudi arabia', 'riyadh', 'mbs', 'mohammed bin salman', 'aramco'],
      tags: ['saudi-arabia', 'middle-east', 'oil', 'geopolitics']
    },

    // === GEOPOLITICAL - ASIA ===
    china: {
      triggers: ['china', 'chinese', 'beijing', 'xi jinping', 'pla', 'ccp', 'xinjiang',
                 'south china sea', 'taiwan strait', 'reunification', 'blockade taiwan',
                 'first island chain', 'fujian', 'liaoning carrier', 'shandong carrier',
                 'decoupling', 'de-risking', 'made in china', 'belt and road', 'bri'],
      tags: ['china', 'xi-jinping', 'trade-war', 'geopolitics', 'foreign-policy']
    },
    taiwan: {
      triggers: ['taiwan', 'taiwanese', 'taipei', 'tsmc', 'semiconductor', 'invasion taiwan'],
      tags: ['taiwan', 'china', 'geopolitics', 'foreign-policy']
    },
    hongkong: {
      triggers: ['hong kong', 'hongkong'],
      tags: ['hong-kong', 'china', 'geopolitics']
    },
    korea: {
      triggers: ['north korea', 'pyongyang', 'kim jong', 'dprk', 'korean peninsula', 'icbm',
                 'hwasong', 'yongbyon', 'nuclear test', 'kim yo jong', 'dmz', '38th parallel'],
      tags: ['north-korea', 'korea', 'kim-jong-un', 'nuclear', 'geopolitics']
    },
    japan: {
      triggers: ['japan', 'japanese', 'tokyo', 'kishida', 'yen ', 'bank of japan', 'boj'],
      tags: ['japan', 'asia', 'geopolitics']
    },
    india: {
      triggers: ['india', 'indian', 'modi', 'delhi', 'mumbai', 'bjp', 'rupee'],
      tags: ['india', 'asia', 'geopolitics', 'world-elections']
    },
    pakistan: {
      triggers: ['pakistan', 'pakistani', 'islamabad', 'imran khan'],
      tags: ['pakistan', 'asia', 'geopolitics']
    },

    // === GEOPOLITICAL - AMERICAS ===
    venezuela: {
      triggers: ['venezuela', 'venezuelan', 'maduro', 'caracas', 'guaido', 'machado'],
      tags: ['venezuela', 'maduro', 'latin-america', 'geopolitics']
    },
    brazil: {
      triggers: ['brazil', 'brazilian', 'lula', 'bolsonaro', 'brasilia'],
      tags: ['brazil', 'latin-america', 'geopolitics', 'world-elections']
    },
    argentina: {
      triggers: ['argentina', 'argentine', 'milei', 'buenos aires', 'peso'],
      tags: ['argentina', 'latin-america', 'geopolitics']
    },
    mexico: {
      triggers: ['mexico', 'mexican', 'sheinbaum', 'amlo', 'cartel', 'peso mexicano'],
      tags: ['mexico', 'latin-america', 'geopolitics']
    },
    canada: {
      triggers: ['canada', 'canadian', 'trudeau', 'ottawa', 'poilievre', 'carney'],
      tags: ['canada', 'trudeau', 'canadian-election', 'world-elections']
    },
    cuba: {
      triggers: ['cuba', 'cuban', 'havana', 'castro'],
      tags: ['cuba', 'latin-america', 'geopolitics']
    },

    // === GEOPOLITICAL - EUROPE ===
    uk: {
      triggers: ['united kingdom', 'britain', 'british', 'starmer', 'sunak', 'london',
                 'westminster', 'labour party', 'tory', 'conservative party uk'],
      tags: ['uk', 'britain', 'starmer', 'world-elections', 'geopolitics']
    },
    france: {
      triggers: ['france', 'french', 'macron', 'paris', 'le pen', 'elysee', 'assemblée'],
      tags: ['france', 'macron', 'le-pen', 'world-elections', 'geopolitics']
    },
    germany: {
      triggers: ['germany', 'german', 'scholz', 'berlin', 'bundestag', 'merz', 'afd'],
      tags: ['germany', 'scholz', 'merz', 'world-elections', 'geopolitics']
    },
    italy: {
      triggers: ['italy', 'italian', 'rome', 'meloni'],
      tags: ['italy', 'europe', 'geopolitics']
    },
    spain: {
      triggers: ['spain', 'spanish', 'madrid', 'sanchez'],
      tags: ['spain', 'europe', 'geopolitics']
    },
    poland: {
      triggers: ['poland', 'polish', 'warsaw', 'tusk', 'duda'],
      tags: ['poland', 'europe', 'nato', 'geopolitics']
    },
    nato: {
      triggers: ['nato', 'north atlantic treaty', 'article 5', 'alliance', 'collective defense'],
      tags: ['nato', 'alliance', 'geopolitics', 'foreign-policy']
    },
    eu: {
      triggers: ['european union', 'eu ', 'brussels', 'von der leyen', 'european commission',
                 'european council', 'european parliament', 'eurozone'],
      tags: ['eu', 'european-union', 'europe', 'geopolitics']
    },
    greenland: {
      triggers: ['greenland', 'nuuk', 'arctic'],
      tags: ['greenland', 'arctic', 'geopolitics']
    },
    denmark: {
      triggers: ['denmark', 'danish', 'copenhagen'],
      tags: ['denmark', 'europe', 'greenland']
    },
    panama: {
      triggers: ['panama', 'canal', 'panama canal'],
      tags: ['panama', 'panama-canal', 'latin-america', 'geopolitics']
    },

    // === RELIGION/CULTURE ===
    pope: {
      triggers: ['pope', 'vatican', 'pontiff', 'francis', 'conclave', 'papal', 'holy see'],
      tags: ['pope', 'vatican', 'pope-francis', 'catholicism']
    },

    // === US DOMESTIC - TRUMP ADMIN ===
    trump: {
      triggers: ['trump', 'mar-a-lago', 'maga', 'trump administration', 'president trump'],
      tags: ['trump', 'trump-presidency', 'trump-cabinet', 'donald-trump', 'us-government']
    },
    cabinet: {
      triggers: ['cabinet', 'secretary', 'confirmation hearing', 'senate confirmation',
                 'attorney general', 'patel', 'hegseth', 'bondi', 'rubio', 'noem', 'gabbard',
                 'vance', 'burgum', 'bessent', 'lutnick', 'ratcliffe'],
      tags: ['trump-cabinet', 'cabinet', 'confirmation', 'us-government', 'trump-presidency']
    },
    doge: {
      triggers: ['doge', 'department of government efficiency', 'government efficiency',
                 'vivek ramaswamy', 'federal workforce', 'spending cuts'],
      tags: ['doge', 'government-efficiency', 'elon-musk', 'trump-presidency', 'us-government']
    },
    pardons: {
      triggers: ['pardon', 'pardoned', 'clemency', 'commute sentence', 'january 6 pardon', 'j6 pardon'],
      tags: ['pardon', 'pardons', 'clemency', 'trump-presidency']
    },
    executive_orders: {
      triggers: ['executive order', 'executive action', 'day one', 'first day'],
      tags: ['executive-order', 'trump-presidency', 'us-government']
    },

    // === US DOMESTIC - IMMIGRATION ===
    immigration: {
      triggers: ['ice ', 'ice,', 'i.c.e.', 'deportation', 'deport', 'illegal immigrant',
                 'undocumented', 'migrant', 'immigration', 'sanctuary city', 'border patrol',
                 'cbp', 'asylum', 'ice raids', 'mass deportation', 'guatemala', 'hondura',
                 'el salvador', 'northern triangle', 'caravans', 'darien gap', 'title 42',
                 'remain in mexico', 'catch and release', 'border wall', 'border crisis',
                 'border czar', 'border security', 'dhs', 'uscis', 'green card', 'h-1b',
                 'dreamers', 'daca', 'visa', 'tom homan'],
      tags: ['immigration', 'deportation', 'border', 'ice', 'migrant', 'sanctuary', 'us-government']
    },

    // === US DOMESTIC - TRADE/ECONOMY ===
    tariffs: {
      triggers: ['tariff', 'trade war', 'import duty', 'trade deal', 'trade policy', 'section 301',
                 'usmca', 'nafta', 'wto', 'trade deficit', 'trade surplus', 'dumping',
                 'protectionism', 'retaliatory tariff', 'reciprocal tariff', 'customs duty',
                 'import tax', 'export ban', 'trade representative'],
      tags: ['tariff', 'tariffs', 'trade-war', 'trade', 'economic-policy', 'foreign-policy']
    },
    fed: {
      triggers: ['fed ', 'federal reserve', 'rate cut', 'rate hike', 'interest rate',
                 'fomc', 'powell', 'monetary policy', 'basis point', 'quantitative easing',
                 'qt', 'qe', 'balance sheet', 'treasury yield', 'dot plot', 'jackson hole',
                 'hawkish', 'dovish', 'soft landing', 'hard landing', 'terminal rate'],
      tags: ['fed', 'fed-rates', 'interest-rate', 'powell', 'fomc', 'federal-reserve', 'economic-policy']
    },
    recession: {
      triggers: ['recession', 'gdp', 'unemployment', 'jobs report', 'economic growth',
                 'nonfarm payroll', 'jobless claims', 'labor market', 'hiring freeze',
                 'layoffs', 'mass layoff', 'economic contraction', 'negative growth',
                 'inverted yield curve', 'sahm rule', 'leading indicators'],
      tags: ['recession', 'economy', 'gdp', 'unemployment', 'economic-policy']
    },
    inflation: {
      triggers: ['inflation', 'cpi', 'consumer price', 'pce', 'cost of living',
                 'core inflation', 'headline inflation', 'sticky inflation', 'disinflation',
                 'deflation', 'stagflation', 'price stability', 'real wages', 'purchasing power'],
      tags: ['inflation', 'cpi', 'prices', 'economic-policy']
    },

    // === US DOMESTIC - CONGRESS/GOVERNMENT ===
    congress: {
      triggers: ['congress', 'speaker', 'house of representatives', 'senate ', 'capitol hill',
                 'mike johnson', 'chuck schumer', 'hakeem jeffries', 'mcconnell', 'senate majority',
                 'house majority', 'filibuster', 'cloture', 'reconciliation'],
      tags: ['congress', 'senate', 'house', 'speaker', 'us-government']
    },
    shutdown: {
      triggers: ['shutdown', 'government shutdown', 'funding bill', 'continuing resolution',
                 'debt ceiling', 'appropriations', 'omnibus', 'government funding'],
      tags: ['shutdown', 'government-shutdown', 'budget', 'debt-ceiling', 'congress', 'us-government']
    },
    scotus: {
      triggers: ['supreme court', 'scotus', 'justice ', 'clarence thomas', 'alito', 'roberts',
                 'kavanaugh', 'barrett', 'sotomayor', 'kagan', 'jackson', 'gorsuch'],
      tags: ['scotus', 'supreme-court', 'courts', 'us-government']
    },
    fbi: {
      triggers: ['fbi', 'doj', 'department of justice', 'kash patel', 'special counsel',
                 'indictment', 'investigation', 'federal prosecution'],
      tags: ['fbi', 'doj', 'justice-department', 'us-government']
    },
    insurrection: {
      triggers: ['insurrection act', 'martial law', 'invoke insurrection', 'national emergency'],
      tags: ['insurrection', 'insurrection-act', 'martial-law', 'trump-presidency']
    },

    // === US DOMESTIC - ELECTIONS ===
    elections_us: {
      triggers: ['2024 election', '2026 election', '2028 election', 'midterm', 'primary',
                 'electoral college', 'swing state', 'battleground', 'presidential race',
                 'democratic nominee', 'republican nominee', 'gop primary', 'iowa caucus',
                 'new hampshire primary', 'super tuesday', 'convention'],
      tags: ['us-presidential-election', 'midterms', 'primaries', 'elections', 'us-government']
    },
    elections_world: {
      triggers: ['election', 'vote', 'polls', 'ballot', 'referendum'],
      tags: ['world-elections', 'global-elections', 'elections']
    },

    // === TECH/BUSINESS ===
    elon: {
      triggers: ['elon musk', 'musk ', 'tesla ', 'spacex', 'starlink', 'x corp', 'twitter'],
      tags: ['elon-musk', 'musk', 'tesla', 'spacex', 'tech']
    },
    ai: {
      triggers: ['artificial intelligence', ' ai ', 'openai', 'chatgpt', 'claude', 'gemini',
                 'anthropic', 'large language model', 'llm', 'machine learning', 'neural network',
                 'agi', 'superintelligence', 'ai safety', 'ai regulation', 'deepmind', 'gpt-5'],
      tags: ['ai', 'artificial-intelligence', 'openai', 'tech']
    },
    tech: {
      triggers: ['apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'nvidia',
                 'silicon valley', 'big tech', 'antitrust tech'],
      tags: ['tech', 'technology', 'business']
    },

    // === COMMODITIES/MARKETS ===
    oil: {
      triggers: ['oil price', 'crude oil', 'brent', 'wti ', 'opec', 'oil production',
                 'oil embargo', 'petroleum', 'energy crisis', 'oil supply', 'oil demand',
                 'strategic petroleum reserve', 'spr', 'oil refinery', 'gasoline price',
                 'natural gas', 'lng'],
      tags: ['oil', 'energy', 'opec', 'commodities']
    },
    gold: {
      triggers: ['gold price', 'gold trading', 'gold market', 'bullion', 'gold reserve',
                 'gold standard', 'precious metal', 'gold etf', 'comex gold', 'spot gold',
                 'gold demand', 'central bank gold', 'gold bug', 'xau'],
      tags: ['gold', 'commodities', 'precious-metals']
    },
    crypto: {
      triggers: ['bitcoin', 'btc ', 'ethereum', 'eth ', 'crypto', 'cryptocurrency',
                 'blockchain', 'defi', 'nft', 'stablecoin', 'binance', 'coinbase',
                 'sec crypto', 'crypto regulation', 'spot etf', 'crypto etf'],
      tags: ['bitcoin', 'crypto', 'ethereum', 'cryptocurrency']
    },

    // === GLOBAL ISSUES ===
    climate: {
      triggers: ['climate change', 'global warming', 'paris agreement', 'cop28', 'cop29',
                 'carbon emissions', 'net zero', 'greenhouse gas', 'renewable energy'],
      tags: ['climate', 'environment', 'energy']
    },
    pandemic: {
      triggers: ['pandemic', 'covid', 'coronavirus', 'disease outbreak', 'epidemic', 'vaccine mandate'],
      tags: ['pandemic', 'covid', 'health']
    }
  },

  // Detect ALL matching topics from text
  // Returns array of { topicId, tags } for every topic that matches
  detectAllTopics(text) {
    const lowerText = text.toLowerCase();
    const matches = [];
    const seenTopics = new Set();

    for (const [topicId, config] of Object.entries(this.topicToTags)) {
      for (const trigger of config.triggers) {
        if (lowerText.includes(trigger) && !seenTopics.has(topicId)) {
          seenTopics.add(topicId);
          matches.push({ topicId, tags: config.tags, trigger });
          break; // Found one trigger for this topic, move to next topic
        }
      }
    }

    if (matches.length > 0) {
      console.log('[RelatedMarkets] Matched topics:', matches.map(m => m.topicId).join(', '));
    }
    return matches;
  },

  // Legacy single-topic detection (for map zoom - uses first/primary match)
  detectTopic(text) {
    const matches = this.detectAllTopics(text);
    return matches.length > 0 ? matches[0] : null;
  },

  // Check if market has any of the target tags
  marketHasTag(market, targetTags) {
    // Get tag slugs from the market's tags array
    const marketTags = (market.tags || []).map(t => t.slug?.toLowerCase() || t.label?.toLowerCase() || '');

    // Check if any target tag matches
    return targetTags.some(targetTag => {
      const target = targetTag.toLowerCase();

      // For short tags, require exact match only
      if (target.length <= 4) {
        return marketTags.some(marketTag => marketTag === target);
      }

      // For longer tags, allow substring matching
      return marketTags.some(marketTag =>
        marketTag === target ||
        marketTag.includes(target) ||
        target.includes(marketTag)
      );
    });
  },

  // Find related markets using Polymarket's actual tags
  // Now uses ALL detected topics, not just the first one
  findRelatedMarkets(text, limit = 10, filterTag = null) {
    const allDetected = this.detectAllTopics(text);

    if (allDetected.length === 0) {
      console.log('[RelatedMarkets] No topics detected for:', text.slice(0, 50));
      return { markets: [], allTags: [], detectedTopics: [] };
    }

    // Combine tags from ALL detected topics
    const allTargetTags = [...new Set(allDetected.flatMap(d => d.tags))];

    console.log('[RelatedMarkets] Detected topics:', allDetected.map(d => d.topicId).join(', '));
    console.log('[RelatedMarkets] Looking for tags:', allTargetTags.join(', '));

    // Separate specific tags from generic tags
    const genericTags = new Set(['geopolitics', 'politics', 'world', 'foreign-policy', 'us-government',
                                  'economic-policy', 'elections', 'world-elections', 'global-elections']);
    const specificTags = allTargetTags.filter(t => !genericTags.has(t.toLowerCase()));

    console.log('[RelatedMarkets] Specific tags:', specificTags.join(', '));

    // Score and filter markets by relevance
    const allMatches = MarketsModule.markets
      .filter(market => market.markets && market.markets.length > 0)
      .map(market => {
        const marketTags = (market.tags || []).map(t => (t.slug || t.label || '').toLowerCase());
        const titleLower = ((market.title || '') + ' ' + (market.description || '')).toLowerCase();

        // Count how many SPECIFIC tags this market matches
        let specificMatches = 0;
        let genericMatches = 0;

        for (const tag of allTargetTags) {
          const tagLower = tag.toLowerCase();

          // For short tags (<=4 chars like "ice", "fed"), require exact match or word boundary
          // For longer tags, allow substring matching
          let hasTag = false;
          if (tagLower.length <= 4) {
            // Exact match only for short tags
            hasTag = marketTags.some(mt => mt === tagLower);
          } else {
            // Substring matching OK for longer tags
            hasTag = marketTags.some(mt => mt === tagLower || mt.includes(tagLower) || tagLower.includes(mt));
          }

          // For title matching, use word boundary regex for short tags
          let inTitle = false;
          if (tagLower.length <= 4) {
            const regex = new RegExp(`\\b${tagLower}\\b`, 'i');
            inTitle = regex.test(titleLower);
          } else {
            inTitle = titleLower.includes(tagLower);
          }

          if (hasTag || inTitle) {
            if (genericTags.has(tagLower)) {
              genericMatches++;
            } else {
              specificMatches++;
            }
          }
        }

        return { market, specificMatches, genericMatches, totalScore: specificMatches * 10 + genericMatches };
      })
      .filter(item => item.specificMatches > 0) // MUST match at least one specific tag
      .sort((a, b) => {
        // Sort by specific matches first, then by volume
        if (b.specificMatches !== a.specificMatches) return b.specificMatches - a.specificMatches;
        return (b.market.volume || 0) - (a.market.volume || 0);
      })
      .map(item => item.market);

    // Collect all unique tags from matched markets
    const tagCounts = new Map();
    allMatches.forEach(market => {
      (market.tags || []).forEach(tag => {
        const slug = tag.slug || tag.label || '';
        if (slug) {
          tagCounts.set(slug, (tagCounts.get(slug) || 0) + 1);
        }
      });
    });

    // Sort tags by RELEVANCE to the headline, not just frequency
    // Tags that match our detected topic tags come first
    const targetTagSet = new Set(allTargetTags.map(t => t.toLowerCase()));

    const allTags = [...tagCounts.entries()]
      .map(([tag, count]) => ({
        tag,
        count,
        isRelevant: targetTagSet.has(tag.toLowerCase()) ||
                    allTargetTags.some(t => tag.toLowerCase().includes(t.toLowerCase()) ||
                                           t.toLowerCase().includes(tag.toLowerCase()))
      }))
      .sort((a, b) => {
        // Relevant tags first
        if (a.isRelevant && !b.isRelevant) return -1;
        if (!a.isRelevant && b.isRelevant) return 1;
        // Then by count
        return b.count - a.count;
      })
      .slice(0, 12)
      .map(({ tag, count }) => ({ tag, count }));

    // Apply filter if specified
    let filteredMatches = allMatches;
    if (filterTag) {
      filteredMatches = allMatches.filter(market => {
        const marketTags = (market.tags || []).map(t => (t.slug || t.label || '').toLowerCase());
        return marketTags.includes(filterTag.toLowerCase());
      });
    }

    const markets = filteredMatches
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, limit)
      .map(market => MarketsModule.processEvent(market));

    console.log('[RelatedMarkets] Found', markets.length, 'markets', filterTag ? `(filtered by ${filterTag})` : '');

    return { markets, allTags, detectedTopics: allDetected };
  },

  // Show the related markets modal with AI matching
  async showModal(text, sourceType = 'news', filterTag = null) {
    // Remove existing modal
    const existing = document.getElementById('related-markets-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'related-markets-modal';
    modal.className = 'related-markets-modal';

    const truncatedText = text.length > 100 ? text.slice(0, 97) + '...' : text;

    // Show loading state
    modal.innerHTML = `
      <div class="related-markets-content">
        <div class="related-markets-header">
          <span class="related-markets-title">RELATED MARKETS</span>
          <span class="related-markets-topic">AI ANALYZING...</span>
          <button class="related-markets-close">&times;</button>
        </div>
        <div class="related-markets-source">"${this.escapeHtml(truncatedText)}"</div>
        <div class="related-markets-loading">
          <div class="loading">Analyzing content for relevant markets...</div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.related-markets-close').addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
    requestAnimationFrame(() => modal.classList.add('visible'));

    // Try AI matching first, fall back to keyword matching
    let markets = [];
    let topicLabel = 'AI MATCH';

    try {
      markets = await this.findMarketsWithAI(text);
      if (markets.length === 0) {
        // Fallback to keyword matching
        const keywordResult = this.findRelatedMarkets(text, 15, filterTag);
        markets = keywordResult.markets;
        topicLabel = keywordResult.detectedTopics.length > 0
          ? keywordResult.detectedTopics.map(d => d.topicId.toUpperCase().replace(/_/g, ' ')).join(' + ')
          : 'NO MATCH';
      }
    } catch (error) {
      console.error('[RelatedMarkets] AI match error:', error);
      // Fallback to keyword matching
      const keywordResult = this.findRelatedMarkets(text, 15, filterTag);
      markets = keywordResult.markets;
      topicLabel = keywordResult.detectedTopics.length > 0
        ? keywordResult.detectedTopics.map(d => d.topicId.toUpperCase().replace(/_/g, ' ')).join(' + ')
        : 'KEYWORD MATCH';
    }

    // Update modal with results
    if (markets.length === 0) {
      modal.querySelector('.related-markets-content').innerHTML = `
        <div class="related-markets-header">
          <span class="related-markets-title">RELATED MARKETS</span>
          <span class="related-markets-topic">${topicLabel}</span>
          <button class="related-markets-close">&times;</button>
        </div>
        <div class="related-markets-source">"${this.escapeHtml(truncatedText)}"</div>
        <div class="related-markets-empty">No related markets found</div>
      `;
    } else {
      modal.querySelector('.related-markets-content').innerHTML = `
        <div class="related-markets-header">
          <span class="related-markets-title">RELATED MARKETS</span>
          <span class="related-markets-topic">${topicLabel}</span>
          <span class="related-markets-count">${markets.length} found</span>
          <button class="related-markets-close">&times;</button>
        </div>
        <div class="related-markets-source">"${this.escapeHtml(truncatedText)}"</div>
        <div class="related-markets-list">
          ${markets.map((market, idx) => this.renderMarketItem(market, idx)).join('')}
        </div>
      `;
    }

    // Re-attach close handler after content update
    modal.querySelector('.related-markets-close').addEventListener('click', () => this.closeModal());
    this.attachModalHandlers(modal, markets, text, sourceType);
  },

  // AI-powered market matching
  async findMarketsWithAI(text) {
    // Get all markets with at least $1000 volume (somewhat liquid)
    // Then take top 500 by volume for AI analysis
    const allMarkets = MarketsModule.markets
      .filter(m => m.markets && m.markets.length > 0 && (m.volume || 0) >= 1000)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 500);

    if (allMarkets.length === 0) return [];

    // Build market list for AI
    const marketList = allMarkets.map((m, i) => ({
      index: i,
      title: m.title || m.question
    }));

    try {
      const response = await fetch('/api/match-markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweet: text,
          markets: marketList
        })
      });

      if (!response.ok) {
        throw new Error('AI match request failed');
      }

      const data = await response.json();
      const indices = data.indices || [];

      // Map indices back to markets
      const matchedMarkets = indices
        .filter(i => i >= 0 && i < allMarkets.length)
        .map(i => MarketsModule.processEvent(allMarkets[i]));

      console.log('[RelatedMarkets] AI matched', matchedMarkets.length, 'markets');
      return matchedMarkets;
    } catch (error) {
      console.error('[RelatedMarkets] AI match error:', error);
      return [];
    }
  },

  renderMarketItem(market, index) {
    const prob = Math.round(market.price * 100);
    const volume = MarketsModule.formatVolume(market.volume);

    let typeIndicator = '';
    if (market.eventType === 'multiple-choice') {
      typeIndicator = `<span class="market-type-badge">MULTI</span>`;
    } else if (market.eventType === 'date-series') {
      typeIndicator = `<span class="market-type-badge">DATES</span>`;
    }

    return `
      <div class="related-market-item" data-index="${index}">
        <div class="related-market-main">
          <span class="related-market-num">${index + 1}</span>
          <span class="related-market-title">${market.title}</span>
          ${typeIndicator}
        </div>
        <div class="related-market-stats">
          <span class="related-market-prob">${prob}%</span>
          <span class="related-market-vol">${volume}</span>
        </div>
      </div>
    `;
  },

  attachModalHandlers(modal, markets, originalText, sourceType) {
    modal.querySelector('.related-markets-close').addEventListener('click', () => {
      this.closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Tag filter clicks
    modal.querySelectorAll('.tag-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag || null;
        this.showModal(originalText, sourceType, tag);
      });
    });

    // Market item clicks
    modal.querySelectorAll('.related-market-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        const market = markets[index];
        if (market) {
          this.openMarketChart(market);
          this.closeModal();
        }
      });
    });
  },

  // Map topics to map region IDs
  topicToRegion: {
    ukraine: 'ukraine',
    russia: 'russia',
    israel: 'israel',
    hezbollah: 'lebanon',
    iran: 'iran',
    syria: 'syria',
    yemen: 'yemen',
    saudiarabia: 'saudiarabia',
    china: 'china',
    taiwan: 'taiwan',
    hongkong: 'hongkong',
    korea: 'northkorea',
    japan: 'japan',
    india: 'india',
    pakistan: 'pakistan',
    turkey: 'turkey',
    venezuela: 'venezuela',
    brazil: 'brazil',
    argentina: 'argentina',
    mexico: 'mexico',
    canada: 'canada',
    cuba: 'cuba',
    uk: 'uk',
    france: 'france',
    germany: 'germany',
    italy: 'italy',
    spain: 'spain',
    poland: 'poland',
    greenland: 'greenland',
    denmark: 'denmark',
    panama: 'panama',
    pope: 'italy',
    immigration: 'usa',
    tariffs: 'usa',
    fed: 'washingtondc',
    doge: 'washingtondc',
    elon: 'usa',
    trump: 'washingtondc',
    cabinet: 'washingtondc',
    pardons: 'washingtondc',
    executive_orders: 'washingtondc',
    shutdown: 'washingtondc',
    congress: 'washingtondc',
    scotus: 'washingtondc',
    fbi: 'washingtondc',
    insurrection: 'washingtondc',
    elections_us: 'washingtondc',
    recession: 'usa',
    inflation: 'usa',
    nato: 'germany',
    eu: 'belgium',
    oil: 'saudiarabia',
    gold: 'switzerland',
    crypto: 'usa',
    ai: 'usa',
    tech: 'usa'
  },

  openMarketChart(market) {
    if (!market) return;

    // Zoom map to the relevant region
    this.zoomMapToMarket(market);

    if (market.eventType === 'multiple-choice' && market.choices.length > 1) {
      ChartModule.loadMultiChart(market.choices, market.title);
      return;
    }

    if (market.eventType === 'date-series' && market.dateMarkets.length > 1) {
      ChartModule.loadMultiChart(market.dateMarkets, market.title);
      return;
    }

    if (market.tokenId) {
      ChartModule.loadChart(market.tokenId, market.title);
    }
  },

  // Zoom the map based on market topic/tags
  zoomMapToMarket(market) {
    if (!market || typeof MapModule === 'undefined') return;

    // First try: detect topic from market title
    const detected = this.detectTopic(market.title);
    if (detected && this.topicToRegion[detected.topicId]) {
      const regionId = this.topicToRegion[detected.topicId];
      console.log('[RelatedMarkets] Zooming map to', regionId, 'for topic', detected.topicId);
      MapModule.focusRegion(regionId);
      return;
    }

    // Second try: use market tags directly with MapModule.getRegionByKeyword
    const marketTags = (market.tags || []).map(t => t.slug || t.label || '');
    for (const tag of marketTags) {
      const regionId = MapModule.getRegionByKeyword(tag);
      if (regionId) {
        console.log('[RelatedMarkets] Zooming map to', regionId, 'via tag', tag);
        MapModule.focusRegion(regionId);
        return;
      }
    }

    // Third try: search title for location keywords
    const regionId = MapModule.getRegionByKeyword(market.title);
    if (regionId) {
      console.log('[RelatedMarkets] Zooming map to', regionId, 'via title match');
      MapModule.focusRegion(regionId);
    }
  },

  closeModal() {
    const modal = document.getElementById('related-markets-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 200);
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// CSS
const relatedMarketsStyles = document.createElement('style');
relatedMarketsStyles.textContent = `
  .related-markets-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .related-markets-modal.visible {
    opacity: 1;
  }

  .related-markets-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .related-markets-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    gap: 8px;
  }

  .related-markets-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.5px;
  }

  .related-markets-topic {
    font-size: 9px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--accent);
    padding: 2px 6px;
    border-radius: 2px;
  }

  .related-markets-count {
    font-size: 10px;
    color: var(--text-dim);
  }

  .related-markets-close {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }

  .related-markets-close:hover {
    color: var(--text-bright);
  }

  .related-markets-source {
    padding: 10px 12px;
    font-size: 10px;
    color: var(--text-secondary);
    background: var(--bg-hover);
    border-bottom: 1px solid var(--border-color);
    font-style: italic;
    line-height: 1.4;
  }

  .related-markets-tags {
    padding: 6px 12px;
    font-size: 9px;
    color: var(--text-dim);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-family: var(--font-mono);
  }

  .related-markets-list {
    overflow-y: auto;
    max-height: 400px;
  }

  .related-markets-tag-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .tag-filter-btn {
    font-size: 9px;
    font-family: var(--font-mono);
    padding: 3px 8px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.15s;
  }

  .tag-filter-btn:hover {
    background: var(--bg-panel);
    color: var(--text-bright);
    border-color: var(--text-dim);
  }

  .tag-filter-btn.active {
    background: var(--accent);
    color: var(--bg-primary);
    border-color: var(--accent);
  }

  .related-markets-empty {
    padding: 30px;
    text-align: center;
    color: var(--text-dim);
    font-size: 11px;
  }

  .related-market-item {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.15s;
  }

  .related-market-item:hover {
    background: var(--bg-hover);
  }

  .related-market-item:last-child {
    border-bottom: none;
  }

  .related-market-main {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .related-market-num {
    font-size: 9px;
    color: var(--text-dim);
    min-width: 14px;
  }

  .related-market-title {
    font-size: 11px;
    color: var(--text-bright);
    flex: 1;
    line-height: 1.3;
  }

  .market-type-badge {
    font-size: 8px;
    font-weight: 600;
    color: var(--bg-primary);
    background: var(--accent);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .related-market-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 22px;
  }

  .related-market-prob {
    font-size: 12px;
    font-weight: 600;
    color: var(--positive);
  }

  .related-market-vol {
    font-size: 10px;
    color: var(--text-dim);
  }

  .related-markets-loading {
    padding: 40px 20px;
    text-align: center;
  }

  .related-markets-loading .loading {
    color: var(--accent);
    font-size: 11px;
  }
`;
document.head.appendChild(relatedMarketsStyles);
