const _ = require('lodash')
const {FUELS, MEANS, BRANDS} = require('../const')
const {Parser} = require('../parser')

class SocarParser extends Parser {
  // TODO: add all fuels
  static FUEL_PATTERNS = {
    ['NANO ДТ']: FUELS.ds,
    ['Diesel Nano Extro']: FUELS.dsp,
    // [FUELS.a92]: 'А92 -',
    // [FUELS.a95]: 'А95 -',
    ['NANO 95']: FUELS.a95p
  }

  parse(data) {
    const {
      id,
      fetchedAt,
      attributes: {
        marker: {lat, lng},
        address,
        tel,
        fuelPrices
      }
    } = data

    const fuels = _.chain(fuelPrices)
      .map((rawFuel) => {
        const fuel = _.find(SocarParser.FUEL_PATTERNS, (fuel, pattern) => {
          const fuelName = rawFuel.name || rawFuel
          return fuelName.match(pattern)
        }) 

        return ({fuel, desc: rawFuel})
      })
      .filter(({fuel}) => fuel)
      .reduce((acc, {fuel, desc}) => ({
        ...acc,
        [fuel]: {
          inStock: true, 
          means: {[MEANS.cash]: desc}
        }
      }), {})
      .value()

    return {
      externalId: id,
      brand: BRANDS.socar,
      fetchedAt,
      location: {type: 'Point', coordinates: [lng, lat]},
      address,
      desc: `Телефон: ${tel}`,
      fuels
    }
  }
}

module.exports = {
  SocarParser
}

