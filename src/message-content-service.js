const _ = require('lodash')
const {BRANDS, getBrandName, getFuelName} = require('./const')

const DAY_NAMES = ['Нед', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

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
      + `\n/distance - Обрати радіус пошуку (10 км за замовчуванням)`
      + `\n\nКорисні команди:`
      + `\n/search - Шукати пальне`
      + `\n/settings - Показати налаштування пошуку`
      + `\n/unsubscribe - Скасувати підписку на повідомлення`
      + `\n/subscribe - Підписатить на повідомлення`
      + `\n/help - Допомога`
  }

  getStartContent() {
    return `Ласкаво просимо!\n\n` + this.getHelpContent()
  } 

  getFuelOnStationContent(station, fuels, distance) {
    const fuelsStr = _.chain(fuels).map(getFuelName).join(', ').value()
    const distanceStr = `(${this._formatDistance(distance)})`
    const dayName = DAY_NAMES[station.fetchedAt.getDay()]
    const timeStr = station.fetchedAt.toLocaleTimeString('en-GB', {timeZone: 'Europe/Helsinki'})

    return `${fuelsStr} на ${getBrandName(station.brand)}, ${station.address} ${distanceStr}`
      + `\n\n${station.desc}`
      + `\n\nP.S. дані на ${timeStr} ${dayName}`
  }

  getNothingFoundContent() {
    return `За Вашим запитом нічого не знайдено. /help - допомога`
  }

  getSearchSettings(user) {
    if (_.isEmpty(user.fuels)) {
      return `Пальне для пошуку не вибране - /fuels`
    }

    const fuelsStr = _.chain(user.fuels).map(getFuelName).join(', ').value()
    const distanceStr = this._formatDistance(user.maxDistance)

    const settingsStr = `Слідкуємо за ${fuelsStr} в радіусі ${distanceStr}`

    if (_.isEmpty(user.location)) {
      return `${settingsStr}. Але Ви не поділились локацією - /location`
    }

    return `${settingsStr}. Шукати - /search`
  }

  _formatDistance(distance) {
    return _.round(distance / 1000, 2) + ' км'
  }
}

module.exports = {
  MessageContentService
}

