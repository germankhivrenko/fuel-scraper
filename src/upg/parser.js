const _ = require('lodash')
const {convert} = require('html-to-text')
const {FUELS, MEANS, BRANDS} = require('../const')
const {Parser} = require('../parser')

class UpgParser extends Parser {
  static FUEL_IDS = {
    '5': FUELS.dp,
    '1': FUELS.dsp,
    // 'not exist': FUELS.a92,
    '2': FUELS.a95,
    '9': FUELS.a95p,
    '4': FUELS.gs
  }

  parse(data) {
    const {
      id,
      Address,
      FullName,
      Latitude,
      Longitude,
      fetchedAt,
      FuelsAsArray
    } = data

    const fuels = _.chain(FuelsAsArray)
      .filter(({Price}) => Price !== '0.00')
      .reduce((acc, {id, Price}) => {
        return {
          ...acc,
          [UpgParser.FUEL_IDS[id]]: {
            inStock: true,
            means: {
              [MEANS.cash]: Price
            }
          }
        }
      }, {})
      .value()

    return {
      externalId: id,
      brand: BRANDS.upg,
      address: Address,
      desc: FullName,
      location: {
        type: 'Point',
        coordinates: [_.toNumber(Longitude), _.toNumber(Latitude)]
      },
      fuels,
      fetchedAt
    }
  }

  _parseLimit(str) {
    const regex = /до.*$/g
    return _.first(str.match(regex)) || 'unknown'
  }
}

module.exports = {
  UpgParser
}

