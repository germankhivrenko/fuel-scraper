const _ = require('lodash')
const {BRANDS, getBrandName, getFuelName} = require('./const')

class MessageContentService {
  getAboutContent() {
    const brandsStr = _.chain(BRANDS).map(getBrandName).sortBy().join(', ').value()
    return `@FuelHunterBot допомагає шукати обране Вами пальне на найближчих`
      + ` АЗК та негайно отримувати повідомлення про його появу.`
      + ` На даний момент ми відслідковуємо наступні АЗК: ${brandsStr}.`
      + `\n\nP.S. Відгуки, побажання і т.д. на germankhivrenko@gmail.com`
  }

  getHelpContent() {
    return `Для пошуку та отримання повідомлень Вам потрібно:`
      + `\n/fuels - Обрати бажане паливо`
      + `\n/location - Поділитися локацією`
      + `\n/distance - Обрати радіус пошуку (50 км за замовчуванням)`
      + `\nКорисні команди:`
      + `\n/search - Шукати пальне`
      + `\n/settings - Показати налаштування пошуку`
      + `\n/unsubscribe - Скасувати підписку на повідомлення`
      + `\n/subscribe -  Підписатить на повідомлення`
  }

  getStartContent() {
    return `Ласкаво просимо!\n\n` + this.getHelpContent()
  } 

  getFuelOnStationContent(station, fuels, distance) {
    const fuelsStr = _.chain(fuels).map(getFuelName).join(', ').value()
    const distanceStr = `(${this._formatDistance(distance)})`
    const timeStr = station.fetchedAt.toLocaleTimeString('en-GB', {timeZone: 'Europe/Helsinki'})

    return `${fuelsStr} на ${getBrandName(station.brand)}, ${station.address} ${distanceStr}`
      + `\n\n${station.desc}`
      + `\n\nP.S. дані на ${timeStr}`
      + `\n/help - допомога`
  }

  getNothingFoundContent() {
    return `За Вашим запитом нічого не знайдено.\n/help - допомога`
  }

  getSearchSettings(user) {
    if (_.isEmpty(user.fuels)) {
      return `Пальне для пошуку не вибране - /fuels`
    }

    if (_.isEmpty(user.location)) {
      return `Ви не поділились локацією - /location`
    }

    const fuelsStr = _.chain(user.fuels).map(getFuelName).join(', ').value()
    const distanceStr = this._formatDistance(user.maxDistance)

    return `Пошук ${fuelsStr} в радіусі ${distanceStr}`
  }

  _formatDistance(distance) {
    return _.round(distance / 1000, 2) + ' км'
  }
}

module.exports = {
  MessageContentService
}

