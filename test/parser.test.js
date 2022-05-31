const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {FUELS, MEANS, BRANDS} = require('../const')
const {WogParser} = require('../wog/parser')

describe('WogParser', function() {
  it('parse()', function() {
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

