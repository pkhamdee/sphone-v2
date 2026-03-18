import { IProductRepository } from '../../../domain/products/IProductRepository'
import { ICacheService } from '../../ports/ICacheService'
import { ProductDto } from './GetProductsQuery'

export class GetProductByIdQuery {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(productId: string): Promise<ProductDto> {
    const cacheKey = `products:${productId}`
    const cached = await this.cache.get<ProductDto>(cacheKey)
    if (cached) return cached

    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    const dto: ProductDto = {
      id: product.id.value,
      name: product.name,
      description: product.description,
      brand: product.brand,
      imageUrl: product.imageUrl,
      price: product.price.amount,
      currency: product.price.currency,
      category: product.category,
      isAvailable: product.isAvailable,
    }

    await this.cache.set(cacheKey, dto, 600)
    return dto
  }
}
