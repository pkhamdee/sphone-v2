import { PrismaClient } from '@prisma/client'
import { IProductRepository } from '../../domain/products/IProductRepository'
import { Product } from '../../domain/products/Product'
import { ProductCategory } from '../../domain/products/ProductCategory'

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}

  private mapRow(row: any): Product {
    return Product.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      imageUrl: row.imageUrl,
      priceAmount: Number(row.priceAmount),
      priceCurrency: row.priceCurrency,
      category: row.category,
      isAvailable: row.isAvailable,
      createdAt: row.createdAt,
    })
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({ where: { id } })
    return row ? this.mapRow(row) : null
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.db.product.findMany({ where: { isAvailable: true } })
    return rows.map(r => this.mapRow(r))
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    const rows = await this.db.product.findMany({ where: { category, isAvailable: true } })
    return rows.map(r => this.mapRow(r))
  }
}
