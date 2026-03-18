import { IProductRepository } from '../../../domain/products/IProductRepository'
import { ProductCategory } from '../../../domain/products/ProductCategory'
import { ICacheService } from '../../ports/ICacheService'

export interface ProductDto {
  id: string
  name: string
  description: string
  brand: string
  imageUrl: string
  price: number
  currency: string
  category: number
  isAvailable: boolean
}

export class GetProductsQuery {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(category?: number): Promise<ProductDto[]> {
    const cacheKey = category ? `products:category:${category}` : 'products:all'
    const cached = await this.cache.get<ProductDto[]>(cacheKey)
    if (cached) return cached

    const products = category
      ? await this.productRepo.findByCategory(category as ProductCategory)
      : await this.productRepo.findAll()

    const dtos: ProductDto[] = products.map(p => ({
      id: p.id.value,
      name: p.name,
      description: p.description,
      brand: p.brand,
      imageUrl: p.imageUrl,
      price: p.price.amount,
      currency: p.price.currency,
      category: p.category,
      isAvailable: p.isAvailable,
    }))

    await this.cache.set(cacheKey, dtos, 600)
    return dtos
  }
}
