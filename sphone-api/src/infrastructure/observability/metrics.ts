import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('sphone-api', '1.0.0')

export const ordersCreatedCounter = meter.createCounter('orders.created', {
  description: 'Total number of orders created',
  unit: '{order}',
})

export const customersRegisteredCounter = meter.createCounter('customers.registered', {
  description: 'Total number of customers registered',
  unit: '{customer}',
})

export const orderInstallmentAmountHistogram = meter.createHistogram('order.installment.amount.thb', {
  description: 'Monthly installment amount in THB',
  unit: 'THB',
})
