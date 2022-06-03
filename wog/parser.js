const _ = require('lodash')
const {FUELS, MEANS, BRANDS} = require('../const')

class WogParser {
  parse(data) {
    const patterns = {
      [FUELS.ds]: 'ДП -',
      [FUELS.a92]: 'А92 -',
      [FUELS.a95]: 'А95 -',
      [FUELS.a95p]: 'М95 -'
    }
    const fuels = _.chain(patterns)
      .mapValues((pattern, fuel) => {
        const fuelData = _.chain(data)
          .get('workDescription', '')
          .split('\n')
          .find((line) => _.includes(line, pattern))
          .value()

        return this._parseFuel(fuelData)
      })
      .pickBy()
      .value()
    const {longitude, latitude} = _.get(data, 'coordinates', {})

    return {
      externalId: _.get(data, 'id', null),
      brand: BRANDS.wog,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      address: _.get(data, 'name', null),
      fuels,
      fetchedAt: _.get(data, 'fetchedAt', null)
    }
  }

  _parseFuel(fuelData) {
    const inStock = !_.includes(fuelData, 'Пальне відсутнє')

    if (!inStock) {
      return {
        inStock: false,
        desc: fuelData,
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
      desc: fuelData,
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

