export const CITY = 'New Aurora';

export const SKIN_TONES = ['#f6d5b8', '#e8b98a', '#c68642', '#8d5524', '#5c3310', '#2e1a0f'];
export const HAIR_COLORS = ['#1a1a1a', '#3b2a1a', '#6b3a1a', '#c4a35a', '#d8d0c8', '#8b1e3f', '#2c5f8a', '#e07a3d'];
export const SHIRT_COLORS = ['#f0f0f0', '#1e3a5f', '#c45c26', '#2d6a4f', '#7b2d8e', '#111111', '#c9a227', '#3d7ea6'];
export const PANTS_COLORS = ['#1f2933', '#3d4a5c', '#4a3728', '#1a3c34', '#4b5563', '#111827'];
export const EYE_COLORS = ['#3d2914', '#1f4e79', '#2f6f4e', '#5b3a29', '#6b7280', '#7c3aed'];
export const HAIR_STYLES = [
  { id: 0, name: 'Short' },
  { id: 1, name: 'Slick' },
  { id: 2, name: 'Wavy' },
  { id: 3, name: 'Bun' },
  { id: 4, name: 'Shaved' },
];

export const TRAITS = [
  { id: 'hustler', name: 'Hustler', desc: '+18% job pay' },
  { id: 'charm', name: 'Charismatic', desc: 'Relationships grow faster' },
  { id: 'early', name: 'Early Bird', desc: 'Energy drains slower' },
  { id: 'chef', name: 'Home Cook', desc: 'Food restores more hunger' },
];

export const FIRST_NAMES = [
  'Maya', 'Noah', 'Elena', 'Kai', 'Sofia', 'Amir', 'Chloe', 'Diego', 'Aisha', 'Luca',
  'Hannah', 'Omar', 'Priya', 'Ben', 'Yuki', 'Leo', 'Nadia', 'Cole', 'Freya', 'Jamal',
  'Ines', 'Theo', 'Sana', 'Mateo', 'Nora', 'Ravi', 'Quinn', 'Zara', 'Eli', 'Hana',
  'Marcus', 'Leila', 'Owen', 'Amara', 'Felix', 'June', 'Ibrahim', 'Sable', 'Nico', 'Ava',
];

export const LAST_NAMES = [
  'Chen', 'Okonkwo', 'Alvarez', 'Berg', 'Nakamura', 'Rossi', 'Patel', 'Mensah', 'Kowalski',
  'Nguyen', 'Ibrahim', 'Silva', 'Johansson', 'Park', 'Okafor', 'Moreau', 'Khan', 'Santos',
  'Novak', 'Diallo', 'Costa', 'Andersson', 'Yamamoto', 'Hassan', 'Petrov', 'Walsh',
];

export const PERSONALITIES = ['warm', 'sarcastic', 'shy', 'ambitious', 'laidback', 'anxious', 'flirty', 'professional'];

export const DIALOGUE = {
  greeting: {
    warm: ['Hey! Good to see a new face.', 'Hi there — how is the city treating you?', 'You look like you could use a friend. I am around.'],
    sarcastic: ['Oh. A tourist. Or a dreamer. Same thing here.', 'New Aurora. Try not to go broke on day one.', 'Let me guess. Big plans. Tiny wallet.'],
    shy: ['Oh — hi. I, um. Welcome.', 'Sorry, I was just… heading somewhere.', 'You are new, right? I noticed.'],
    ambitious: ['Time is money in this city. Use both well.', 'If you are not building something, you are falling behind.', 'Network. Always network.'],
    laidback: ['Easy, friend. The city is not going anywhere.', 'Nice day for doing absolutely nothing productive.', 'You should check the harbor at sunset. Trust me.'],
    anxious: ['Is it going to rain? I feel like it is going to rain.', 'Be careful downtown after midnight, okay?', 'Did you hear about the factory overtime? Wild.'],
    flirty: ['Well. New Aurora just got more interesting.', 'You have good timing. I was bored.', 'Walk with me sometime. I know the good cafes.'],
    professional: ['Welcome to New Aurora. First National is open until 17:00.', 'If you need work, Meridian Corp is hiring clerks.', 'Register your business at City Hall when you are ready.'],
  },
  chat: {
    warm: ['I grabbed noodles at the harbor last night. You would love it.', 'Central Plaza is prettier after rain. Reflections everywhere.', 'If you ever need a plus-one to Afterlight, say the word.'],
    sarcastic: ['Another day, another rent notice. Capitalism is thriving.', 'Sports cars do not pay for themselves. I checked.', 'The airport coffee is a crime. A tasty crime.'],
    shy: ['I like the park when it is empty. Morning, mostly.', 'I am saving for a loft. Slowly. Very slowly.', 'Do you… want to get coffee? Only if you are free.'],
    ambitious: ['I am closing a small deal at Meridian. Keep it quiet.', 'Own something. A stall, a van, a window. Anything.', 'Credit rating is a love language here.'],
    laidback: ['I called in sick and watched boats. 10/10 day.', 'Farmers market on Sundays. Cheap mangoes. Life is good.', 'You work too hard. I can tell. Relax.'],
    anxious: ['Did you lock your door? I always double-check.', 'Storms make the bridge feel… wobbly. I walk around.', 'I should sleep more. I will not, but I should.'],
    flirty: ['You wear that shirt well. Just saying.', 'There is a lookout above the harbor. Very private.', 'Buy me a lantern dinner and I might tell you city secrets.'],
    professional: ['Bus 4 runs to the airport every twenty minutes.', 'Property values in Oakwood are up 4% this quarter.', 'Ironworks is unionizing. Expect wage bumps.'],
  },
  weather: {
    rain: ['This rain will flood the industrial underpass. Take the long way.', 'I love the smell. The cars do not.'],
    storm: ['Get inside. Seriously.', 'Harbor is closed to small boats until this passes.'],
    fog: ['Drive slow. The airport road disappears in this.'],
    sunny: ['Perfect day to be outside. Or to sell iced drinks.'],
    wind: ['Hold onto your hat downtown. Wind tunnels between towers.'],
  },
  bye: ['See you around.', 'Take care of yourself.', 'Do not be a stranger.', 'Later.', 'Stay gold.'],
};

export const JOBS = [
  { id: 'barista', name: 'Barista', employer: 'Corner Cafe', wage: 16, hours: [7, 15], location: 'cafe_corner', energy: 12, reqLevel: 1, desc: 'Steam milk, remember names, survive the morning rush.' },
  { id: 'clerk', name: 'Office Clerk', employer: 'Meridian Corp', wage: 26, hours: [9, 17], location: 'meridian', energy: 10, reqLevel: 1, desc: 'Spreadsheets, coffee, and the slow climb.' },
  { id: 'server', name: 'Server', employer: 'The Lantern', wage: 15, hours: [16, 23], location: 'lantern', energy: 14, reqLevel: 1, desc: 'Nights, tips, and stories from every table.', tips: true },
  { id: 'factory', name: 'Line Worker', employer: 'Ironworks', wage: 22, hours: [6, 14], location: 'ironworks', energy: 18, reqLevel: 1, desc: 'Loud, honest money. Earplugs recommended.' },
  { id: 'warehouse', name: 'Warehouse Hand', employer: 'Harbor Logistics', wage: 20, hours: [8, 16], location: 'warehouse', energy: 16, reqLevel: 1, desc: 'Lift, scan, stack. Deliveries start here.' },
  { id: 'farmer', name: 'Farm Hand', employer: 'Greenfield Farm', wage: 18, hours: [5, 13], location: 'farm', energy: 20, reqLevel: 1, desc: 'Dirt under the nails. Food on the table.' },
  { id: 'teller', name: 'Bank Teller', employer: 'First National', wage: 24, hours: [9, 16], location: 'bank', energy: 8, reqLevel: 2, desc: 'Count twice. Smile once.' },
  { id: 'nurse', name: 'Night Nurse', employer: 'Aurora General', wage: 32, hours: [19, 7], location: 'hospital', energy: 16, reqLevel: 3, desc: 'The city bleeds after dark. You stitch it back.' },
  { id: 'tower', name: 'Tower Analyst', employer: 'Aurora Tower', wage: 48, hours: [9, 18], location: 'aurora_tower', energy: 12, reqLevel: 4, desc: 'From the 40th floor the city looks solvable.' },
  { id: 'pilot', name: 'Charter Pilot', employer: 'Aurora Air', wage: 70, hours: [10, 18], location: 'airport', energy: 10, reqLevel: 6, desc: 'Wheels up. The coast is yours.' },
];

export const PROPERTIES = [
  { id: 'studio', name: 'Studio 12B', district: 'Oakwood', price: 0, rent: 90, type: 'rent', landmark: 'home_studio', desc: 'One room, one window, one chance.', beds: 1, starter: true },
  { id: 'oakwood', name: 'Oakwood Bungalow', district: 'Oakwood', price: 62000, rent: 0, type: 'buy', landmark: 'oakwood_house', desc: 'A yard. A porch. Quiet nights.', beds: 2 },
  { id: 'loft', name: 'City Loft 8', district: 'Downtown', price: 145000, rent: 0, type: 'buy', landmark: 'city_lofts', desc: 'Brick, iron, and skyline.', beds: 1 },
  { id: 'east_house', name: 'Eastbrook House', district: 'Eastbrook', price: 88000, rent: 0, type: 'buy', landmark: 'east_house', desc: 'Family rooms, maple street, school nearby.', beds: 3 },
  { id: 'farmhouse', name: 'Greenfield Farmhouse', district: 'Rural', price: 54000, rent: 0, type: 'buy', landmark: 'farmhouse', desc: 'Wake with the roosters. Own the horizon.', beds: 2 },
  { id: 'penthouse', name: 'Aurora Penthouse', district: 'Downtown', price: 420000, rent: 0, type: 'buy', landmark: 'hotel', desc: 'The city at your feet. Literally.', beds: 2 },
];

export const BUSINESSES = [
  { id: 'stall', name: 'Harbor Snack Stall', price: 4500, income: [70, 140], landmark: 'fish_market', desc: 'Steam, spice, and lunch rushes.', upgrade: 2000 },
  { id: 'cafe_biz', name: 'Corner Cafe', price: 22000, income: [220, 420], landmark: 'cafe_corner', desc: 'The neighborhood’s living room.', upgrade: 8000 },
  { id: 'store', name: 'Nexus Convenience', price: 28000, income: [260, 500], landmark: 'mall', desc: 'Open late. Always someone hungry.', upgrade: 10000 },
  { id: 'lantern_biz', name: 'The Lantern', price: 55000, income: [480, 920], landmark: 'lantern', desc: 'White tablecloths, gold light, reservations.', upgrade: 18000 },
  { id: 'farm_biz', name: 'Greenfield Farm', price: 36000, income: [300, 640], landmark: 'farm', desc: 'Crops, crates, contracts.', upgrade: 12000 },
  { id: 'logistics', name: 'Harbor Logistics', price: 72000, income: [600, 1100], landmark: 'warehouse', desc: 'Trucks, bills of lading, the city’s bloodstream.', upgrade: 22000 },
  { id: 'tech', name: 'Northlight Software', price: 120000, income: [900, 1800], landmark: 'aurora_tower', desc: 'A small floor. A large multiple.', upgrade: 40000 },
];

export const VEHICLES = [
  { id: 'moto', name: 'Sparrow Bike', type: 'motorcycle', price: 2200, speed: 28, color: 0x222222, seats: 2, fuel: 40 },
  { id: 'sedan', name: 'Aurora Sedan', type: 'car', price: 6800, speed: 22, color: 0xcfd8e3, seats: 4, fuel: 55 },
  { id: 'taxi', name: 'City Taxi', type: 'car', price: 5400, speed: 20, color: 0xf0c400, seats: 4, fuel: 50 },
  { id: 'suv', name: 'Ridge SUV', type: 'car', price: 16400, speed: 20, color: 0x2e4a3a, seats: 5, fuel: 70 },
  { id: 'sport', name: 'Falcon Sport', type: 'car', price: 42000, speed: 34, color: 0xb11226, seats: 2, fuel: 45 },
  { id: 'luxury', name: 'Vesper Luxury', type: 'car', price: 88000, speed: 26, color: 0x111111, seats: 4, fuel: 60 },
  { id: 'truck', name: 'Haul Truck', type: 'truck', price: 24000, speed: 16, color: 0x6b4f2a, seats: 2, fuel: 90 },
  { id: 'boat', name: 'Harbor Runabout', type: 'boat', price: 31000, speed: 18, color: 0xe8e0d0, seats: 4, fuel: 50, water: true },
  { id: 'heli', name: 'Skyhook Heli', type: 'heli', price: 210000, speed: 40, color: 0x8899aa, seats: 2, fuel: 80, fly: true },
];

export const SHOP_ITEMS = [
  { id: 'coffee', name: 'Coffee', price: 4, type: 'food', hunger: 6, energy: 12, fun: 2, icon: '☕' },
  { id: 'sandwich', name: 'Sandwich', price: 8, type: 'food', hunger: 28, energy: 4, icon: '🥪' },
  { id: 'noodles', name: 'Harbor Noodles', price: 12, type: 'food', hunger: 40, energy: 6, fun: 6, icon: '🍜' },
  { id: 'lantern_meal', name: 'Lantern Prix Fixe', price: 38, type: 'food', hunger: 55, fun: 18, social: 6, icon: '🍽️' },
  { id: 'groceries', name: 'Groceries', price: 22, type: 'food', hunger: 50, icon: '🛒', home: true },
  { id: 'flowers', name: 'Bouquet', price: 16, type: 'gift', social: 10, rel: 12, icon: '💐' },
  { id: 'watch', name: 'Wristwatch', price: 140, type: 'gift', rel: 22, icon: '⌚' },
  { id: 'shirt_new', name: 'City Shirt', price: 45, type: 'clothes', fun: 8, icon: '👕' },
  { id: 'jacket', name: 'Night Jacket', price: 120, type: 'clothes', fun: 12, icon: '🧥' },
  { id: 'soap', name: 'Soap Kit', price: 9, type: 'hygiene', hygiene: 40, icon: '🧼' },
  { id: 'medkit', name: 'Medkit', price: 28, type: 'health', energy: 20, icon: '✚' },
  { id: 'fuelcan', name: 'Fuel Can', price: 18, type: 'fuel', icon: '⛽' },
  { id: 'repair', name: 'Repair Kit', price: 35, type: 'repair', icon: '🔧' },
];

export const LANDMARKS = [
  { id: 'home_studio', name: 'Studio 12B', type: 'home', district: 'oakwood', x: -186, z: 36, interior: 'apartment', color: 0xc4a574, h: 10, w: 10, d: 10 },
  { id: 'cafe_corner', name: 'Corner Cafe', type: 'cafe', district: 'oakwood', x: -158, z: 64, interior: 'cafe', color: 0xb8572a, h: 7, w: 12, d: 10 },
  { id: 'oakwood_house', name: 'Oakwood Bungalow', type: 'home', district: 'oakwood', x: -238, z: 18, interior: 'house', color: 0xd9c3a0, h: 8, w: 14, d: 12 },
  { id: 'school', name: 'Aurora High', type: 'school', district: 'oakwood', x: -226, z: 88, interior: null, color: 0xc9b48a, h: 12, w: 22, d: 16 },
  { id: 'park_west', name: 'Maple Park', type: 'park', district: 'oakwood', x: -200, z: -18, interior: null, park: true },

  { id: 'aurora_tower', name: 'Aurora Tower', type: 'office', district: 'downtown', x: 6, z: 58, interior: 'office', color: 0x8aa0b8, h: 86, w: 16, d: 16, glass: true },
  { id: 'plaza', name: 'Central Plaza', type: 'plaza', district: 'downtown', x: 0, z: 12, interior: null, plaza: true },
  { id: 'bank', name: 'First National Bank', type: 'bank', district: 'downtown', x: 44, z: 40, interior: 'bank', color: 0xe8e0d4, h: 18, w: 16, d: 14 },
  { id: 'mall', name: 'Nexus Mall', type: 'shop', district: 'downtown', x: -52, z: 52, interior: 'shop', color: 0x9bb0c4, h: 16, w: 28, d: 20, glass: true },
  { id: 'meridian', name: 'Meridian Corp', type: 'office', district: 'downtown', x: 78, z: 22, interior: 'office', color: 0x6a7d90, h: 42, w: 18, d: 14, glass: true },
  { id: 'lantern', name: 'The Lantern', type: 'restaurant', district: 'downtown', x: -28, z: 2, interior: 'restaurant', color: 0x6b2a1f, h: 9, w: 14, d: 12 },
  { id: 'hotel', name: 'Grand Hotel', type: 'hotel', district: 'downtown', x: 52, z: 86, interior: 'apartment', color: 0xcbb79a, h: 36, w: 18, d: 16 },
  { id: 'dealership', name: 'Apex Motors', type: 'dealer', district: 'downtown', x: 96, z: -18, interior: 'dealer', color: 0x4a5564, h: 8, w: 22, d: 16, glass: true },
  { id: 'hospital', name: 'Aurora General', type: 'hospital', district: 'downtown', x: -86, z: 84, interior: null, color: 0xe8eef4, h: 22, w: 24, d: 16 },
  { id: 'nightclub', name: 'Afterlight', type: 'club', district: 'downtown', x: -8, z: 96, interior: 'club', color: 0x2a1238, h: 8, w: 14, d: 12 },
  { id: 'city_hall', name: 'City Hall', type: 'civic', district: 'downtown', x: 22, z: 96, interior: null, color: 0xd4c4a8, h: 20, w: 18, d: 16 },
  { id: 'cafe_metro', name: 'Metro Cafe', type: 'cafe', district: 'downtown', x: -64, z: 12, interior: 'cafe', color: 0x8a3a22, h: 6, w: 10, d: 8 },
  { id: 'city_lofts', name: 'City Lofts', type: 'home', district: 'downtown', x: 84, z: 72, interior: 'apartment', color: 0x8b6a4a, h: 28, w: 16, d: 14 },

  { id: 'east_house', name: 'Eastbrook House', type: 'home', district: 'eastbrook', x: 198, z: 28, interior: 'house', color: 0xead9b8, h: 8, w: 14, d: 12 },
  { id: 'east_house_2', name: 'Willow Residence', type: 'home', district: 'eastbrook', x: 228, z: 58, interior: 'house', color: 0xc2a882, h: 8, w: 12, d: 12 },
  { id: 'community', name: 'Eastbrook Center', type: 'civic', district: 'eastbrook', x: 208, z: 78, interior: null, color: 0xb8a078, h: 10, w: 16, d: 12 },

  { id: 'park_east', name: 'Riverside Park', type: 'park', district: 'park', x: 186, z: -48, interior: null, park: true },

  { id: 'farm', name: 'Greenfield Farm', type: 'farm', district: 'rural', x: -170, z: -176, interior: null, color: 0x8a6a3a, h: 8, w: 18, d: 14 },
  { id: 'farmhouse', name: 'Greenfield Farmhouse', type: 'home', district: 'rural', x: -208, z: -154, interior: 'house', color: 0xc4a070, h: 8, w: 12, d: 10 },
  { id: 'barn', name: 'Red Barn', type: 'farm', district: 'rural', x: -148, z: -204, interior: null, color: 0x8b2a1f, h: 12, w: 16, d: 12 },

  { id: 'cabin', name: 'Pine Cabin', type: 'home', district: 'forest', x: 168, z: -188, interior: 'house', color: 0x5a3a22, h: 6, w: 8, d: 8 },

  { id: 'ironworks', name: 'Ironworks Factory', type: 'factory', district: 'industrial', x: 178, z: 176, interior: 'factory', color: 0x5a5e64, h: 18, w: 28, d: 18 },
  { id: 'warehouse', name: 'Harbor Logistics', type: 'warehouse', district: 'industrial', x: 228, z: 204, interior: 'warehouse', color: 0x6a5840, h: 14, w: 24, d: 16 },

  { id: 'airport', name: 'Aurora International', type: 'airport', district: 'airport', x: 8, z: 228, interior: null, color: 0xc8d0d8, h: 14, w: 36, d: 16 },
  { id: 'hangar', name: 'Skyhook Hangar', type: 'hangar', district: 'airport', x: 58, z: 214, interior: null, color: 0x6a7380, h: 12, w: 20, d: 16 },

  { id: 'pier', name: 'North Pier', type: 'harbor', district: 'harbor', x: -228, z: 198, interior: null, color: 0x6a5340, h: 4, w: 10, d: 28 },
  { id: 'fish_market', name: 'Fish Market', type: 'shop', district: 'harbor', x: -176, z: 168, interior: 'shop', color: 0xb8864a, h: 7, w: 16, d: 12 },
];

export const DISTRICTS = [
  { id: 'downtown', name: 'Downtown', color: '#8aa4c8' },
  { id: 'oakwood', name: 'Oakwood', color: '#8fbf7a' },
  { id: 'eastbrook', name: 'Eastbrook', color: '#c4b07a' },
  { id: 'park', name: 'Riverside', color: '#5aa878' },
  { id: 'rural', name: 'Greenfield', color: '#c4a35a' },
  { id: 'forest', name: 'Pinewood', color: '#3d6b46' },
  { id: 'industrial', name: 'Ironworks', color: '#8a8478' },
  { id: 'airport', name: 'Airfield', color: '#9aa8b8' },
  { id: 'harbor', name: 'North Harbor', color: '#4a7a9a' },
];

export const STORY = [
  { id: 'm1', title: 'A New Dawn', brief: 'Step outside. New Aurora is waiting.', hint: 'Leave your apartment — walk to the door and press E.', reward: { cash: 50, xp: 20 } },
  { id: 'm2', title: 'First Shift', brief: 'Land a job and finish one shift.', hint: 'Open your phone → Career, apply, then go to work during hours.', reward: { cash: 80, xp: 40 } },
  { id: 'm3', title: 'Daily Bread', brief: 'Eat a proper meal. Hunger is not a personality.', hint: 'Visit Corner Cafe, The Lantern, or use your fridge.', reward: { cash: 30, xp: 15 } },
  { id: 'm4', title: 'Faces in the Crowd', brief: 'Talk to three citizens. Learn their names.', hint: 'Walk up to NPCs and press E.', reward: { cash: 40, xp: 25 } },
  { id: 'm5', title: 'Wheels', brief: 'Own a vehicle. The city is larger than it looks.', hint: 'Save up and visit Apex Motors downtown.', reward: { cash: 100, xp: 50 } },
  { id: 'm6', title: 'A Roof You Chose', brief: 'Rent or buy a property that is actually yours.', hint: 'Phone → Real Estate. The bungalow is a good start.', reward: { cash: 150, xp: 60 } },
  { id: 'm7', title: 'Side Hustle', brief: 'Complete three delivery gigs.', hint: 'Phone → Career → Gig Board, or visit Harbor Logistics.', reward: { cash: 120, xp: 45 } },
  { id: 'm8', title: 'Open Sign', brief: 'Buy a business. Let the city work for you.', hint: 'Phone → Business. A snack stall is enough.', reward: { cash: 200, xp: 80 } },
  { id: 'm9', title: 'Someone Who Stays', brief: 'Reach Friend status with anyone.', hint: 'Talk, gift flowers, meet them where they live.', reward: { cash: 100, xp: 50 } },
  { id: 'm10', title: 'City Lights', brief: 'Hit $50,000 net worth. You made it — for now.', hint: 'Work, invest, own. Check Bank for net worth.', reward: { cash: 500, xp: 120 } },
];

export const TIPS = [
  'Needs decay in real time. Eat, sleep, shower, talk.',
  'Jobs pay more with the Hustler trait and with your Life Level.',
  'Businesses deposit income every game midnight — even while you explore.',
  'Rain slows traffic and sends NPCs indoors.',
  'Sleep in a bed you own or rent to skip to morning.',
  'Press F to enter a parked vehicle you own. Buy one at Apex Motors.',
  'Your phone is Tab. The map marks missions in gold.',
  'Credit rating unlocks larger loans at First National.',
  'Nightclubs restore Fun. Hospitals restore Energy — for a price.',
  'Helicopters launch from the Skyhook Hangar. Bring a fortune.',
];
