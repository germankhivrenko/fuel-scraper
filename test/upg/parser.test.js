const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS, BRANDS} = require('../../src/const')
const {UpgParser} = require('../../src/upg/parser')

describe('UpgParser', function() {
  it('parses raw station data', function() {
    const data = {
      Active: true,
      Address: "Чернівецька обл., Глибоцький р-н, с. Тереблече, вул. Головна, 139В",
      FuelsAsArray: [
        {id: 1, Title: 'upg DP', Price: '0.00'},
        {id: 2, Title: '95 (передоплата)', Price: '0.00'},
        {id: 4, Title: 'Газ', Price: '0.00'},
        {id: 5, Title: 'ДП (передоплата)', Price: '0.00'},
        {id: 9, Title: 'upg 95', Price: '49.00'}
      ],
      FullName: "АЗС №103 06:00 - 22:00",
      LastPriceUpdateDate: "2022-06-09",
      Latitude: "47.99862300",
      Longitude: "26.05029400",
      Region: "Чернівецька",
      ServicesAsArray: [],
      ShortName: "",
      VersionId: 838,
      id: 126,
      fetchedAt: new Date('2022-05-26T21:12:00')
    }
    const parser = new UpgParser()
    const actual = parser.parse(data)
    
    const expected = {
      externalId: 126,
      brand: BRANDS.upg,
      location: {
        type: 'Point',
        coordinates: [26.05029400, 47.99862300]
      },
      address: 'Чернівецька обл., Глибоцький р-н, с. Тереблече, вул. Головна, 139В',
      desc: 'АЗС №103 06:00 - 22:00',
      fuels: {
        [FUELS.a95p]: {
          inStock: true,
          means: {
            [MEANS.cash]: '49.00',
          }
        }
      }
    }

    assert.deepEqual(_.omit(actual, 'fetchedAt'), expected)
    assert.equal(actual.fetchedAt - new Date('2022-05-26T21:12:00'), 0)
  })
})
