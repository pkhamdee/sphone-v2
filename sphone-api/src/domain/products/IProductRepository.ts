import { Product } from './Product'
import { ProductCategory } from './ProductCategory'

export interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findAll(): Promise<Product[]>
  findByCategory(category: ProductCategory): Promise<Product[]>
}
