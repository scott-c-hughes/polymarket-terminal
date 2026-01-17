// ============================================
// LOCATIONS DATABASE
// Comprehensive geographic lookup for dynamic map markers
// ============================================

const LOCATIONS = {
  // ==========================================
  // COUNTRIES
  // ==========================================

  // North America
  usa: {
    name: "USA",
    coords: [39.8283, -98.5795],
    zoom: 4,
    keywords: ["united states", "america", "american", "u.s.", "us government", "white house", "oval office"]
  },
  canada: {
    name: "Canada",
    coords: [56.1304, -106.3468],
    zoom: 4,
    keywords: ["canada", "canadian", "trudeau", "ottawa"]
  },
  mexico: {
    name: "Mexico",
    coords: [23.6345, -102.5528],
    zoom: 4,
    keywords: ["mexico", "mexican", "sheinbaum", "amlo", "cartel"]
  },

  // Central America & Caribbean
  panama: {
    name: "Panama",
    coords: [8.5380, -80.7821],
    zoom: 6,
    keywords: ["panama", "panama canal", "darien"]
  },
  cuba: {
    name: "Cuba",
    coords: [21.5218, -77.7812],
    zoom: 6,
    keywords: ["cuba", "cuban", "havana"]
  },

  // South America
  brazil: {
    name: "Brazil",
    coords: [-14.2350, -51.9253],
    zoom: 4,
    keywords: ["brazil", "brazilian", "lula", "bolsonaro", "brasilia"]
  },
  argentina: {
    name: "Argentina",
    coords: [-38.4161, -63.6167],
    zoom: 4,
    keywords: ["argentina", "argentine", "milei", "buenos aires"]
  },
  venezuela: {
    name: "Venezuela",
    coords: [6.4238, -66.5897],
    zoom: 5,
    keywords: ["venezuela", "venezuelan", "maduro", "caracas", "guaido"]
  },
  colombia: {
    name: "Colombia",
    coords: [4.5709, -74.2973],
    zoom: 5,
    keywords: ["colombia", "colombian", "bogota"]
  },
  chile: {
    name: "Chile",
    coords: [-35.6751, -71.5430],
    zoom: 4,
    keywords: ["chile", "chilean", "santiago"]
  },
  peru: {
    name: "Peru",
    coords: [-9.1900, -75.0152],
    zoom: 5,
    keywords: ["peru", "peruvian", "lima"]
  },
  ecuador: {
    name: "Ecuador",
    coords: [-1.8312, -78.1834],
    zoom: 6,
    keywords: ["ecuador", "ecuadorian", "quito"]
  },

  // Europe
  uk: {
    name: "United Kingdom",
    coords: [55.3781, -3.4360],
    zoom: 5,
    keywords: ["uk", "united kingdom", "britain", "british", "england", "london", "starmer", "sunak"]
  },
  france: {
    name: "France",
    coords: [46.2276, 2.2137],
    zoom: 5,
    keywords: ["france", "french", "macron", "paris", "le pen"]
  },
  germany: {
    name: "Germany",
    coords: [51.1657, 10.4515],
    zoom: 5,
    keywords: ["germany", "german", "berlin", "scholz", "merz", "bundestag"]
  },
  italy: {
    name: "Italy",
    coords: [41.8719, 12.5674],
    zoom: 5,
    keywords: ["italy", "italian", "rome", "meloni"]
  },
  spain: {
    name: "Spain",
    coords: [40.4637, -3.7492],
    zoom: 5,
    keywords: ["spain", "spanish", "madrid", "sanchez"]
  },
  poland: {
    name: "Poland",
    coords: [51.9194, 19.1451],
    zoom: 5,
    keywords: ["poland", "polish", "warsaw", "tusk"]
  },
  netherlands: {
    name: "Netherlands",
    coords: [52.1326, 5.2913],
    zoom: 6,
    keywords: ["netherlands", "dutch", "amsterdam", "wilders"]
  },
  belgium: {
    name: "Belgium",
    coords: [50.5039, 4.4699],
    zoom: 6,
    keywords: ["belgium", "belgian", "brussels"]
  },
  sweden: {
    name: "Sweden",
    coords: [60.1282, 18.6435],
    zoom: 5,
    keywords: ["sweden", "swedish", "stockholm"]
  },
  norway: {
    name: "Norway",
    coords: [60.4720, 8.4689],
    zoom: 5,
    keywords: ["norway", "norwegian", "oslo"]
  },
  finland: {
    name: "Finland",
    coords: [61.9241, 25.7482],
    zoom: 5,
    keywords: ["finland", "finnish", "helsinki"]
  },
  denmark: {
    name: "Denmark",
    coords: [56.2639, 9.5018],
    zoom: 6,
    keywords: ["denmark", "danish", "copenhagen"]
  },
  greenland: {
    name: "Greenland",
    coords: [71.7069, -42.6043],
    zoom: 3,
    keywords: ["greenland"]
  },
  switzerland: {
    name: "Switzerland",
    coords: [46.8182, 8.2275],
    zoom: 6,
    keywords: ["switzerland", "swiss", "zurich", "geneva"]
  },
  austria: {
    name: "Austria",
    coords: [47.5162, 14.5501],
    zoom: 6,
    keywords: ["austria", "austrian", "vienna"]
  },
  greece: {
    name: "Greece",
    coords: [39.0742, 21.8243],
    zoom: 6,
    keywords: ["greece", "greek", "athens"]
  },
  portugal: {
    name: "Portugal",
    coords: [39.3999, -8.2245],
    zoom: 6,
    keywords: ["portugal", "portuguese", "lisbon"]
  },
  ireland: {
    name: "Ireland",
    coords: [53.1424, -7.6921],
    zoom: 6,
    keywords: ["ireland", "irish", "dublin"]
  },

  // Eastern Europe
  ukraine: {
    name: "Ukraine",
    coords: [48.3794, 31.1656],
    zoom: 5,
    keywords: ["ukraine", "ukrainian", "kyiv", "kiev", "zelensky", "donbas", "crimea", "kharkiv", "odesa"]
  },
  russia: {
    name: "Russia",
    coords: [61.5240, 105.3188],
    zoom: 3,
    keywords: ["russia", "russian", "putin", "moscow", "kremlin"]
  },
  belarus: {
    name: "Belarus",
    coords: [53.7098, 27.9534],
    zoom: 6,
    keywords: ["belarus", "belarusian", "minsk", "lukashenko"]
  },
  moldova: {
    name: "Moldova",
    coords: [47.4116, 28.3699],
    zoom: 7,
    keywords: ["moldova", "moldovan", "chisinau", "transnistria"]
  },
  georgia: {
    name: "Georgia (Country)",
    coords: [42.3154, 43.3569],
    zoom: 6,
    keywords: ["tbilisi", "georgian government"]
  },
  romania: {
    name: "Romania",
    coords: [45.9432, 24.9668],
    zoom: 6,
    keywords: ["romania", "romanian", "bucharest"]
  },
  hungary: {
    name: "Hungary",
    coords: [47.1625, 19.5033],
    zoom: 6,
    keywords: ["hungary", "hungarian", "budapest", "orban"]
  },
  serbia: {
    name: "Serbia",
    coords: [44.0165, 21.0059],
    zoom: 6,
    keywords: ["serbia", "serbian", "belgrade", "vucic"]
  },
  slovakia: {
    name: "Slovakia",
    coords: [48.6690, 19.6990],
    zoom: 7,
    keywords: ["slovakia", "slovak", "bratislava", "fico"]
  },
  czechia: {
    name: "Czech Republic",
    coords: [49.8175, 15.4730],
    zoom: 7,
    keywords: ["czech", "czechia", "prague", "fiala"]
  },
  croatia: {
    name: "Croatia",
    coords: [45.1000, 15.2000],
    zoom: 7,
    keywords: ["croatia", "croatian", "zagreb"]
  },
  slovenia: {
    name: "Slovenia",
    coords: [46.1512, 14.9955],
    zoom: 8,
    keywords: ["slovenia", "slovenian", "ljubljana"]
  },
  bulgaria: {
    name: "Bulgaria",
    coords: [42.7339, 25.4858],
    zoom: 7,
    keywords: ["bulgaria", "bulgarian", "sofia"]
  },
  lithuania: {
    name: "Lithuania",
    coords: [55.1694, 23.8813],
    zoom: 7,
    keywords: ["lithuania", "lithuanian", "vilnius"]
  },
  latvia: {
    name: "Latvia",
    coords: [56.8796, 24.6032],
    zoom: 7,
    keywords: ["latvia", "latvian", "riga"]
  },
  estonia: {
    name: "Estonia",
    coords: [58.5953, 25.0136],
    zoom: 7,
    keywords: ["estonia", "estonian", "tallinn"]
  },

  // Middle East
  israel: {
    name: "Israel",
    coords: [31.0461, 34.8516],
    zoom: 7,
    keywords: ["israel", "israeli", "netanyahu", "idf", "tel aviv", "jerusalem"]
  },
  gaza: {
    name: "Gaza",
    coords: [31.3547, 34.3088],
    zoom: 9,
    keywords: ["gaza", "gazan", "hamas", "palestinian"]
  },
  westbank: {
    name: "West Bank",
    coords: [31.9466, 35.3027],
    zoom: 8,
    keywords: ["west bank", "ramallah"]
  },
  lebanon: {
    name: "Lebanon",
    coords: [33.8547, 35.8623],
    zoom: 7,
    keywords: ["lebanon", "lebanese", "beirut", "hezbollah"]
  },
  syria: {
    name: "Syria",
    coords: [34.8021, 38.9968],
    zoom: 6,
    keywords: ["syria", "syrian", "damascus", "assad", "hts", "idlib"]
  },
  iran: {
    name: "Iran",
    coords: [32.4279, 53.6880],
    zoom: 5,
    keywords: ["iran", "iranian", "tehran", "khamenei", "irgc", "persian"]
  },
  iraq: {
    name: "Iraq",
    coords: [33.2232, 43.6793],
    zoom: 5,
    keywords: ["iraq", "iraqi", "baghdad"]
  },
  turkey: {
    name: "Turkey",
    coords: [38.9637, 35.2433],
    zoom: 5,
    keywords: ["turkey", "turkish", "erdogan", "ankara", "istanbul"]
  },
  saudiarabia: {
    name: "Saudi Arabia",
    coords: [23.8859, 45.0792],
    zoom: 5,
    keywords: ["saudi", "saudi arabia", "mbs", "riyadh"]
  },
  uae: {
    name: "UAE",
    coords: [23.4241, 53.8478],
    zoom: 6,
    keywords: ["uae", "emirates", "dubai", "abu dhabi"]
  },
  qatar: {
    name: "Qatar",
    coords: [25.3548, 51.1839],
    zoom: 7,
    keywords: ["qatar", "qatari", "doha"]
  },
  yemen: {
    name: "Yemen",
    coords: [15.5527, 48.5164],
    zoom: 5,
    keywords: ["yemen", "yemeni", "houthi", "sanaa"]
  },
  jordan: {
    name: "Jordan",
    coords: [30.5852, 36.2384],
    zoom: 6,
    keywords: ["jordan", "jordanian", "amman"]
  },
  egypt: {
    name: "Egypt",
    coords: [26.8206, 30.8025],
    zoom: 5,
    keywords: ["egypt", "egyptian", "cairo", "sisi"]
  },

  // Asia
  china: {
    name: "China",
    coords: [35.8617, 104.1954],
    zoom: 4,
    keywords: ["china", "chinese", "beijing", "xi jinping", "prc"]
  },
  taiwan: {
    name: "Taiwan",
    coords: [23.6978, 120.9605],
    zoom: 6,
    keywords: ["taiwan", "taiwanese", "taipei"]
  },
  japan: {
    name: "Japan",
    coords: [36.2048, 138.2529],
    zoom: 5,
    keywords: ["japan", "japanese", "tokyo", "kishida"]
  },
  southkorea: {
    name: "South Korea",
    coords: [35.9078, 127.7669],
    zoom: 6,
    keywords: ["south korea", "korean", "seoul", "yoon"]
  },
  northkorea: {
    name: "North Korea",
    coords: [40.3399, 127.5101],
    zoom: 6,
    keywords: ["north korea", "dprk", "kim jong", "pyongyang"]
  },
  india: {
    name: "India",
    coords: [20.5937, 78.9629],
    zoom: 4,
    keywords: ["india", "indian", "modi", "delhi", "mumbai"]
  },
  pakistan: {
    name: "Pakistan",
    coords: [30.3753, 69.3451],
    zoom: 5,
    keywords: ["pakistan", "pakistani", "islamabad", "imran khan"]
  },
  afghanistan: {
    name: "Afghanistan",
    coords: [33.9391, 67.7100],
    zoom: 5,
    keywords: ["afghanistan", "afghan", "kabul", "taliban"]
  },
  bangladesh: {
    name: "Bangladesh",
    coords: [23.6850, 90.3563],
    zoom: 6,
    keywords: ["bangladesh", "bangladeshi", "dhaka"]
  },
  myanmar: {
    name: "Myanmar",
    coords: [21.9162, 95.9560],
    zoom: 5,
    keywords: ["myanmar", "burma", "burmese"]
  },
  thailand: {
    name: "Thailand",
    coords: [15.8700, 100.9925],
    zoom: 5,
    keywords: ["thailand", "thai", "bangkok"]
  },
  vietnam: {
    name: "Vietnam",
    coords: [14.0583, 108.2772],
    zoom: 5,
    keywords: ["vietnam", "vietnamese", "hanoi"]
  },
  philippines: {
    name: "Philippines",
    coords: [12.8797, 121.7740],
    zoom: 5,
    keywords: ["philippines", "filipino", "manila", "marcos"]
  },
  indonesia: {
    name: "Indonesia",
    coords: [-0.7893, 113.9213],
    zoom: 4,
    keywords: ["indonesia", "indonesian", "jakarta"]
  },
  malaysia: {
    name: "Malaysia",
    coords: [4.2105, 101.9758],
    zoom: 5,
    keywords: ["malaysia", "malaysian", "kuala lumpur"]
  },
  singapore: {
    name: "Singapore",
    coords: [1.3521, 103.8198],
    zoom: 10,
    keywords: ["singapore"]
  },

  // Africa
  southafrica: {
    name: "South Africa",
    coords: [-30.5595, 22.9375],
    zoom: 5,
    keywords: ["south africa", "johannesburg", "cape town", "ramaphosa"]
  },
  nigeria: {
    name: "Nigeria",
    coords: [9.0820, 8.6753],
    zoom: 5,
    keywords: ["nigeria", "nigerian", "lagos", "abuja"]
  },
  ethiopia: {
    name: "Ethiopia",
    coords: [9.1450, 40.4897],
    zoom: 5,
    keywords: ["ethiopia", "ethiopian", "addis ababa"]
  },
  kenya: {
    name: "Kenya",
    coords: [-0.0236, 37.9062],
    zoom: 5,
    keywords: ["kenya", "kenyan", "nairobi"]
  },
  sudan: {
    name: "Sudan",
    coords: [12.8628, 30.2176],
    zoom: 5,
    keywords: ["sudan", "sudanese", "khartoum"]
  },
  libya: {
    name: "Libya",
    coords: [26.3351, 17.2283],
    zoom: 5,
    keywords: ["libya", "libyan", "tripoli"]
  },
  algeria: {
    name: "Algeria",
    coords: [28.0339, 1.6596],
    zoom: 5,
    keywords: ["algeria", "algerian", "algiers"]
  },
  morocco: {
    name: "Morocco",
    coords: [31.7917, -7.0926],
    zoom: 5,
    keywords: ["morocco", "moroccan", "rabat"]
  },
  tunisia: {
    name: "Tunisia",
    coords: [33.8869, 9.5375],
    zoom: 6,
    keywords: ["tunisia", "tunisian", "tunis"]
  },

  // Oceania
  australia: {
    name: "Australia",
    coords: [-25.2744, 133.7751],
    zoom: 4,
    keywords: ["australia", "australian", "sydney", "melbourne", "canberra"]
  },
  newzealand: {
    name: "New Zealand",
    coords: [-40.9006, 174.8860],
    zoom: 5,
    keywords: ["new zealand", "auckland", "wellington"]
  },

  // ==========================================
  // US STATES
  // ==========================================

  california: {
    name: "California",
    coords: [36.7783, -119.4179],
    zoom: 5,
    keywords: ["california", "los angeles", "san francisco", "newsom", "la "]
  },
  texas: {
    name: "Texas",
    coords: [31.9686, -99.9018],
    zoom: 5,
    keywords: ["texas", "houston", "dallas", "abbott", "austin texas"]
  },
  florida: {
    name: "Florida",
    coords: [27.6648, -81.5158],
    zoom: 5,
    keywords: ["florida", "miami", "desantis", "tampa", "orlando"]
  },
  newyork: {
    name: "New York",
    coords: [42.1657, -74.9481],
    zoom: 6,
    keywords: ["new york state", "albany ny", "hochul"]
  },
  pennsylvania: {
    name: "Pennsylvania",
    coords: [41.2033, -77.1945],
    zoom: 6,
    keywords: ["pennsylvania", "philadelphia", "pittsburgh", "shapiro"]
  },
  ohio: {
    name: "Ohio",
    coords: [40.4173, -82.9071],
    zoom: 6,
    keywords: ["ohio", "columbus ohio", "cleveland", "cincinnati"]
  },
  michigan: {
    name: "Michigan",
    coords: [44.3148, -85.6024],
    zoom: 5,
    keywords: ["michigan", "detroit", "whitmer"]
  },
  georgia_us: {
    name: "Georgia (US)",
    coords: [32.1656, -82.9001],
    zoom: 6,
    keywords: ["georgia election", "atlanta", "kemp"]
  },
  arizona: {
    name: "Arizona",
    coords: [34.0489, -111.0937],
    zoom: 5,
    keywords: ["arizona", "phoenix", "maricopa"]
  },
  minnesota: {
    name: "Minnesota",
    coords: [46.7296, -94.6859],
    zoom: 6,
    keywords: ["minnesota", "minneapolis", "st paul", "twin cities", "walz"]
  },
  wisconsin: {
    name: "Wisconsin",
    coords: [43.7844, -88.7879],
    zoom: 6,
    keywords: ["wisconsin", "milwaukee", "madison wisconsin"]
  },
  nevada: {
    name: "Nevada",
    coords: [38.8026, -116.4194],
    zoom: 5,
    keywords: ["nevada", "las vegas", "reno"]
  },
  northcarolina: {
    name: "North Carolina",
    coords: [35.7596, -79.0193],
    zoom: 6,
    keywords: ["north carolina", "charlotte nc", "raleigh"]
  },
  colorado: {
    name: "Colorado",
    coords: [39.5501, -105.7821],
    zoom: 5,
    keywords: ["colorado", "denver"]
  },
  illinois: {
    name: "Illinois",
    coords: [40.6331, -89.3985],
    zoom: 6,
    keywords: ["illinois", "chicago", "springfield il"]
  },
  washingtonstate: {
    name: "Washington State",
    coords: [47.7511, -120.7401],
    zoom: 6,
    keywords: ["washington state", "seattle", "olympia washington"]
  },
  oregon: {
    name: "Oregon",
    coords: [43.8041, -120.5542],
    zoom: 5,
    keywords: ["oregon", "portland oregon", "salem oregon"]
  },
  virginia: {
    name: "Virginia",
    coords: [37.4316, -78.6569],
    zoom: 6,
    keywords: ["virginia", "richmond virginia", "youngkin"]
  },
  massachusetts: {
    name: "Massachusetts",
    coords: [42.4072, -71.3824],
    zoom: 6,
    keywords: ["massachusetts", "boston"]
  },
  newjersey: {
    name: "New Jersey",
    coords: [40.0583, -74.4057],
    zoom: 6,
    keywords: ["new jersey", "newark nj", "trenton"]
  },

  // ==========================================
  // MAJOR CITIES (international)
  // ==========================================

  nyc: {
    name: "New York City",
    coords: [40.7128, -74.0060],
    zoom: 10,
    keywords: ["new york city", "nyc", "manhattan", "brooklyn", "wall street"]
  },
  washingtondc: {
    name: "Washington DC",
    coords: [38.9072, -77.0369],
    zoom: 10,
    keywords: ["washington dc", "capitol hill", "congress", "senate", "house of representatives", "pentagon"]
  },
  hongkong: {
    name: "Hong Kong",
    coords: [22.3193, 114.1694],
    zoom: 10,
    keywords: ["hong kong"]
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.LOCATIONS = LOCATIONS;
}
