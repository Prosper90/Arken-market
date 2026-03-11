// const cron = require("node-cron");
// const Polymarket = require("./models/polymarket");
// const API_URL = process.env.POLYMARKET_URL;

// const CRYPTO_MAP = {
//   BTC: ["bitcoin", "btc"],
//   ETH: ["ethereum", "eth"],
//   SOL: ["solana", "sol"],
//   DOGE: ["dogecoin", "doge"],
//   SHIB: ["shiba", "shib"],
//   XRP: ["xrp", "ripple"],
//   ADA: ["cardano", "ada"],
//   BNB: ["bnb", "binance"],
//   MATIC: ["matic", "polygon"],
//   AVAX: ["avax"],
//   LINK: ["chainlink", "link"],
//   DOT: ["polkadot", "dot"],
//   ARB: ["arbitrum", "arb"],
//   OP: ["optimism", "op"],
//   LTC: ["litecoin", "ltc"],
//   UNI: ["uniswap", "uni"],
// };

// function detectCurrency(market) {
//   const text =
//     (market.title || "") + " " +
//     (market.description || "") + " " +
//     (market.events?.map(e => e.title).join(" ") || "") + " " +
//     (market.tags?.join(" ") || "");

//   const lowerText = text.toLowerCase();

//   for (const [symbol, keywords] of Object.entries(CRYPTO_MAP)) {
//     for (const keyword of keywords) {
//       const regex = new RegExp(`\\b${keyword}\\b`, "i");
//       if (regex.test(lowerText)) {
//         return symbol;
//       }
//     }
//   }
//   return null;
// }

// const CRYPTO_KEYWORDS = [
//   "crypto","bitcoin","btc","eth","ethereum","sol","solana","doge",
//   "dogecoin","shib","shiba","xrp","ripple","ada","cardano","bnb",
//   "binance","matic","polygon","avax","chainlink","link","dot",
//   "polkadot","arb","arbitrum","op","optimism","ltc","litecoin",
//   "uni","uniswap"
// ];

// const cryptoRegex = new RegExp(`\\b(${CRYPTO_KEYWORDS.join("|")})\\b`, "i");

// function isCrypto(market) {
//   const text =
//     (market.title || "") + " " +
//     (market.description || "") + " " +
//     (market.events?.map(e => e.title).join(" ") || "") + " " +
//     (market.tags?.join(" ") || "");

//   return cryptoRegex.test(text.toLowerCase());
// }

// async function getPolyMarketsDetailsHandler(data) {
//   try {
//     const queryData = data.query || {};
//     queryData.active = true;
//     queryData.closed = false;
//     queryData.limit = queryData.limit || 75;
//     queryData.order = "id";
//     queryData.ascending = false;

//     const url = new URL(API_URL + "/markets");
//     for (const key in queryData) url.searchParams.append(key, queryData[key]);

//     const response = await fetch(url.toString());
//     if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

//     const json = await response.json();

//     const cryptoMarkets = json.filter(isCrypto);
//     const nonCryptoMarkets = json.filter(m => !isCrypto(m)).slice(0, 10);

//     const finalList = [...cryptoMarkets, ...nonCryptoMarkets];

//     const finalData = finalList.map((item) => {
//       const yesPool = item.yesPool || item.outcomes?.[0]?.totalAmount || 0;
//       const noPool = item.noPool || item.outcomes?.[1]?.totalAmount || 0;
//       const totalPool = yesPool + noPool;

//       const now = new Date();
//       const endDate = new Date(item.endDate);
//       const timeLeftSeconds = Math.max(0, Math.floor((endDate - now) / 1000));

//       let buyYES, sellYES, buyNO, sellNO;
//       if (item.outcomePrices && Array.isArray(item.outcomePrices)) {
//         let op = item.outcomePrices;
//         if (typeof op[0] === "string") {
//           try { op = JSON.parse(op[0]); } catch {}
//         }
//         buyYES = sellYES = (op[0] * 100).toFixed(2);
//         buyNO = sellNO = (op[1] * 100).toFixed(2);
//       } else {
//         buyYES = (item.bestAsk * 100 || 0).toFixed(2);
//         sellYES = (item.bestBid * 100 || 0).toFixed(2);
//         buyNO = (100 - (item.bestBid * 100 || 0)).toFixed(2);
//         sellNO = (100 - (item.bestAsk * 100 || 0)).toFixed(2);
//       }

//       let outcomes = item.outcomes || [];
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try { outcomes = JSON.parse(outcomes[0]); } catch {}
//       }

//       if (!item.liquidity || item.liquidity <= 0) return null;

//       const currency = detectCurrency(item);

//       return {
//         specifyId: item.id,
//         question: item.question || item.title,
//         description: item.description || "",
//         tags: item.tags || [],
//         category: currency ? "Crypto" : "Other",
//         currency,
//         startDate: item.startDate,
//         image: item.image,
//         endDate: item.endDate,
//         timeLeftSeconds,
//         totalPool,
//         yesPool,
//         noPool,
//         yesOdds: totalPool ? ((yesPool / totalPool) * 100).toFixed(2) : "0",
//         noOdds: totalPool ? ((noPool / totalPool) * 100).toFixed(2) : "0",
//         liquidity: item.liquidity,
//         totalLiquidity: item.totalLiquidity,
//         totalVolume: item.totalVolume,
//         minimumLiquidity: item.minimumLiquidity,
//         estimatedNetworkFee: item.estimatedNetworkFee,
//         totalDeduction: item.totalDeduction,
//         clobTokenIds: item.clobTokenIds,
//         bestBid: item.bestBid || 0,
//         bestAsk: item.bestAsk || 0,
//         outcomes,
//         outcomePrices: item.outcomePrices,
//         buyYES,
//         sellYES,
//         buyNO,
//         sellNO,
//         participants: item.participants || 0,
//         active: item.active,
//         closed: item.closed,
//         archived: item.archived,
//         resolution: item.resolution || "",
//         umaResolutionStatus: item.umaResolutionStatus || "",
//         umaResolutionStatuses: item.umaResolutionStatuses || [],
//         conditionId: item.conditionId,
//         slug: item.slug,
//         groupItemTitle: item.groupItemTitle,
//         acceptingOrders: item.acceptingOrders,
//         events: item.events || [],
//       };
//     }).filter(Boolean);

//     return { success: true, data: finalData };
//   } catch (error) {
//     console.error("Error fetching PolyMarkets:", error);
//     return { success: false, error: error.message };
//   }
// }

// // cron.schedule("*/60 * * * *", async () => {
//   cron.schedule("0 0 * * *", async () => {
// // cron.schedule("*/5 * * * * *", async () => {
//   console.log("Fetching Polymarket…", new Date().toLocaleString());

//   try {
//     await Polymarket.deleteMany({ endDate: { $lt: new Date() } });

//     await Polymarket.deleteMany({ closed: true });

//     const currentCount = await Polymarket.countDocuments();
//     const remaining = 75 - currentCount;

//     const result = await getPolyMarketsDetailsHandler({ query: {} });


//     if (result.success && remaining > 0) {
//       const markets = result.data.slice(0, remaining);

//     for (const market of markets) {
//   let tokenIds = market.clobTokenIds;
//   let outcomes = market.outcomes;

//   if (typeof tokenIds === "string") {
//     try { tokenIds = JSON.parse(tokenIds); } catch {}
//   }

//   if (typeof outcomes === "string") {
//     try { outcomes = JSON.parse(outcomes); } catch {}
//   }

//   if (Array.isArray(tokenIds) && Array.isArray(outcomes)) {
//     market.outcomeTokenIds = {};
//     for (let i = 0; i < outcomes.length; i++) {
//       if (outcomes[i] && tokenIds[i]) {
//         market.outcomeTokenIds[outcomes[i]] = tokenIds[i];
//       }
//     }
//   }

//   await Polymarket.updateOne(
//     { specifyId: market.specifyId },
//     { $set: market },
//     { upsert: true }
//   );
// }
//       console.log(`Inserted/updated ${markets.length} markets`);
//     }
//   } catch (error) {
//     console.error("Cron error:", error);
//   }
// });


const cron = require("node-cron");
const Polymarket = require("./models/polymarket");
const API_URL = process.env.POLYMARKET_URL;

const CRYPTO_MAP = {
  BTC: ["bitcoin", "btc", "satoshi", "btc price", "bitcoin price"],
  ETH: ["ethereum", "eth", "eth 2.0", "ethereum price", "ether"],
  SOL: ["solana", "sol", "sol price"],
  DOGE: ["dogecoin", "doge", "doge price"],
  SHIB: ["shiba", "shib", "shiba inu"],
  XRP: ["xrp", "ripple", "ripple coin", "xrp price"],
  ADA: ["cardano", "ada", "ada price", "cardano ada"],
  BNB: ["bnb", "binance", "binance coin", "bnb price"],
  MATIC: ["matic", "polygon", "polygon matic", "matic price"],
  AVAX: ["avax", "avalanche", "avax price"],
  LINK: ["chainlink", "link", "chainlink link", "link price"],
  DOT: ["polkadot", "dot", "polkadot dot", "dot price"],
  ARB: ["arbitrum", "arb", "arbitrum token", "arb price"],
  OP: ["optimism", "op", "optimism token", "op price"],
  LTC: ["litecoin", "ltc", "litecoin ltc", "ltc price"],
  UNI: ["uniswap", "uni", "uniswap uni", "uni price"],
  AAVE: ["aave", "aave token", "aave price"],
  SOLANA: ["solana", "sol", "solana price"], 
  // CRO: ["crypto.com coin", "cro", "crypto.com token", "cro price"],
  // FTM: ["fantom", "ftm", "fantom ftm", "ftm price"],
  // AVA: ["avalanche", "ava", "ava price"],
  // MANA: ["decentraland", "mana", "mana price"],
  // SAND: ["sandbox", "sand", "sandbox token", "sand price"],
  // FLOW: ["flow", "flow token", "flow price"],
  // LDO: ["lido", "ldo", "lido token", "ldo price"],
  // GRT: ["the graph", "grt", "graph token", "grt price"],
  // CEL: ["celcius", "cel", "celcius token", "cel price"],
  // CRV: ["curve", "crv", "curve token", "crv price"],
  // ICP: ["internet computer", "icp", "internet computer icp", "icp price"],
  // FIL: ["filecoin", "fil", "filecoin fil", "fil price"],
  // NEAR: ["near protocol", "near", "near token", "near price"],
  // THETA: ["theta", "theta token", "theta price"],
  // APT: ["aptos", "apt", "aptos apt", "apt price"],
  // AR: ["arweave", "ar", "arweave ar", "ar price"],
  // EOS: ["eos", "eos token", "eos price"],
  // HBAR: ["hedera", "hbar", "hedera hashgraph", "hbar price"],
  // QTUM: ["qtum", "qtum token", "qtum price"],
  // STX: ["stacks", "stx", "stacks stx", "stx price"],
};

const SPORTS_KEYWORDS = [
  "match","vs","game","goal","score","league","cup",
  "football","soccer","cricket","tennis","nba","nfl",
  "fifa","uefa","mlb","nhl","premier league","la liga","serie a","bundesliga",
  "champions league","world cup","olympics","winter olympics",
  "paralympics","grand slam","wimbledon","roland garros",
  "us open","australian open","super bowl","nba finals","nfl playoffs",
  "world series","stanley cup","f1","formula 1","nascar","indycar",
  "rugby","rugby world cup","cricket world cup","icc","esports",
  "dota","league of legends","valorant","csgo","mls","ncaaf","ncaab",
  "boxing","ufc","mma","wrestling","tour de france","golf","pga","masters",
  "us open golf","ryder cup","soccer cup","concacaf","afc","caf","uefa euro"
];


const POLITICS_KEYWORDS = [
  "biden","trump","epstein","venezuela","midterms","primaries",
  "minnesota unrest","us election","trade war","congress","global elections",
  "nyc mayor","ukraine","mayoral elections","courts","gaza","israel",
  "cabinet","senate","legislative election","ceasefire","leader out of power",
  "supreme leader","president","prime minister","next election","funding bill",
  "government","policy","impeachment","legislation","campaign","ballot",
  "referendum","gop","democrat","white house","covid","coronavirus","pandemic"
];

const GEOPOLITICS_KEYWORDS = [
  "china", "russia", "ukraine", "israel", "iran", "gaza", "palestine",
  "usa", "united states", "europe", "eu", "nato", "un", "united nations",
  "war", "conflict", "military", "invasion", "occupation", "strikes",
  "ceasefire", "peace deal", "border", "missile", "nuclear", "weapons",
  "drone", "attack", "bombing", "offensive", "defense",
  "taiwan", "north korea", "south korea", "south china sea",
  "venezuela", "sudan", "syria", "yemen", "lebanon", "hezbollah",
  "hamas", "west bank", "middle east", "balkans", "kashmir",
  "somalia", "ethiopia","afghanistan","iraq",
  "sanctions","embargo","diplomacy","treaty","alliance",
  "territorial","sovereignty","regime","coup",
  "brics","g7","g20","opec","asean","african union",
  "oil","gas","pipeline","trade war",
  "cyber attack","espionage"
];

const WORLD_EVENTS_KEYWORDS = [
  "election","president","prime minister","referendum","vote","campaign",
  "government","coup","resignation","impeachment","transition",
  "protest","demonstration","summit","treaty","agreement",
  "ceasefire","truce","peace talks","negotiation","diplomacy",
  "crisis","emergency","collapse","instability","unrest",
  "sanctions","embargo","blockade",
  "invasion","invade","military","strike","airstrike","missile",
  "war","conflict","occupation","troops","offensive","defensive",
  "nuclear","weapon","weapons","missile test","uranium",
  "supreme leader","regime","overthrow",
  "immigration","refugee","asylum","border",
  "climate","environment","pandemic","covid","variant","outbreak",
  "healthcare","education","strike",
  "human rights","civil rights","freedom","censorship",
  "china","taiwan","gaza","israel","iran","ukraine","russia",
  "venezuela","yemen","south korea","north korea","japan",
  "india","pakistan","middle east","europe","netherlands","france","canada",
  "nobel","nobel peace prize","olympics","winter olympics",
  "mayoral","parliament","senate","congress",
  "strait of hormuz","shipping","oil","energy","trade route"
];

const TECHNOLOGY_KEYWORDS = [
  "ai","artificial intelligence","machine learning","model","llm","benchmark",
  "best ai model","top ai model","frontier model","style control",
  "openai","chatgpt","gpt","gemini","claude","anthropic","xai","grok",
  "deepseek","mistral","moonshot","z.ai","baidu","alibaba","meituan",
  "google","alphabet","apple","microsoft","meta","amazon","nvidia","tesla",
  "oracle","microstrategy","big tech",
  "elon musk","spacex","starlink","tesla fsd","full self driving",
  "spacex ipo","spacex ticker","mars","rocket","launch",
  "app store","apple app store","ios","android",
  "free app","#1 free app","#2 free app",
  "tiktok","threads","capcut","temu","paramount+",
  "google play","mobile app",
  "ipo","ipos","valuation","market cap",
  "kraken ipo","discord ipo","anthropic ipo","openai ipo",
  "databricks","cerebras","anduril","rippling","celonis","deel",
  "gpu","chip","chips","semiconductor","nvda","data center","datacenter",
  "science","fda","drug","approval","clinical trial",
  "retatrutide","biotech","pharma","medicine",
  "prediction market","prediction markets",
  "all-in podcast","podcast",
  "youtube","twitter","x (twitter)","x.com",
  "robot","robotics","autonomous","self driving",
  "quantum","quantum computing","supercomputer"
];

const FINANCE_KEYWORDS = [
  "stock","stocks","equity","etf","bond","bonds","treasury",
  "s&p","nasdaq","dow","index","indices",
  "interest rate","rates","yield","inflation","cpi","ppi",
  "recession","gdp","economy","economic",
  "earnings","revenue","profit","guidance",
  "dividend","buyback","bank","banks","banking",
  "fed","federal reserve","ecb","central bank",
  "commodities","gold","silver","oil","brent","wti",
  "forex","currency","usd","dollar","euro","yen","yuan",
  "rate cut","rate hike"
];

const POPCULTURE_KEYWORDS = [
  "song","spotify","apple music","billboard",
  "grammys","grammy","best new artist",
  "album","single","music","artist",
  "taylor swift","harry styles","bruno mars","kanye","ye",
  "olivia dean","lil uzi","drake","beyonce","rihanna",
  "movie","movies","film","box office",
  "oscars","oscar","academy awards","bafta",
  "avatar","marvel","dc","disney","netflix","hbo",
  "paramount","amazon prime","apple tv",
  "tv show","series","season",
  "youtube","youtuber","mrbeast","creator",
  "celebrity","celebrities","famous",
  "actor","actress","singer","rapper",
  "reality tv","survivor","big brother","love island","bachelor",
  "gta","gta vi","grand theft auto",
  "steam","steam machine","valve",
  "awards","red carpet","nominee","winner",
  "court","trial","lawsuit",
  "tweet","tweets","twitter mention","viral",
  "most popular name","baby name",
  "tiktok trend","trend","trending"
];

const CLIMATE_SCIENCE_KEYWORDS = [
  "climate","weather","space","earthquake","hurricane","global temp",
  "pandemic","measles","natural disaster","volcano","tsunami","meteor","fda",
  "environment","coronavirus","outbreak","science","spaceX","astronomy","nuclear",
  "100kt meteor","1 megaton meteor","meteor strike","asteroid","asteroid impact",
  "spaceX starship","spaceX ipo","bill ackman","spar company",
  "category 4 hurricane","category 5 hurricane","hurricane landfall",
  "cdc level 3 warning","cdc level 4 warning","cdc alert","disease outbreak",
  "pandemic 2026","avian flu","ebola","zika","health emergency","epidemic",
  "earthquake 9.0","tsunami warning","flood","drought","heatwave","wildfire",
  "glacier melt","sea level rise","global warming","ozone","climate change",
  "solar flare","space mission","mars","moon","satellite","astronaut",
  "supervolcano","radiation","nuclear test","radiation leak","scientific study",
  "space telescope","nobel prize science","astronomy discovery","planet","comet",
  "black hole","extraterrestrial","exoplanet","climate report","ipcc","environmental policy"
];
const ECONOMY_KEYWORDS = [
  "trade war","fed rate","inflation","macro indicators","gdp",
  "global rates","taxes","treasuries","tsa","housing","bitcoin",
  "largest company","reserve bank","median home value","fed chairman",
  "us gdp","elon musk net worth","tesla xai merger",
  "unemployment rate","cpi release","s&p 500","sp 500","dow jones","nasdaq",
  "q1 performance","q2 performance","q3 performance","q4 performance",
  "china gdp","china annual gdp","tsa passengers","bank failure",
  "10-year treasury yield","bank of canada","bank of india","fed decisions",
  "fed rate cut","mortgage rate","30-year mortgage","price of eggs",
  "core inflation","headline inflation","us treasury","interest rate",
  "yield","bond","etf","equity","commodity","gold","silver","oil","brent",
  "wti","usd","dollar","euro","yen","yuan","market cap","ipo","valuation",
  "corporate earnings","revenue","profit","dividend","buyback","fed pause",
  "fed hike","fed cut","inflation target","gdp growth","economic growth",
  "housing price","median home price","consumer confidence","business confidence",
  "federal reserve","ecb","central bank","fiscal policy","monetary policy",
  "recession","deflation","stagflation","economic downturn","financial crisis"
];


const SPORTS_SUBCATEGORIES = {
  Football: ["football","soccer","premier league","la liga","serie a","bundesliga","champions league","uefa","fifa","mls"],
  Cricket: ["cricket","icc","ipl","cricket world cup"],
  Basketball: ["nba","nba finals","ncaab"],
  AmericanFootball: ["nfl","super bowl","ncaaf"],
  Tennis: ["tennis","wimbledon","roland garros","us open","australian open","grand slam"],
  Motorsports: ["f1","formula 1","nascar","indycar"],
  Hockey: ["nhl","stanley cup"],
  Esports: ["esports","dota","league of legends","valorant","csgo"],
  BoxingMMA: ["boxing","ufc","mma","wrestling"],
  Golf: ["golf","pga","masters","ryder cup"],
  Rugby: ["rugby","rugby world cup"]
};

const POLITICS_SUBCATEGORIES = {
  USElections: ["us election","biden","trump","midterms","primaries"],
  WarConflict: ["gaza","israel","ukraine","russia","war","ceasefire"],
  Government: ["congress","senate","white house","cabinet","government"],
};

const FINANCE_SUBCATEGORIES = {
  Stocks: ["stock","stocks","nasdaq","dow","s&p","sp 500"],
  Rates: ["interest rate","rate hike","rate cut","yield","treasury"],
  Commodities: ["gold","silver","oil","brent","wti"],
  Forex: ["usd","dollar","euro","yen","yuan"]
};


const TECHNOLOGY_SUBCATEGORIES = {
  AI: [
    "ai","artificial intelligence","machine learning","llm","gpt","chatgpt",
    "gemini","claude","anthropic","xai","grok","deepseek","mistral","moonshot"
  ],
  BigTech: [
    "google","alphabet","apple","microsoft","meta","amazon","nvidia","tesla",
    "oracle","baidu","alibaba","meituan","big tech"
  ],
  Space: [
    "spacex","starlink","mars","rocket","launch","space mission",
    "spacex ipo","spacex ticker","moon","satellite","astronaut"
  ],
  MobileApps: [
    "app store","apple app store","google play","ios","android",
    "tiktok","threads","capcut","temu","paramount+","mobile app"
  ],
  IPOs: [
    "ipo","ipos","kraken ipo","discord ipo","anthropic ipo","openai ipo",
    "valuation","market cap"
  ],
  Semiconductors: [
    "gpu","chip","chips","semiconductor","nvda","data center","datacenter",
    "supercomputer"
  ],
  Biotech: [
    "fda","drug","approval","clinical trial","biotech","pharma",
    "medicine","retatrutide"
  ],
  Robotics: [
    "robot","robotics","autonomous","self driving","full self driving","tesla fsd"
  ],
  Quantum: [
    "quantum","quantum computing"
  ],
  SocialMedia: [
    "youtube","twitter","x (twitter)","x.com","podcast","all-in podcast"
  ]
};


const WORLD_EVENTS_SUBCATEGORIES = {
  Elections: [
    "election","vote","referendum","campaign","president","prime minister",
    "mayoral","parliament","senate","congress"
  ],
  WarConflict: [
    "war","conflict","invasion","airstrike","missile","military",
    "occupation","troops","offensive","defensive","ceasefire"
  ],
  Diplomacy: [
    "summit","treaty","agreement","peace talks","negotiation","diplomacy"
  ],
  Protests: [
    "protest","demonstration","unrest"
  ],
  Sanctions: [
    "sanctions","embargo","blockade"
  ],
  Health: [
    "pandemic","covid","variant","outbreak","healthcare"
  ],
  ClimateEnergy: [
    "climate","environment","oil","energy","trade route","shipping"
  ],
  HumanRights: [
    "human rights","civil rights","freedom","censorship","asylum","refugee"
  ],
  Awards: [
    "nobel","nobel peace prize","olympics","winter olympics"
  ]
};


const GEOPOLITICS_SUBCATEGORIES = {
  MiddleEast: [
    "israel","gaza","palestine","iran","lebanon","hezbollah",
    "hamas","west bank","yemen","syria","middle east"
  ],
  Europe: [
    "russia","ukraine","eu","europe","nato","balkans"
  ],
  AsiaPacific: [
    "china","taiwan","north korea","south korea","south china sea",
    "asean","japan"
  ],
  Americas: [
    "usa","united states","venezuela"
  ],
  Africa: [
    "sudan","somalia","ethiopia","african union"
  ],
  WarSecurity: [
    "war","military","invasion","missile","nuclear","weapons",
    "drone","attack","bombing"
  ],
  SanctionsDiplomacy: [
    "sanctions","embargo","treaty","alliance","diplomacy"
  ],
  Energy: [
    "oil","gas","pipeline","opec"
  ],
  Cyber: [
    "cyber attack","espionage"
  ]
};


const POPCULTURE_SUBCATEGORIES = {
  Music: [
    "song","album","artist","spotify","apple music",
    "grammys","billboard","singer","rapper"
  ],
  Movies: [
    "movie","movies","film","box office","oscars",
    "academy awards","bafta","marvel","dc","disney"
  ],
  TVShows: [
    "tv show","series","season","netflix","hbo",
    "paramount","amazon prime","apple tv"
  ],
  Celebrities: [
    "celebrity","celebrities","actor","actress","famous"
  ],
  Gaming: [
    "gta","gta vi","grand theft auto","steam","valve"
  ],
  SocialMedia: [
    "youtube","youtuber","mrbeast","tiktok","trend","viral","trending"
  ],
  Awards: [
    "awards","red carpet","nominee","winner"
  ],
  Legal: [
    "court","trial","lawsuit"
  ]
};


const CLIMATE_SCIENCE_SUBCATEGORIES = {
  NaturalDisasters: [
    "earthquake","hurricane","tsunami","volcano","wildfire",
    "flood","drought","heatwave"
  ],
  ClimateChange: [
    "climate","climate change","global warming","sea level rise",
    "glacier melt","ozone","environment"
  ],
  Space: [
    "asteroid","meteor","space","mars","moon","satellite",
    "astronaut","space telescope","astronomy","exoplanet","comet"
  ],
  Pandemics: [
    "pandemic","outbreak","avian flu","ebola","zika",
    "health emergency","epidemic","measles"
  ],
  Nuclear: [
    "nuclear","nuclear test","radiation","radiation leak","supervolcano"
  ],
  Weather: [
    "weather","solar flare","hurricane landfall"
  ],
  ScienceResearch: [
    "scientific study","climate report","ipcc","astronomy discovery",
    "nobel prize science"
  ]
};


const ECONOMY_SUBCATEGORIES = {
  Inflation: [
    "inflation","cpi","core inflation","headline inflation","fed rate"
  ],
  GDPGrowth: [
    "gdp","gdp growth","economic growth","china gdp","us gdp"
  ],
  Housing: [
    "housing","mortgage","median home price","housing price"
  ],
  Employment: [
    "unemployment rate","jobs","labor"
  ],
  Banking: [
    "bank failure","central bank","federal reserve",
    "bank of india","bank of canada"
  ],
  Markets: [
    "s&p 500","nasdaq","dow jones","market cap","equity","etf"
  ],
  Rates: [
    "interest rate","yield","treasuries","10-year treasury yield"
  ],
  Corporate: [
    "corporate earnings","revenue","profit","dividend","buyback"
  ],
  Recession: [
    "recession","deflation","stagflation","economic downturn","financial crisis"
  ]
};

function detectSubcategory(market, map) {
  const text = buildText(market);
  for (const [sub, keywords] of Object.entries(map)) {
    if (keywords.some(k => new RegExp(`\\b${k}\\b`, "i").test(text))) {
      return sub;
    }
  }
  return null;
}


function buildText(market) {
  return [
    market.title || "",
    market.question || "",
    market.description || "",
    ...(market.events?.map(e => e.title) || []),
    ...(market.tags || [])
  ].join(" ").toLowerCase();
}

function detectCurrency(market) {
  const text = buildText(market);
  for (const [symbol, keywords] of Object.entries(CRYPTO_MAP)) {
    for (const k of keywords) {
      if (new RegExp(`\\b${k}\\b`, "i").test(text)) return symbol;
    }
  }
  return null;
}

const matchKeywords = (text, list) =>
  list.some(k => new RegExp(`\\b${k}\\b`, "i").test(text));

const isSports = m => matchKeywords(buildText(m), SPORTS_KEYWORDS);
const isPolitics = m => matchKeywords(buildText(m), POLITICS_KEYWORDS);
const isGeopolitics = m => matchKeywords(buildText(m), GEOPOLITICS_KEYWORDS);
const isWorldEvents = m => matchKeywords(buildText(m), WORLD_EVENTS_KEYWORDS);
const isTechnology = m => matchKeywords(buildText(m), TECHNOLOGY_KEYWORDS);
const isFinance = m => matchKeywords(buildText(m), FINANCE_KEYWORDS);
const isPopCulture = m => matchKeywords(buildText(m), POPCULTURE_KEYWORDS);
const isClimateAndScience = m => matchKeywords(buildText(m), CLIMATE_SCIENCE_KEYWORDS);
const isEconomy = m => matchKeywords(buildText(m), ECONOMY_KEYWORDS);

async function getPolyMarketsDetailsHandler(data) {
  try {
    const queryData = data.query || {};
    queryData.active = true;
    queryData.closed = false;
    queryData.limit = 1000;
    queryData.order = "id";

    let allMarkets = [];
    let page = 0;


      queryData.ascending = false;
    while (true) {
      queryData.offset = page * queryData.limit;
      const url = new URL(API_URL + "/markets");
      for (const k in queryData) url.searchParams.append(k, queryData[k]);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      if (!json.length) break;
      allMarkets.push(...json);
      if (json.length < queryData.limit) break;
      page++;
    }

    page = 0;
    queryData.ascending = true;
    while (true) {
      queryData.offset = page * queryData.limit;
      const url = new URL(API_URL + "/markets");
      for (const k in queryData) url.searchParams.append(k, queryData[k]);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      if (!json.length) break;
      allMarkets.push(...json);
      if (json.length < queryData.limit) break;
      page++;
    }

    console.log(allMarkets.length, "Total markets fetched");

    const finalData = allMarkets.map(item => {
      if (!item.liquidity || item.liquidity <= 0) return null;

      const currency = detectCurrency(item);
      let category = "Other";
      let subcategory = null;


      if (currency) {
  category = "Crypto";
}
else if (isSports(item)) {
  category = "Sports";
  subcategory = detectSubcategory(item, SPORTS_SUBCATEGORIES);
}
else if (isPolitics(item)) {
  category = "Politics";
  subcategory = detectSubcategory(item, POLITICS_SUBCATEGORIES);
}
else if (isGeopolitics(item)) {
  category = "Geopolitics";
   subcategory = detectSubcategory(item, GEOPOLITICS_SUBCATEGORIES);
}
else if (isFinance(item)) {
  category = "Finance";
  subcategory = detectSubcategory(item, FINANCE_SUBCATEGORIES);
}
else if (isWorldEvents(item)) {
  category = "WorldEvents";
  subcategory = detectSubcategory(item, WORLD_EVENTS_SUBCATEGORIES);
}
else if (isTechnology(item)) {
  category = "Technology";
  subcategory = detectSubcategory(item, TECHNOLOGY_SUBCATEGORIES);
}
else if (isPopCulture(item)) {
  category = "PopCulture";
  subcategory = detectSubcategory(item, POPCULTURE_SUBCATEGORIES);
}
else if (isClimateAndScience(item)) {
  category = "ClimateAndScience";
  subcategory = detectSubcategory(item, CLIMATE_SCIENCE_SUBCATEGORIES);
}
else if (isEconomy(item)) {
  category = "Economy";
  subcategory = detectSubcategory(item, ECONOMY_SUBCATEGORIES);
}
// else if (isWorldEvents(item)) category = "WorldEvents";
// else if (isTechnology(item)) category = "Technology";
// else if (isPopCulture(item)) category = "PopCulture";
// else if (isClimateAndScience(item)) category = "ClimateAndScience";
// else if (isEconomy(item)) category = "Economy";


      // if (currency) category = "Crypto";
      // else if (isSports(item)) category = "Sports";
      // else if (isPolitics(item)) category = "Politics";
      // else if (isGeopolitics(item)) category = "Geopolitics";
      // else if (isFinance(item)) category = "Finance";
      // else if (isWorldEvents(item)) category = "WorldEvents";
      // else if (isTechnology(item)) category = "Technology";
      // else if (isPopCulture(item)) category = "PopCulture";
      // else if (isClimateAndScience(item)) category = "ClimateAndScience";
      // else if (isEconomy(item)) category = "Economy";

      const yesPool = item.yesPool || item.outcomes?.[0]?.totalAmount || 0;
      const noPool = item.noPool || item.outcomes?.[1]?.totalAmount || 0;
      const totalPool = yesPool + noPool;

      return {
        specifyId: item.id,
        question: item.question || item.title,
        description: item.description || "",
        tags: item.tags || [],
        category,
        currency,
        startDate: item.startDate,
        image: item.image,
        endDate: item.endDate,
        liquidity: item.liquidity,
        volume24hr: item.volume24hr,
        new: item.new,
        totalPool,
        yesPool,
        subcategory: currency || subcategory,
        noPool,
        yesOdds: totalPool ? ((yesPool / totalPool) * 100).toFixed(2) : "0",
        noOdds: totalPool ? ((noPool / totalPool) * 100).toFixed(2) : "0",
        clobTokenIds: item.clobTokenIds,
        outcomes: item.outcomes,
        outcomePrices: item.outcomePrices,
        newMarketdate: item.createdAt,
        bestBid: item.bestBid || 0,
        bestAsk: item.bestAsk || 0,
        slug: item.slug,
        active: item.active,
        closed: item.closed,
        events: item.events || []
      };
    }).filter(Boolean);

    return { success: true, data: finalData };
  } catch (e) {
    console.error("Fetch error:", e);
    return { success: false, error: e.message };
  }
}

cron.schedule("*/60 * * * *", async () => {
  // cron.schedule("*/5 * * * * *", async () => {
  console.log("Fetching Polymarket…", new Date().toLocaleString());

  if (!API_URL) {
    console.error("❌ POLYMARKET_URL env var is not set — skipping Polymarket sync. Set POLYMARKET_URL=https://gamma-api.polymarket.com in your .env file.");
    return;
  }

  try {
    await Polymarket.deleteMany({ endDate: { $lt: new Date() } });
    await Polymarket.deleteMany({ closed: true });

    const result = await getPolyMarketsDetailsHandler({ query: {} });
    if (!result.success) return;

    const crypto = result.data.filter(m => m.category === "Crypto").slice(0, 100);
    const sports = result.data.filter(m => m.category === "Sports").slice(0, 100);
    const politics = result.data.filter(m => m.category === "Politics").slice(0, 100);
    const geopolitics = result.data.filter(m => m.category === "Geopolitics").slice(0, 100);
    const finance = result.data.filter(m => m.category === "Finance").slice(0, 100);
    const worldevents = result.data.filter(m => m.category === "WorldEvents").slice(0, 100);
    const technology = result.data.filter(m => m.category === "Technology").slice(0, 100);
    const popculture = result.data.filter(m => m.category === "PopCulture").slice(0, 100);
    const climateAndScience = result.data.filter(m => m.category === "ClimateAndScience").slice(0, 100);
    const economy = result.data.filter(m => m.category === "Economy").slice(0, 100);

    const others = result.data
      .filter(m =>
        ![
          "Crypto","Sports","Politics","Geopolitics",
          "Finance","WorldEvents","Technology","PopCulture","ClimateAndScience","Economy"
        ].includes(m.category)
      )
      .slice(0, 30);

    const finalMarkets = [
      ...crypto,
      ...sports,
      ...politics,
      ...geopolitics,
      ...finance,
      ...worldevents,
      ...technology,
      ...popculture,
      ...climateAndScience,
      ...economy,
      ...others,
    ];

    for (const market of finalMarkets) {
      let tokenIds = market.clobTokenIds;
      let outcomes = market.outcomes;

      if (typeof tokenIds === "string") {
        try { tokenIds = JSON.parse(tokenIds); } catch {}
      }

      if (typeof outcomes === "string") {
        try { outcomes = JSON.parse(outcomes); } catch {}
      }

      // if (Array.isArray(tokenIds) && Array.isArray(outcomes)) {
      //   market.outcomeTokenIds = {};
      //   for (let i = 0; i < outcomes.length; i++) {
      //     if (outcomes[i] && tokenIds[i]) {
      //       market.outcomeTokenIds[outcomes[i]] = tokenIds[i];
      //     }
      //   }
      // }

      if (Array.isArray(tokenIds) && Array.isArray(outcomes)) {
  market.outcomeTokenIds = {};
  for (let i = 0; i < outcomes.length; i++) {
    if (outcomes[i] && tokenIds[i]) {
      const safeKey = outcomes[i]
        .replace(/\./g, "_")
        .replace(/\$/g, "")
        .trim();

      market.outcomeTokenIds[safeKey] = tokenIds[i];
    }
  }
}

      await Polymarket.updateOne(
        { specifyId: market.specifyId },
        { $set: market },
        { upsert: true }
      );
    }

    console.log(
      `Stored → Crypto:${crypto.length} Sports:${sports.length} Politics:${politics.length} ` +
      `Geopolitics:${geopolitics.length} Finance:${finance.length} WorldEvents:${worldevents.length} ` +
      `Technology:${technology.length} PopCulture:${popculture.length} ClimateAndScience:${climateAndScience.length} ` +
      `Economy:${economy.length} Total:${finalMarkets.length}`
    );
  } catch (e) {
    console.error("Cron error:", e);
  }
});


// ─── UMA Oracle Resolution Cron ──────────────────────────────────────────────
// Runs every 15 minutes.
// Phase 1: For closed UMA markets with no assertionId → submit proposal to UMA OO
// Phase 2: For markets with an assertionId → check if dispute window expired → settle
const { proposeResolution, checkAssertionStatus, settleResolution } = require("./services/umaOracle.service");

cron.schedule("*/15 * * * *", async () => {
  // Only run if UMA is configured
  if (!process.env.UMA_OO_V3_ADDRESS || !process.env.EVM_PRIVATE_KEY) return;

  console.log("UMA Oracle cron running…", new Date().toLocaleString());

  try {
    const now = new Date();

    // Phase 1: Submit proposals for closed UMA markets not yet submitted
    const unsubmitted = await Market.find({
      oracleType: "uma",
      endDate: { $lte: now },
      marketStatus: { $nin: ["resolved"] },
      umaAssertionId: null,
      // aiResolution.verdict should be set (admin or AI pre-filled the verdict)
      "aiResolution.verdict": { $ne: null },
    }).lean();

    for (const market of unsubmitted) {
      try {
        const assertionId = await proposeResolution(
          market._id.toString(),
          market.aiResolution.verdict,
          market.question
        );
        await Market.findByIdAndUpdate(market._id, {
          umaAssertionId: assertionId,
          umaVerdict: market.aiResolution.verdict,
          umaSubmittedAt: now,
        });
        console.log(`UMA: Submitted assertion for market ${market._id}`);
      } catch (err) {
        console.error(`UMA proposal error for market ${market._id}:`, err.message);
      }
    }

    // Phase 2: Settle assertions whose dispute window has expired
    const submitted = await Market.find({
      oracleType: "uma",
      marketStatus: { $nin: ["resolved"] },
      umaAssertionId: { $ne: null },
    }).lean();

    for (const market of submitted) {
      try {
        const status = await checkAssertionStatus(market.umaAssertionId);

        if (status.settled) {
          // Already settled on-chain — just update our DB
          await Market.findByIdAndUpdate(market._id, {
            marketStatus: "resolved",
            closed: true,
          });
          continue;
        }

        if (status.disputed) {
          console.log(`UMA: Market ${market._id} assertion is disputed — waiting for DVM vote`);
          continue;
        }

        if (status.canSettle) {
          const upheld = await settleResolution(market.umaAssertionId);
          await Market.findByIdAndUpdate(market._id, {
            marketStatus: "resolved",
            closed: true,
            // If disputed and overturned, upheld=false means assertion was wrong
            umaVerdict: upheld ? market.umaVerdict : null,
          });
          console.log(`UMA: Market ${market._id} settled. Upheld: ${upheld}`);
        }
      } catch (err) {
        console.error(`UMA settle error for market ${market._id}:`, err.message);
      }
    }
  } catch (e) {
    console.error("UMA Oracle cron error:", e);
  }
});

// ─── AI Oracle Resolution Cron ───────────────────────────────────────────────
// Runs every 30 minutes. Finds closed internal markets with oracleType=ai
// and attempts automatic resolution via the AI oracle service.
const Market = require("./models/markets");
const { resolveMarketWithAI, CONFIDENCE_THRESHOLD } = require("./services/aiOracle.service");

cron.schedule("*/30 * * * *", async () => {
  console.log("AI Oracle cron running…", new Date().toLocaleString());

  try {
    const now = new Date();

    // Find internal markets that have ended and are set to AI oracle, not yet resolved
    const pendingMarkets = await Market.find({
      oracleType: "ai",
      endDate: { $lte: now },
      marketStatus: { $nin: ["resolved"] },
      active: true,
      closed: false,
    }).lean();

    console.log(`AI Oracle: ${pendingMarkets.length} markets to check`);

    for (const market of pendingMarkets) {
      try {
        const result = await resolveMarketWithAI(market);
        console.log(`Market ${market._id}: verdict="${result.verdict}", confidence=${result.confidence}`);

        if (result.shouldAutoResolve) {
          // Save AI resolution data and mark as resolved
          await Market.findByIdAndUpdate(market._id, {
            "aiResolution.verdict": result.verdict,
            "aiResolution.confidence": result.confidence,
            "aiResolution.source": process.env.AI_ORACLE_PROVIDER || "anthropic",
            "aiResolution.resolvedAt": now,
            marketStatus: "resolved",
            closed: true,
          });

          console.log(`✅ Market ${market._id} auto-resolved via AI oracle: ${result.verdict}`);
        } else {
          // Flag for manual review — just save the AI data, don't resolve
          await Market.findByIdAndUpdate(market._id, {
            "aiResolution.verdict": result.verdict,
            "aiResolution.confidence": result.confidence,
            "aiResolution.source": process.env.AI_ORACLE_PROVIDER || "anthropic",
            "aiResolution.resolvedAt": now,
            // Leave marketStatus as-is — admin must review
          });

          console.log(`⚠️  Market ${market._id} needs manual review (confidence=${result.confidence} < ${CONFIDENCE_THRESHOLD})`);
        }
      } catch (marketErr) {
        console.error(`AI Oracle error for market ${market._id}:`, marketErr.message);
      }
    }
  } catch (e) {
    console.error("AI Oracle cron error:", e);
  }
});
