const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS, BRANDS} = require('../../src/const')
const {OkkoParser} = require('../../src/okko/parser')

describe('OkkoParser', function() {
  it('parses raw station data', function() {
    const data = {
      attributes: {
        Cod_AZK: 40815600,
        Oblast: [],
        Naselenyy_punkt: 'Городище',
        Typ_naselenogo_punktu: 'с.',
        Adresa: 'вул. Городищенська, буд. 1, АЗС №77',
        Typ_obektu: { attributes: { code: 'azs', name: 'АЗК' }, widgets: [] },
        fuel_type: [
          { attributes: { code: 'Pulls95', name: 'Pulls95' }, widgets: [] },
          {
            attributes: { code: 'A95_EVRO', name: 'A95_EVRO' },
            widgets: []
          }
        ],
        restaurants: [],
        car_services: [],
        car_washes: [],
        other_services: [],
        coordinates: {lat: 51.290084, lng: 32.761247},
        rozdilnyy_zbir: [],
        post_machines: [],
        notification: '<p><strong><span style="text-decoration: underline;">Графік роботи:</span> з 7:00 до 21:00.</strong></p>\n' +
          '<p style="text-transform:uppercase"><strong>За готівку і банківські картки доступно*:</strong></p>\n' +
          '<ol>\n' +
          '<li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>А-95</strong>: до 15 л з Fishka або згідно з персональним лімітом</li>\n' +
          '</ol>\n' +
          '<p style="text-transform:uppercase"><strong>З паливною карткою і талонами доступно:</strong></p>\n' +
          '<ol>\n' +
          '<li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>PULLS 95</strong>: до 20 л</li>\n' +
          '<li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>А-95</strong>: до 20 л</li>\n' +
          '</ol>\n' +
          '<div><p>*при досягненні залишків пального на АЗК критичного рівня, відпуск не здійснюється.</p></div>',
        type_azk: 2
      },
      widgets: [],
      fetchedAt: new Date('2022-05-26T21:12:00')
    }
    const parser = new OkkoParser()
    const actual = parser.parse(data)
    
    const expected = {
      externalId: 40815600,
      brand: BRANDS.okko,
      location: {
        type: 'Point',
        coordinates: [32.761247, 51.290084]
      },
      address: 'с. Городище, вул. Городищенська, буд. 1',
      desc: 'Графік роботи: з 7:00 до 21:00.\n' +
        'За готівку і банківські картки доступно*:\n' +
        ' 1. А-95: до 15 л з Fishka або згідно з персональним лімітом\n' +
        'З паливною карткою і талонами доступно:\n' +
        ' 1. PULLS 95: до 20 л\n' +
        ' 2. А-95: до 20 л\n' +
        '*при досягненні залишків пального на АЗК критичного рівня, відпуск не\nздійснюється.',
      fuels: {
        [FUELS.a95]: {
          inStock: true,
          means: {
            [MEANS.cash]: 'до 15 л з Fishka або згідно з персональним лімітом',
            [MEANS.fuel_card]: 'до 20 л',
            [MEANS.coupon]: 'до 20 л'
          }
        },
        [FUELS.a95p]: {
          inStock: true,
          means: {
            [MEANS.fuel_card]: 'до 20 л',
            [MEANS.coupon]: 'до 20 л'
          }
        },
      }
    }

    assert.deepEqual(_.omit(actual, 'fetchedAt'), expected)
    assert.equal(actual.fetchedAt - new Date('2022-05-26T21:12:00'), 0)
  })
})
