const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS, BRANDS} = require('../const')
const {WogParser} = require('../wog/parser')
const {OkkoParser} = require('../okko/parser')

describe('Parser', function() {
  describe('WogParser', function() {
    it('WogParser parse()', function() {
      const stationData = {
        link: 'https://api.wog.ua/fuel_stations/807',
        city: 'Могилів-Подільський',
        coordinates: {longitude: 27.796942, latitude: 48.451743},
        workDescription: 'АЗК працює згідно графіку.\n' +
          'М95 - Пальне відсутнє.\n' +
          'А95 - тільки спецтранспорт.\n' +
          'А92 - Пальне відсутнє.\n' +
          'ДП - Готівка, банк.картки 20л. Гаманець ПРАЙД до 100л. Талони до 40л. Паливна картка (ліміт картки).\n',
        fuels: [
          {cla: '#5d71b1', brand: 'Євро5', name: 'ДП', id: 9},
          {cla: '#5d71b1', brand: 'Євро5', name: '92', id: 8},
          {cla: '#5d71b1', brand: 'Євро5', name: '95', id: 2},
          {cla: '#cf5c72', brand: 'Mustang', name: '95', id: 5}
        ],
        services: [
          {icon: 'vilka', name: 'Розетка', id: 1},
          {icon: 'wogpride', name: 'WOG Pride', id: 2},
          {icon: 'carwash', name: 'Мийка', id: 3},
          {icon: 'tirefitting', name: 'Підкачка шин', id: 4},
          {icon: 'parking', name: 'Паркінг', id: 5},
          {icon: 'wc', name: 'Туалет', id: 6},
          {icon: 'wifi', name: 'WI-FI', id: 7},
          {icon: 'wogcafe', name: 'WOG Cafe', id: 8},
          {icon: 'wogmarket', name: 'WOG Market', id: 9},
          {icon: 'charge', name: 'Зарядка', id: 10},
          {icon: 'ibox', name: 'IBox', id: 13}
        ],
        schedule: [{day: 'Сьогодні', interval: '05:00 - 23:00'}],
        name: 'Вінницька обл., м.Могилів-Подільський, вул.Пушкіна, 74',
        id: 807,
        fetchedAt: new Date('2022-05-26T21:12:00')
      } 
  
      const parser = new WogParser()
      const actual = parser.parse(stationData)
      const expected = {
        externalId: 807,
        brand: BRANDS.wog,
        location: {
          type: 'Point',
          coordinates: [27.796942, 48.451743]
        },
        address: 'Вінницька обл., м.Могилів-Подільський, вул.Пушкіна, 74',
        fuels: {
          [FUELS.ds]: {
            inStock: true,
            desc: 'ДП - Готівка, банк.картки 20л. Гаманець ПРАЙД до 100л. Талони до 40л. Паливна картка (ліміт картки).',
            means: {
              [MEANS.cash]: '20л',
              [MEANS.brand_wallet]: '100л',
              [MEANS.coupon]: '40л',
              [MEANS.fuel_card]: 'ліміт картки',
            }
          },
          [FUELS.a92]: {
            inStock: false,
            desc: 'А92 - Пальне відсутнє.',
            means: null
          },
          [FUELS.a95]: {
            inStock: true,
            desc: 'А95 - тільки спецтранспорт.',
            means: {
              [MEANS.special_transport]: 'unknown'
            }
          },
          [FUELS.a95p]: {
            inStock: false,
            desc: 'М95 - Пальне відсутнє.',
            means: null
          },
        }
      }
  
      assert.deepEqual(_.omit(actual, 'fetchedAt'), expected)
      assert.equal(actual.fetchedAt - new Date('2022-05-26T21:12:00'), 0)
    })
  })

  describe('OkkoParser', function() {
    it('OkkoParser parse()', function() {
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
        widgets: []
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

      assert.deepEqual(actual, expected)
    })
  })
})

