import { prisma } from './db/prisma'
import { PrismaCustomerRepository } from './repositories/PrismaCustomerRepository'
import { PrismaProductRepository } from './repositories/PrismaProductRepository'
import { PrismaOrderRepository } from './repositories/PrismaOrderRepository'
import { PrismaPaymentScheduleRepository } from './repositories/PrismaPaymentScheduleRepository'
import { RedisCacheService } from './cache/RedisCacheService'
import { KafkaEventBus } from './messaging/KafkaEventBus'
import { JwtTokenService } from './auth/JwtTokenService'

import { RegisterCustomerCommand } from '../application/customers/commands/RegisterCustomerCommand'
import { LoginCustomerCommand } from '../application/customers/commands/LoginCustomerCommand'
import { GetCustomerProfileQuery } from '../application/customers/queries/GetCustomerProfileQuery'
import { GetProductsQuery } from '../application/products/queries/GetProductsQuery'
import { GetProductByIdQuery } from '../application/products/queries/GetProductByIdQuery'
import { CreateOrderCommand } from '../application/orders/commands/CreateOrderCommand'
import { GetMyOrdersQuery } from '../application/orders/queries/GetMyOrdersQuery'
import { GetPaymentScheduleQuery } from '../application/payments/queries/GetPaymentScheduleQuery'

// Infrastructure
const customerRepo = new PrismaCustomerRepository(prisma)
const productRepo = new PrismaProductRepository(prisma)
const orderRepo = new PrismaOrderRepository(prisma)
const paymentScheduleRepo = new PrismaPaymentScheduleRepository(prisma)
const cache = new RedisCacheService()
const eventBus = new KafkaEventBus()
export const jwtService = new JwtTokenService()

// Application use cases
export const registerCustomer = new RegisterCustomerCommand(customerRepo, eventBus)
export const loginCustomer = new LoginCustomerCommand(customerRepo, jwtService)
export const getCustomerProfile = new GetCustomerProfileQuery(customerRepo, cache)
export const getProducts = new GetProductsQuery(productRepo, cache)
export const getProductById = new GetProductByIdQuery(productRepo, cache)
export const createOrder = new CreateOrderCommand(customerRepo, productRepo, orderRepo, paymentScheduleRepo, eventBus)
export const getMyOrders = new GetMyOrdersQuery(orderRepo)
export const getPaymentSchedule = new GetPaymentScheduleQuery(paymentScheduleRepo)
