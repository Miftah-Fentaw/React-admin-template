#!/usr/bin/env node
/**
 * Regenerates the mock database JSON files in src/data/db/.
 *
 * Output is fully deterministic (seeded PRNG) and dates are generated
 * relative to "now", so the demo data always looks fresh.
 *
 * Usage: npm run seed
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_DIR = join(__dirname, '..', 'src', 'data', 'db')

// ---------------------------------------------------------------------------
// Deterministic PRNG
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260823)

const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (min, max) => min + Math.floor(rand() * (max - min + 1))
/** Weighted pick: pass [value, weight] tuples. */
function weighted(pairs) {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0)
  let roll = rand() * total
  for (const [value, w] of pairs) {
    roll -= w
    if (roll <= 0) return value
  }
  return pairs[pairs.length - 1][0]
}

const NOW = new Date()
const DAY = 86_400_000
const daysAgo = (d) => new Date(NOW.getTime() - d * DAY).toISOString()

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Amara', 'Liam', 'Sofia', 'Noah', 'Priya', 'Ethan', 'Maya', 'Lucas',
  'Zoe', 'Marcus', 'Elena', 'David', 'Ingrid', 'Omar', 'Freya', 'Victor',
  'Naomi', 'Felix', 'Clara', 'Jonas', 'Aisha', 'Theo', 'Rosa', 'Henrik',
  'Leila', 'Marco', 'Nina', 'Oscar', 'Petra', 'Quinn', 'Rania', 'Simon',
  'Tara', 'Umar', 'Vera', 'Wren', 'Xavier', 'Yuki', 'Zara', 'Adrian',
  'Bianca', 'Caleb', 'Dalia', 'Emil',
]
const LAST_NAMES = [
  'Chen', 'Novak', 'Silva', 'Okafor', 'Bergstrom', 'Tanaka', 'Kowalski',
  'Rossi', 'Haddad', 'Nilsson', 'Dupont', 'Garcia', 'Muller', 'Petrov',
  'Kimura', 'Andersen', 'Costa', 'Vargas', 'Lindqvist', 'Moreau', 'Ibrahim',
  'Novotna', 'Sato', 'Weber', 'Ferreira', 'Jansen', 'Okoye', 'Reyes',
  'Sorensen', 'Vance',
]
const EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'proton.me', 'vantagehq.dev',
  'northwind.io', 'brightlab.co', 'orbitworks.app', 'quillsoft.dev',
]

function slugifyEmail(name) {
  const ascii = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return ascii.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')
}

function generateUsers() {
  const usedEmails = new Set()
  const roles = [
    ['admin', 2], ['manager', 6], ['member', 22], ['viewer', 12],
  ]
  const statuses = [['active', 30], ['invited', 5], ['suspended', 3]]

  const pinned = [
    {
      id: 'usr_0001',
      name: 'Alex Morgan',
      email: 'admin@vantage.dev',
      role: 'admin',
      status: 'active',
    },
    {
      id: 'usr_0002',
      name: 'Jordan Lee',
      email: 'manager@vantage.dev',
      role: 'manager',
      status: 'active',
    },
  ]

  const users = [...pinned]
  usedEmails.add('admin@vantage.dev')
  usedEmails.add('manager@vantage.dev')

  let i = users.length + 1
  while (users.length < 44 && i < 200) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    const email = `${slugifyEmail(name)}@${pick(EMAIL_DOMAINS)}`
    if (usedEmails.has(email)) continue
    usedEmails.add(email)

    const createdDaysAgo = int(3, 720)
    const status = weighted(statuses)
    users.push({
      id: `usr_${String(i).padStart(4, '0')}`,
      name,
      email,
      role: weighted(roles),
      status,
      avatarUrl: null,
      lastLoginAt:
        status === 'active'
          ? daysAgo(int(0, 30))
          : rand() > 0.5
            ? null
            : daysAgo(int(31, 180)),
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(Math.max(0, createdDaysAgo - int(0, 20))),
    })
    i++
  }

  return users
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const PRODUCT_WORDS = {
  electronics: [
    ['Aurora', 'Wireless Headphones'], ['Nimbus', 'Mechanical Keyboard'],
    ['Vertex', '4K Monitor'], ['Pulse', 'Smart Speaker'],
    ['Orbit', 'USB-C Dock'], ['Flux', 'Portable Charger'],
    ['Echo', 'Noise Meter'], ['Halo', 'Webcam Pro'],
  ],
  furniture: [
    ['Meridian', 'Standing Desk'], ['Atlas', 'Office Chair'],
    ['Summit', 'Bookshelf'], ['Harbor', 'Coffee Table'],
    ['Ridge', 'Desk Lamp'], ['Cove', 'Lounge Chair'],
  ],
  apparel: [
    ['Trailblaze', 'Merino Hoodie'], ['Northline', 'Rain Shell'],
    ['Fieldkit', 'Canvas Tote'], ['Drift', 'Linen Shirt'],
    ['Basalt', 'Chino Pants'],
  ],
  stationery: [
    ['Inkwell', 'Fountain Pen'], ['Gridpaper', 'Notebook A5'],
    ['Stalwart', 'Desk Organizer'], ['Quillsoft', 'Marker Set'],
  ],
  home: [
    ['Hearthstone', 'Ceramic Mug Set'], ['Willow', 'Throw Blanket'],
    ['Terrace', 'Plant Pot'], ['Lumen', 'Table Lamp'],
    ['Cascade', 'Water Bottle'],
  ],
  sports: [
    ['Velocity', 'Yoga Mat'], ['Summitline', 'Insulated Bottle'],
    ['Kinetic', 'Resistance Bands'], ['Stride', 'Running Belt'],
    ['Apex', 'Dumbbell Set'],
  ],
}

function generateProducts() {
  const products = []
  let n = 1001
  for (const [category, entries] of Object.entries(PRODUCT_WORDS)) {
    for (const [brand, item] of entries) {
      const priceRanges = {
        electronics: [39, 649],
        furniture: [89, 1199],
        apparel: [29, 189],
        stationery: [9, 59],
        home: [14, 129],
        sports: [15, 219],
      }
      const [lo, hi] = priceRanges[category]
      products.push({
        id: `prd_${n}`,
        name: `${brand} ${item}`,
        sku: `VN-${category.slice(0, 2).toUpperCase()}-${n}`,
        description: `The ${brand} ${item.toLowerCase()} is part of our ${category} range, built for everyday reliability.`,
        category,
        price: Math.round((lo + rand() * (hi - lo)) * 10 ** 2 - 0.01 + Number.EPSILON) / 100,
        inventory: weighted([[int(0, 0), 1], [int(1, 25), 2], [int(26, 240), 7]]),
        status: weighted([['active', 16], ['draft', 2], ['archived', 2]]),
        createdAt: daysAgo(int(30, 700)),
        updatedAt: daysAgo(int(0, 29)),
      })
      n++
    }
  }
  return products
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const CUSTOMER_NAMES = []
for (let k = 0; k < 40; k++) {
  CUSTOMER_NAMES.push(`${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`)
}

function generateOrders(products) {
  const sellable = products.filter((p) => p.status === 'active' || p.status === 'draft')
  const orders = []
  for (let n = 0; n < 72; n++) {
    const placedDaysAgo = Math.floor((n / 72) ** 1.35 * 120) // denser near today
    const itemCount = int(1, 4)
    const chosen = new Set()
    while (chosen.size < itemCount) chosen.add(pick(sellable))

    const items = [...chosen].map((product) => ({
      productId: product.id,
      name: product.name,
      quantity: int(1, 3),
      unitPrice: product.price,
    }))
    const subtotal =
      Math.round(items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0) * 100) / 100
    const shipping = subtotal > 150 ? 0 : pick([4.99, 9.99, 12.5])
    const tax = Math.round(subtotal * 0.08 * 100) / 100

    // Recent orders skew towards open states, older ones towards terminal ones.
    const ageRatio = placedDaysAgo / 120
    const status =
      rand() < 0.75 - ageRatio * 0.55
        ? weighted([['pending', 3], ['processing', 3], ['shipped', 2]])
        : weighted([['delivered', 6], ['shipped', 3], ['cancelled', 1]])
    const paymentStatus =
      status === 'cancelled'
        ? weighted([['refunded', 3], ['failed', 2]])
        : status === 'pending'
          ? weighted([['pending', 3], ['paid', 2]])
          : weighted([['paid', 9], ['pending', 1], ['refunded', 1]])

    const customerName = CUSTOMER_NAMES[n % CUSTOMER_NAMES.length]
    orders.push({
      id: `ord_${1000 + n}`,
      number: `ORD-${1024 + n}`,
      customerName,
      customerEmail: `${slugifyEmail(customerName)}@${pick(EMAIL_DOMAINS)}`,
      items,
      subtotal,
      shipping,
      tax,
      total: Math.round((subtotal + shipping + tax) * 100) / 100,
      status,
      paymentStatus,
      placedAt: daysAgo(placedDaysAgo),
      updatedAt: daysAgo(Math.max(0, placedDaysAgo - int(0, 3))),
    })
  }
  return orders.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1))
}

// ---------------------------------------------------------------------------
// Notifications & activity (for the signed-in admin)
// ---------------------------------------------------------------------------
function generateNotifications(products, orders) {
  const lowStock = products.filter((p) => p.inventory === 0).slice(0, 2)
  const recentOrder = orders[0]
  return [
    {
      id: 'ntf_0001',
      title: 'New order received',
      message: `${recentOrder.customerName} placed ${recentOrder.number} ($${recentOrder.total.toFixed(2)}).`,
      type: 'success',
      read: false,
      createdAt: daysAgo(0.05),
    },
    ...lowStock.map((p, idx) => ({
      id: `ntf_${String(idx + 2).padStart(4, '0')}`,
      title: 'Product out of stock',
      message: `${p.name} (${p.sku}) has sold out and needs a restock.`,
      type: 'warning',
      read: false,
      createdAt: daysAgo(idx + 0.4),
    })),
    {
      id: 'ntf_0004',
      title: 'Payment failed',
      message: 'A card charge for ORD-1031 failed. The customer has been notified.',
      type: 'error',
      read: false,
      createdAt: daysAgo(1.2),
    },
    {
      id: 'ntf_0005',
      title: 'Weekly report ready',
      message: 'Your workspace analytics summary for last week is available.',
      type: 'info',
      read: true,
      createdAt: daysAgo(2.1),
    },
    {
      id: 'ntf_0006',
      title: 'New team member',
      message: 'Petra Lindqvist accepted their invitation and joined as Manager.',
      type: 'success',
      read: true,
      createdAt: daysAgo(3.4),
    },
    {
      id: 'ntf_0007',
      title: 'Scheduled maintenance',
      message: 'Reports may be delayed on Sunday between 02:00–03:00 UTC.',
      type: 'info',
      read: true,
      createdAt: daysAgo(5.6),
    },
  ]
}

const ACTIVITY_TARGETS = (users, products, orders) => {
  const userNames = users.slice(2, 20).map((u) => u.name)
  return () =>
    weighted([
      [`user ${pick(userNames)}`, 4],
      [`product ${pick(products).name}`, 3],
      [`order ${pick(orders).number}`, 4],
      ['workspace settings', 1],
    ])
}

function generateActivity(users, products, orders) {
  const target = ACTIVITY_TARGETS(users, products, orders)
  const actors = users.filter((u) => u.role !== 'viewer').map((u) => u.name)
  const events = []
  for (let i = 0; i < 26; i++) {
    events.push({
      id: `act_${String(i + 1).padStart(4, '0')}`,
      actorName: pick(actors),
      action: weighted([
        ['created', 3], ['updated', 4], ['deleted', 1],
        ['signed_in', 2], ['placed_order', 3],
      ]),
      target: target(),
      createdAt: daysAgo(i * 0.28),
    })
  }
  return events
}

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
const users = generateUsers()
const products = generateProducts()
const orders = generateOrders(products)
const notifications = generateNotifications(products, orders)
const activity = generateActivity(users, products, orders)

const writeJson = (filename, value) => {
  writeFileSync(join(DB_DIR, filename), JSON.stringify(value, null, 2) + '\n')
  console.log(`✓ ${filename} (${value.length} records)`)
}

writeJson('users.json', users)
writeJson('products.json', products)
writeJson('orders.json', orders)
writeJson('notifications.json', notifications)
writeJson('activity.json', activity)

console.log('\nMock database regenerated into src/data/db/')
