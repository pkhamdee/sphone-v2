using Microsoft.EntityFrameworkCore;
using SPhone.Domain.Products;

namespace SPhone.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(SPhoneDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Products.AnyAsync()) return;

        var products = new List<Product>
        {
            // Mobile Phones
            Product.Create("iPhone 16 Pro Max 256GB", "จอ Super Retina XDR 6.9\" ชิป A18 Pro กล้อง 48MP", "Apple", "/images/iphone16pm.jpg", new Money(53900), ProductCategory.MobilePhone),
            Product.Create("iPhone 15 128GB", "จอ Super Retina XDR 6.1\" ชิป A16 Bionic กล้อง 48MP", "Apple", "/images/iphone15.jpg", new Money(29900), ProductCategory.MobilePhone),
            Product.Create("Samsung Galaxy S25 Ultra", "จอ 6.9\" Dynamic AMOLED 2X ชิป Snapdragon 8 Elite", "Samsung", "/images/s25ultra.jpg", new Money(49900), ProductCategory.MobilePhone),
            Product.Create("Samsung Galaxy A55 5G", "จอ 6.6\" Super AMOLED กล้อง 50MP แบตเตอรี่ 5000mAh", "Samsung", "/images/a55.jpg", new Money(14990), ProductCategory.MobilePhone),
            Product.Create("OPPO Find X8 Pro", "จอ 6.78\" AMOLED กล้อง Hasselblad 50MP ชาร์จไว 80W", "OPPO", "/images/findx8pro.jpg", new Money(34990), ProductCategory.MobilePhone),

            // Tablets
            Product.Create("iPad Pro 13\" M4 WiFi 256GB", "จอ Ultra Retina XDR 13\" ชิป M4 รองรับ Apple Pencil Pro", "Apple", "/images/ipadprom4.jpg", new Money(47900), ProductCategory.Tablet),
            Product.Create("iPad Air 11\" M2 WiFi 128GB", "จอ Liquid Retina 11\" ชิป M2 กล้องหน้า 12MP", "Apple", "/images/ipadairm2.jpg", new Money(22900), ProductCategory.Tablet),
            Product.Create("Samsung Galaxy Tab S10+", "จอ 12.4\" Dynamic AMOLED 2X ชิป Snapdragon 8 Gen 3", "Samsung", "/images/tabs10plus.jpg", new Money(32900), ProductCategory.Tablet),
            Product.Create("Xiaomi Pad 7", "จอ 11.2\" 3.2K OLED 144Hz ชิป Snapdragon 7s Gen 3", "Xiaomi", "/images/xiaomipad7.jpg", new Money(12990), ProductCategory.Tablet),

            // Appliances
            Product.Create("LG OLED evo 55\" C4", "TV 4K OLED evo ระบบ WebOS 24 รองรับ Dolby Vision", "LG", "/images/lgc4.jpg", new Money(39990), ProductCategory.Appliance),
            Product.Create("Samsung Bespoke AI Washer 21kg", "เครื่องซักผ้าฝาหน้า AI EcoBubble™ ประหยัดน้ำ 50%", "Samsung", "/images/bespokeai.jpg", new Money(24990), ProductCategory.Appliance),
            Product.Create("Daikin Inverter 12000 BTU", "แอร์อินเวอร์เตอร์ 5 Star R32 ประหยัดไฟเบอร์ 5", "Daikin", "/images/daikin12k.jpg", new Money(18990), ProductCategory.Appliance),
            Product.Create("Panasonic ตู้เย็น 2 ประตู 11.1 คิว", "ตู้เย็น Prime Fresh ระบบ Econavi ประหยัดพลังงาน", "Panasonic", "/images/panasonicfridge.jpg", new Money(12990), ProductCategory.Appliance),
            Product.Create("Dyson V15 Detect Absolute", "เครื่องดูดฝุ่นไร้สาย Laser Detect กรอง HEPA 99.99%", "Dyson", "/images/dysonv15.jpg", new Money(23900), ProductCategory.Appliance),

            // Furniture
            Product.Create("โซฟา L-Shape Premium Velvet", "โซฟาแอลชพ ผ้ากำมะหยี่นุ่ม ปรับเอนได้ พร้อมที่วางแขน USB", "HomePro", "/images/sofa-lshape.jpg", new Money(24990), ProductCategory.Furniture),
            Product.Create("เตียงนอน King Size พร้อมที่นอน", "เตียงไม้แท้ 6 ฟุต พร้อมที่นอน Memory Foam หนา 10 นิ้ว", "DoHome", "/images/bed-king.jpg", new Money(19990), ProductCategory.Furniture),
            Product.Create("ชุดห้องนอนครบเซต 5 ชิ้น", "เตียง+ตู้เสื้อผ้า+โต๊ะเครื่องแป้ง+ตู้หัวเตียง 2 ข้าง ไม้โอ๊คแท้", "Index", "/images/bedroom-set.jpg", new Money(45990), ProductCategory.Furniture),
            Product.Create("โต๊ะทำงาน Standing Desk ไฟฟ้า", "โต๊ะยืนนั่งได้ ปรับความสูงด้วยไฟฟ้า พื้นที่กว้าง 160x80cm", "Flexispot", "/images/standing-desk.jpg", new Money(12990), ProductCategory.Furniture),

            // Electric Motorcycles
            Product.Create("VMOTO Stash 120V", "มอเตอร์ไซค์ไฟฟ้า ระยะทาง 150 กม./ชาร์จ ชาร์จเร็ว 4 ชม.", "VMOTO", "/images/vmoto-stash.jpg", new Money(59900), ProductCategory.ElectricMotorcycle),
            Product.Create("GPX Drone Series 5", "มอเตอร์ไซค์ไฟฟ้า 3000W ความเร็วสูงสุด 90 กม./ชม.", "GPX", "/images/gpx-drone.jpg", new Money(44900), ProductCategory.ElectricMotorcycle),
            Product.Create("Yadea G6 Plus", "สกู๊ตเตอร์ไฟฟ้า ระยะทาง 120 กม. ระบบ Smart Connectivity", "Yadea", "/images/yadea-g6.jpg", new Money(39900), ProductCategory.ElectricMotorcycle),
        };

        await db.Products.AddRangeAsync(products);
        await db.SaveChangesAsync();
    }
}
