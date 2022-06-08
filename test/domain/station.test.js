const {ObjectId} = require('mongodb')
const {strict: assert} = require('assert')
const {describe, it} = require('mocha')
const {BRANDS, MEANS, FUELS} = require('../../src/const')
const {Station} = require('../../src/domain/station')

describe('Station', function() {
  const station = new Station({
    id: new ObjectId('629a5e3ff27d4d1f97d1186e'),
    brand: BRANDS.okko,
    externalId: 40112000,
    address: 'м. Ходорів, вул. Шевченка, 12-А',
    fetchedAt: new Date('2022-06-06T08:27:56.562Z'),
    desc: '',
    location: {
      type: 'Point',
      coordinates: [30.482658, 50.506652]
    },
    fuels: {
      [FUELS.ds]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.dsp]: {
        inStock: true,
        means: {
          [MEANS.coupon]: 'description',
          [MEANS.fuel_card]: 'description'
        }
      }
    }
  })

  it('returns true if has fuel with cash mean', function() {
    const actual = station.hasFuel(FUELS.ds)
    assert.equal(actual, true)
  })

  it('returns false if has no cash mean for fuel', function() {
    const actual = station.hasFuel(FUELS.dsp)
    assert.equal(actual, false)
  })
})

