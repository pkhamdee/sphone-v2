// Plain JS seed — runs in production container without ts-node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const products = [
  { name: 'iPhone 15 Pro', description: 'สมาร์ทโฟน Apple รุ่นล่าสุด', brand: 'Apple', imageUrl: '/images/iphone15pro.jpg', priceAmount: 42900, category: 1 },
  { name: 'Samsung Galaxy S24', description: 'สมาร์ทโฟน Samsung ระดับพรีเมียม', brand: 'Samsung', imageUrl: '/images/s24.jpg', priceAmount: 32900, category: 1 },
  { name: 'OPPO Find X7', description: 'สมาร์ทโฟน OPPO รุ่นท็อป', brand: 'OPPO', imageUrl: '/images/findx7.jpg', priceAmount: 24900, category: 1 },
  { name: 'Xiaomi 14', description: 'สมาร์ทโฟน Xiaomi รุ่นเรือธง', brand: 'Xiaomi', imageUrl: '/images/xiaomi14.jpg', priceAmount: 19900, category: 1 },
  { name: 'Vivo X100', description: 'สมาร์ทโฟน Vivo กล้องเยี่ยม', brand: 'Vivo', imageUrl: '/images/vivox100.jpg', priceAmount: 21900, category: 1 },
  { name: 'Realme C67', description: 'สมาร์ทโฟน Realme คุ้มค่า', brand: 'Realme', imageUrl: '/images/realme_c67.jpg', priceAmount: 6990, category: 1 },
  { name: 'Infinix Hot 40 Pro', description: 'สมาร์ทโฟนจอใหญ่แบตอึด', brand: 'Infinix', imageUrl: '/images/infinix_h40.jpg', priceAmount: 5990, category: 1 },
  { name: 'iPad Pro 12.9"', description: 'แท็บเล็ต Apple ประสิทธิภาพสูง', brand: 'Apple', imageUrl: '/images/ipadpro.jpg', priceAmount: 39900, category: 2 },
  { name: 'Samsung Galaxy Tab S9', description: 'แท็บเล็ต Android ระดับพรีเมียม', brand: 'Samsung', imageUrl: '/images/tabs9.jpg', priceAmount: 27900, category: 2 },
  { name: 'Lenovo Tab P12 Pro', description: 'แท็บเล็ต Lenovo จอใหญ่', brand: 'Lenovo', imageUrl: '/images/lenovo_p12.jpg', priceAmount: 18900, category: 2 },
  { name: 'LG ตู้เย็น 2 ประตู 14 คิว', description: 'ตู้เย็น LG ประหยัดไฟเบอร์ 5', brand: 'LG', imageUrl: '/images/lg_fridge.jpg', priceAmount: 12900, category: 3 },
  { name: 'Samsung เครื่องซักผ้าฝาหน้า 10 กก.', description: 'เครื่องซักผ้า Samsung ประหยัดน้ำ', brand: 'Samsung', imageUrl: '/images/samsung_washer.jpg', priceAmount: 15900, category: 3 },
  { name: 'Daikin แอร์ 12000 BTU', description: 'เครื่องปรับอากาศ Daikin Inverter', brand: 'Daikin', imageUrl: '/images/daikin_ac.jpg', priceAmount: 19900, category: 3 },
  { name: 'Sharp ทีวี 55" 4K', description: 'โทรทัศน์ Sharp AQUOS 4K HDR', brand: 'Sharp', imageUrl: '/images/sharp_tv.jpg', priceAmount: 14900, category: 3 },
  { name: 'ชุดห้องนอน ลินลาว 5 ฟุต', description: 'ชุดเฟอร์นิเจอร์ห้องนอนครบชุด', brand: 'Index Living', imageUrl: '/images/bedroom_set.jpg', priceAmount: 28900, category: 4 },
  { name: 'โซฟา L-Shape 3 ที่นั่ง', description: 'โซฟาหนัง PU ดีไซน์สมัยใหม่', brand: 'SB Design', imageUrl: '/images/sofa_l.jpg', priceAmount: 22900, category: 4 },
  { name: 'ตู้เสื้อผ้าบานเลื่อน 3 บาน', description: 'ตู้เสื้อผ้า MDF ลายไม้สวยงาม', brand: 'Modernform', imageUrl: '/images/wardrobe.jpg', priceAmount: 12900, category: 4 },
  { name: "Honda EM1 e:", description: 'มอเตอร์ไซค์ไฟฟ้า Honda 100% EV', brand: 'Honda', imageUrl: '/images/honda_em1.jpg', priceAmount: 57900, category: 5 },
  { name: "Yamaha Neo's Electric", description: 'สกูตเตอร์ไฟฟ้า Yamaha สมรรถนะสูง', brand: 'Yamaha', imageUrl: '/images/yamaha_neos.jpg', priceAmount: 55900, category: 5 },
  { name: 'Vmoto Soco TC Max', description: 'มอเตอร์ไซค์ไฟฟ้า Vmoto สำหรับซิตี้ไรด์', brand: 'Vmoto', imageUrl: '/images/vmoto_tc.jpg', priceAmount: 49900, category: 5 },
  { name: 'AION Hummingbird', description: 'สกูตเตอร์ไฟฟ้า AION ดีไซน์ทันสมัย', brand: 'AION', imageUrl: '/images/aion_hb.jpg', priceAmount: 39900, category: 5 },
]

async function main() {
  const count = await prisma.product.count()
  if (count > 0) {
    console.log(`Skipping seed — ${count} products already exist.`)
    return
  }
  await prisma.product.createMany({
    data: products.map(p => ({
      name: p.name,
      description: p.description,
      brand: p.brand,
      imageUrl: p.imageUrl,
      priceAmount: p.priceAmount,
      priceCurrency: 'THB',
      category: p.category,
      isAvailable: true,
    })),
  })
  console.log(`Seeded ${products.length} products.`)
}

main()
  .catch(e => { console.error('Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
