const _ = require('lodash')
const {FUELS, MEANS, BRANDS} = require('../const')

class WogParser {
  // TODO: add gas
  static FUEL_PATTERNS = {
    [FUELS.ds]: 'ДП -',
    [FUELS.a92]: 'А92 -',
    [FUELS.a95]: 'А95 -',
    [FUELS.a95p]: 'М95 -'
  }

  parse(data) {
    const fuels = _.chain(WogParser.FUEL_PATTERNS)
      .mapValues((pattern, fuel) => {
        const fuelData = _.chain(data.workDescription)
          .split('\n')
          .find((line) => _.includes(line, pattern))
          .value()

        return this._parseFuel(fuelData)
      })
      .pickBy()
      .value()
    const {coordinates: {longitude, latitude}} = data

    return {
      externalId: data.id,
      brand: BRANDS.wog,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      address: data.name,
      fuels,
      fetchedAt: data.fetchedAt,
      desc: data.workDescription
    }
  }

  _parseFuel(fuelData) {
    const inStock = !_.includes(fuelData, 'Пальне відсутнє')

    if (!inStock) {
      return {
        inStock: false,
        means: null
      }
    }

    const patterns = {
      [MEANS.cash]: 'Готівка, банк.картки',
      [MEANS.brand_wallet]: 'Гаманець ПРАЙД',
      [MEANS.coupon]: 'Талони',
      [MEANS.fuel_card]: 'Паливна картка',
      [MEANS.special_transport]: 'тільки спецтранспорт'
    }
    const meanDataArr = _.split(fuelData, '. ')
    const means = _.chain(patterns)
      .mapValues((pattern, mean) => {
        const meanData = _.find(meanDataArr, (meanData) => _.includes(meanData, pattern))
        if (!meanData) {
          return null
        }

        const limit = this._parseLimit(meanData)
        return limit
      })
      .pickBy()
      .value()

    return {
      inStock: true,
      means
    }
  }

  _parseLimit(data) {
    const regex = /\d+л|ліміт картки/
    return _.first(data.match(regex)) || 'unknown'
  }
}

module.exports = {
  WogParser
}

