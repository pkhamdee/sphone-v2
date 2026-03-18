import { AggregateRoot } from '../shared/AggregateRoot'
import { ProductId } from './ProductId'
import { Money } from './Money'
import { ProductCategory } from './ProductCategory'

export class Product extends AggregateRoot {
  private constructor(
    private readonly _id: ProductId,
    private _name: string,
    private _description: string,
    private _brand: string,
    private _imageUrl: string,
    private _price: Money,
    private _category: ProductCategory,
    private _isAvailable: boolean,
    private readonly _createdAt: Date,
  ) {
    super()
  }

  get id(): ProductId { return this._id }
  get name(): string { return this._name }
  get description(): string { return this._description }
  get brand(): string { return this._brand }
  get imageUrl(): string { return this._imageUrl }
  get price(): Money { return this._price }
  get category(): ProductCategory { return this._category }
  get isAvailable(): boolean { return this._isAvailable }
  get createdAt(): Date { return this._createdAt }

  static reconstitute(params: {
    id: string
    name: string
    description: string
    brand: string
    imageUrl: string
    priceAmount: number
    priceCurrency: string
    category: number
    isAvailable: boolean
    createdAt: Date
  }): Product {
    return new Product(
      ProductId.create(params.id),
      params.name,
      params.description,
      params.brand,
      params.imageUrl,
      Money.create(params.priceAmount, params.priceCurrency),
      params.category as ProductCategory,
      params.isAvailable,
      params.createdAt,
    )
  }
}
