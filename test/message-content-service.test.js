const {strict: assert} = require('assert')
const {describe, it} = require('mocha')
const {User} = require('../src/domain/user')
const {Station} = require('../src/domain/station')
const {MessageContentService} = require('../src/message-content-service')
const {FUELS, BRANDS} = require('../src/const')

describe('MessageContentService', function() {
  const msgContentService = new MessageContentService()

  it('creates about message content', function () {
    const actual = msgContentService.getAboutContent()
    const expected = `@FuelHunterBot допомагає шукати обране Вами пальне на найближчих`
      + ` АЗК та негайно отримувати повідомлення про його появу.`
      + ` На даний момент ми відслідковуємо наступні АЗК: OKKO, SOCAR, UPG, WOG.`
      + `\n\nP.S. Відгуки, побажання і т.д. на germankhivrenko@gmail.com`
    assert.equal(actual, expected)
  })

  it('creates help message content', function () {
    const actual = msgContentService.getHelpContent()
    const expected = `Для пошуку та отримання повідомлень Вам потрібно:`
      + `\n/fuels - Обрати бажане паливо`
      + `\n/location - Поділитися локацією`
      + `\n/distance - Обрати радіус пошуку (50 км за замовчуванням)`
      + `\n\nКорисні команди:`
      + `\n/search - Шукати пальне`
      + `\n/settings - Показати налаштування пошуку`
      + `\n/unsubscribe - Скасувати підписку на повідомлення`
      + `\n/subscribe - Підписатить на повідомлення`
      + `\n/help - Допомога`
    assert.equal(actual, expected)
  })

  it('creates start message content', function () {
    const actual = msgContentService.getStartContent()
    const expected = 
      `Ласкаво просимо!`
      + `\n\nДля пошуку та отримання повідомлень Вам потрібно:`
      + `\n/fuels - Обрати бажане паливо`
      + `\n/location - Поділитися локацією`
      + `\n/distance - Обрати радіус пошуку (50 км за замовчуванням)`
      + `\n\nКорисні команди:`
      + `\n/search - Шукати пальне`
      + `\n/settings - Показати налаштування пошуку`
      + `\n/unsubscribe - Скасувати підписку на повідомлення`
      + `\n/subscribe - Підписатить на повідомлення`
      + `\n/help - Допомога`
    assert.equal(actual, expected)
  })

  it('creates fuel on station message content', function () {
    const station = new Station({
      brand: BRANDS.okko,
      address: 'Test Address Line',
      desc: 'Test Station Description',
      fetchedAt: new Date('2022-06-18T16:47:00')
    })
    const fuels = [FUELS.ds, FUELS.dsp]
    const distance = 2500
    const actual = msgContentService.getFuelOnStationContent(station, fuels, distance)
    const expected = 
      `Дизель, Дизель Преміум на OKKO, Test Address Line (2.5 км)`
      + `\n\nTest Station Description`
      + `\n\nP.S. дані на 16:47:00 Сб`
      + `\n/help - допомога`
    assert.equal(actual, expected)
  })

  it('creates nothing found message content', function () {
    const actual = msgContentService.getNothingFoundContent()
    const expected = `За Вашим запитом нічого не знайдено.\n/help - допомога`
    assert.equal(actual, expected)
  })

  it('creates user search settings message content', function () {
    const user = new User({
      fuels: [FUELS.a95, FUELS.a95p],
      maxDistance: 15000,
      location: {
        type: 'Point',
        coordinates: [50, 50]
      }
    })
    const actual = msgContentService.getSearchSettings(user)
    const expected = `Слідкуємо за A95, A95 Преміум в радіусі 15 км. Шукати - /search`
    assert.equal(actual, expected)
  })
})

