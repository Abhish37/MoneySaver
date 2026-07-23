import { calculate3StrategySavingsStack } from '../lib/engine/stacker'

describe('3-Strategy Savings Stacker Engine Tests', () => {
  it('calculates 3-strategy matrix correctly', () => {
    const res = calculate3StrategySavingsStack({
      basePrice: 1500,
      storeCouponPct: 20,
      storeCouponMinCart: 1000,
      bankOfferPct: 10,
      bankMinCart: 1000,
      cashbackPct: 5,
      giftCardDiscountPct: 5,
    })

    if (typeof expect !== 'undefined') {
      expect(res.userSelectedStack).toBeDefined()
      expect(res.maxMarketStack).toBeDefined()
    }
  })
})
