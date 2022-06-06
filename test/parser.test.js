const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS} = require('../src/const')
const {Parser} = require('../src/parser')

describe('Parser', function() {
  it('converts means to fuels format', function() {
    const means = {
      [MEANS.cash]: {
        fuels: {
          [FUELS.ds]: 'cash ds description',
          [FUELS.dsp]: 'cash dsp description',
          [FUELS.a95]: 'cash a95 description'
        }
      },
      [MEANS.coupon]: {
        fuels: {
          [FUELS.ds]: 'coupon ds description',
          [FUELS.dsp]: 'coupon dsp description',
        }
      },
      [MEANS.fuel_card]: {
        fuels: {
          [FUELS.a95]: 'fuel_card a95 description'
        }
      }
    }
    const expected = {
      [FUELS.ds]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'cash ds description',
          [MEANS.coupon]: 'coupon ds description'
        }
      },
      [FUELS.dsp]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'cash dsp description',
          [MEANS.coupon]: 'coupon dsp description'
        }
      },
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'cash a95 description',
          [MEANS.fuel_card]: 'fuel_card a95 description'
        }
      }
    }

    const parser = new Parser()
    const actual = parser.toFuels(means)

    assert.deepEqual(actual, expected)
  })
})

