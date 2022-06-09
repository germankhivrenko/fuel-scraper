const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS, BRANDS} = require('../../src/const')
const {SocarParser} = require('../../src/socar/parser')

describe('SocarParser', function() {
  it('parses raw staion data', function() {
    const raw = {
      id: '43',
      type: 'stations',
      fetchedAt: new Date('2022-05-26T21:12:00'),
      attributes: {
        title: 'SOCAR 01001',
        tel: '800508585',
        street_slug: 'limanna28',
        services: [],
        marker: {lat: 46.542775526561, lng: 30.739531517029},
        address: 'Одесская обл., г. Одесса, ул. Лиманная 28',
        city_slug: 'odessa',
        fuelPrices: [
          'NANO 95 (51.99)', // a95p
          'NANO ДТ (56.99)', // ds
          'Diesel Nano Extro (57.99)' // dsp
        ]
      }
    } 
    const expected = {
      externalId: '43',
      brand: BRANDS.socar,
      location: {
        type: 'Point',
        coordinates: [30.739531517029, 46.542775526561]
      },
      address: 'Одесская обл., г. Одесса, ул. Лиманная 28',
      desc: 'Телефон: 800508585',
      fuels: {
        [FUELS.ds]: {
          inStock: true,
          means: {
            [MEANS.cash]: 'NANO ДТ (56.99)',
          }
        },
        [FUELS.dsp]: {
          inStock: true,
          means: {
            [MEANS.cash]: 'Diesel Nano Extro (57.99)',
          }
        },
        [FUELS.a95p]: {
          inStock: true,
          means: {
            [MEANS.cash]: 'NANO 95 (51.99)',
          }
        }
      }
    }

    const parser = new SocarParser()
    const actual = parser.parse(raw)

    assert.deepEqual(_.omit(actual, 'fetchedAt'), expected)
    assert.equal(actual.fetchedAt - new Date('2022-05-26T21:12:00'), 0)
  })
})

