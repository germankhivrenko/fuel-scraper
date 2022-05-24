const _ = require('lodash')
const {FUEL_CODES, PURCHASE_MEANS} = require('../')

class WogParser {
  parse(data) {
    const prefix = 'ДП -'
    const line = _.chain(data).split('\n').find((line) => _.includes(line, prefix)).value()

    // map fuel codes

    return [
    ]
  }

  parseFuel(data) {
    // common for all fuels
    const inStock = _.includes(data, 'Пальне відсутнє')

    if (!inStock) {
      return {
        inStock: false,
        desc: data,
        purchaseMeans: null
      }
    }

    const meanPatterns = {
      [PURCHASE_MEANS.cash]: 'Готівка, банк.картки',
      [PURCHASE_MEANS.brand_wallet]: 'Гаманець ПРАЙД',
      [PURCHASE_MEANS.cash]: 'Талони',
      [PURCHASE_MEANS.cash]: 'Паливна картка',
    }
    const meansArr = _.split(data, '.')
    const purchaseMeans = _.mapValues(meanPatterns, (pattern) => {
      const meanStr = _.find(meansArr, (str) => _.includes(str, pattern))
      if (!meanStr) {
        return null
      }

      const limit = this._parseLimit(meanStr)
      return limit || 'unknown'
    })

  }

  _parseLimit(data) {
    const regex = /\d+л|ліміт картки/
    return _.first(data.match(regex))
  }
}

module.exports = {
  WogParser
}

