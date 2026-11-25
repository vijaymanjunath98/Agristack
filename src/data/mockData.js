export const USER_ROLES = [
  {
    id: 'farmer',
    title: 'Farmer',
    subtitle: 'Grow & Sell Smartly',
    description:
      'See what crops buyers need before planting, list your harvest easily, and get fair prices with zero confusion.',
    features: [
      'Check high-demand crops in your area',
      'List crops in simple steps',
      'Receive direct buyer offers & alerts',
    ],
    cta: 'Open Farmer Portal',
    accentBg: 'bg-white border-green-200 hover:border-green-600',
    badgeClass: 'bg-green-100 text-green-900',
    btnClass: 'bg-green-700 hover:bg-green-800 text-white',
  },
  {
    id: 'buyer',
    title: 'Buyer',
    subtitle: 'Source Fresh Quality',
    description:
      'Post the crops you want to buy, browse verified farm harvests, and place direct bids with trusted quality details.',
    features: [
      'Post crop demand for upcoming harvests',
      'Browse agent-checked farm lots',
      'Track bids and orders in one place',
    ],
    cta: 'Open Buyer Portal',
    accentBg: 'bg-yellow-50/70 border-yellow-300 hover:border-yellow-500',
    badgeClass: 'bg-yellow-200 text-green-950',
    btnClass: 'bg-yellow-400 hover:bg-yellow-500 text-green-950',
  },
  {
    id: 'agent',
    title: 'Village Agent',
    subtitle: 'Support Local Farmers',
    description:
      'Help farmers in your village list their crops, inspect grain moisture and grade on-site, and guide them to fair buyers.',
    features: [
      'Check pending farm inspection requests',
      'Verify crop quality & moisture on-site',
      'Help farmers without smartphones sell easily',
    ],
    cta: 'Open Agent Portal',
    accentBg: 'bg-green-50/70 border-green-300 hover:border-green-700',
    badgeClass: 'bg-green-800 text-yellow-100',
    btnClass: 'bg-green-800 hover:bg-green-900 text-white',
  },
]

export const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Check Market Demand First',
    description:
      'Farmers see which crops buyers want right now and next season, along with expected prices.',
  },
  {
    step: '2',
    title: 'List Harvest & Verify Locally',
    description:
      'Farmers or their local Village Agent upload crop details and check quality right at the village.',
  },
  {
    step: '3',
    title: 'Buyers Bid & Farmers Earn Fairly',
    description:
      'Verified buyers send direct offers. Farmers choose the best price and get clear, timely payment.',
  },
]

export const INITIAL_DEMANDS = [
  {
    id: 'DEM-201',
    crop: 'Sharbati Wheat',
    neededQty: '500 Quintals',
    demandLevel: 'Very High',
    targetPrice: '₹2,650 – ₹2,850 / Qt',
    region: 'Madhya Pradesh & Gujarat',
    buyerType: 'Flour Mills & Retailers',
  },
  {
    id: 'DEM-202',
    crop: 'Yellow Soybean',
    neededQty: '350 Quintals',
    demandLevel: 'High',
    targetPrice: '₹4,550 – ₹4,800 / Qt',
    region: 'Maharashtra & MP',
    buyerType: 'Oil & Food Processors',
  },
  {
    id: 'DEM-203',
    crop: 'Red Onion (Nashik)',
    neededQty: '600 Quintals',
    demandLevel: 'High',
    targetPrice: '₹2,100 – ₹2,400 / Qt',
    region: 'Maharashtra & Karnataka',
    buyerType: 'City Wholesale Markets',
  },
  {
    id: 'DEM-204',
    crop: '1121 Basmati Paddy',
    neededQty: '420 Quintals',
    demandLevel: 'Medium',
    targetPrice: '₹3,800 – ₹4,050 / Qt',
    region: 'Punjab & Haryana',
    buyerType: 'Export Rice Mills',
  },
]

export const LIVE_MARKET_RATES = [
  {
    crop: 'Sharbati Wheat',
    mandi: 'Sehore Mandi',
    price: '₹2,760 / Qt',
    change: '+4.2%',
    trend: 'up',
    status: 'Active Buying',
  },
  {
    crop: '1121 Basmati Paddy',
    mandi: 'Karnal Mandi',
    price: '₹3,940 / Qt',
    change: '+2.8%',
    trend: 'up',
    status: 'Active Buying',
  },
  {
    crop: 'Yellow Soybean',
    mandi: 'Latur Mandi',
    price: '₹4,680 / Qt',
    change: '+1.5%',
    trend: 'up',
    status: 'High Demand',
  },
  {
    crop: 'Salem Turmeric',
    mandi: 'Erode Mandi',
    price: '₹12,650 / Qt',
    change: '0.0%',
    trend: 'steady',
    status: 'Stable',
  },
  {
    crop: 'Fresh Red Onion',
    mandi: 'Lasalgaon Mandi',
    price: '₹2,280 / Qt',
    change: '-1.2%',
    trend: 'down',
    status: 'Moderate',
  },
]

export const INITIAL_WEATHER_ALERTS = [
  {
    id: 'W-1',
    region: 'Central MP (Sehore, Vidisha)',
    level: 'Sunny & Dry',
    severity: 'good',
    temp: '29°C',
    advice: 'Best weather for wheat harvesting and sun-drying grains safely.',
    updated: 'Updated 20 mins ago',
  },
  {
    id: 'W-2',
    region: 'Marathwada (Latur, Beed)',
    level: 'Light Rain Expected',
    severity: 'warning',
    temp: '25°C',
    advice: 'Cover harvested soybean bags with tarpaulin sheets before evening.',
    updated: 'Updated 1 hour ago',
  },
  {
    id: 'W-3',
    region: 'Northern Plains (Karnal, Panipat)',
    level: 'Cool Morning Mist',
    severity: 'info',
    temp: '21°C',
    advice: 'Store paddy in dry sheds; check moisture before bagging.',
    updated: 'Updated 45 mins ago',
  },
]

export const INITIAL_CROP_LOTS = [
  {
    id: 'LOT-101',
    crop: 'Sharbati Wheat',
    farmer: 'Ramesh Patel',
    village: 'Sehore, MP',
    quantity: 45,
    expectedPrice: 2700,
    moisture: '11.4%',
    grade: 'Grade A+',
    status: 'Verified',
    agent: 'Sunita Verma',
    offers: [
      { id: 'BID-1', buyer: 'Annapurna Mills', price: 2780, status: 'Open' },
    ],
  },
  {
    id: 'LOT-102',
    crop: '1121 Basmati Paddy',
    farmer: 'Harpreet Singh',
    village: 'Karnal, Haryana',
    quantity: 60,
    expectedPrice: 3850,
    moisture: '13.0%',
    grade: 'Grade A',
    status: 'Verified',
    agent: 'Vikram Gill',
    offers: [
      { id: 'BID-2', buyer: 'Golden Grain Exports', price: 3960, status: 'Open' },
    ],
  },
  {
    id: 'LOT-103',
    crop: 'Yellow Soybean',
    farmer: 'Mahesh Deshmukh',
    village: 'Latur, Maharashtra',
    quantity: 35,
    expectedPrice: 4600,
    moisture: 'Pending',
    grade: 'Pending',
    status: 'Pending Inspection',
    agent: 'Priya Joshi',
    offers: [],
  },
  {
    id: 'LOT-104',
    crop: 'Fresh Red Onion',
    farmer: 'Suresh Jadhav',
    village: 'Nashik, Maharashtra',
    quantity: 50,
    expectedPrice: 2200,
    moisture: 'Pending',
    grade: 'Pending',
    status: 'Pending Inspection',
    agent: 'Priya Joshi',
    offers: [],
  },
]

export const INITIAL_PLATFORM_USERS = [
  { id: 'USR-1', name: 'Ramesh Patel', role: 'Farmer', location: 'Sehore, MP', status: 'Active' },
  { id: 'USR-2', name: 'Harpreet Singh', role: 'Farmer', location: 'Karnal, Haryana', status: 'Active' },
  { id: 'USR-3', name: 'Annapurna Mills', role: 'Buyer', location: 'Indore, MP', status: 'Active' },
  { id: 'USR-4', name: 'Sunita Verma', role: 'Village Agent', location: 'Sehore Block', status: 'Approved' },
  { id: 'USR-5', name: 'Kiran Rao', role: 'Village Agent', location: 'Erode Block', status: 'Pending Approval' },
]

export const VILLAGE_FARMERS_HELPED = [
  { name: 'Ramesh Patel', village: 'Sehore', phone: '+91 98XXX 41201', crops: 'Sharbati Wheat (45 Qt)' },
  { name: 'Mahesh Deshmukh', village: 'Latur', phone: '+91 97XXX 30982', crops: 'Yellow Soybean (35 Qt)' },
  { name: 'Lakshmi Devi', village: 'Vidisha', phone: '+91 94XXX 11845', crops: 'Desi Chana (22 Qt)' },
]
