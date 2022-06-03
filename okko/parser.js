const _ = require('lodash')
const {convert} = require('html-to-text')
const {FUELS, MEANS, BRANDS} = require('../const')

const toFuels = (means) => {
  return _.chain(means)
    .mapValues('fuels')
    .flatMap(_.keys)
    .uniq()
    .reduce((acc, fuel) => {
      return {
        ...acc, 
        [fuel]: {
          inStock: true, 
          means: _.reduce(MEANS, (acc, mean) => {
            const limit = _.get(means, `${mean}.fuels.${fuel}`)
            return limit ? {...acc, [mean]: limit} : acc
          }, {})
        }
      }
    }, {})
    .value()
}
// TODO: const toMeans = (fuels) => {}

class OkkoParser {
  // TODO: A92
  static FUEL_CODES = {
    'DP_EVRO': FUELS.ds,
    'PullsDiesel': FUELS.dsp,
    'A95_EVRO': FUELS.a95,
    'Pulls95': FUELS.a95p,
    'Gas': FUELS.gs
  }
  static FUEL_PATTERNS = {
    // TODO: fill all
    [FUELS.ds]: 'Not Implemented',
    [FUELS.dsp]: 'Not Implemented',
    [FUELS.a92]: 'А-92: ',
    [FUELS.a95]: 'А-95: ',
    [FUELS.a95p]: 'PULLS 95: ',
    [FUELS.gs]: 'Not Implemented'
  }
  static MEAN_PATTERNS = {
    // TODO: fill all
    [MEANS.cash]: 'За готівку і банківські картки доступно*:',
    [MEANS.coupon]: 'З паливною карткою і талонами доступно:',
    [MEANS.fuel_card]: 'З паливною карткою і талонами доступно:',
    [MEANS.brand_wallet]: 'Not Implemented',
    [MEANS.special_transport]: 'Not Implemented'
  }

  parse(data) {
    const {
      attributes: {
        Cod_AZK,
        Typ_naselenogo_punktu,
        Naselenyy_punkt,
        Adresa,
        notification,
        fuel_type,
        coordinates: {lng, lat}
      }
    } = data

    const address = Typ_naselenogo_punktu + ' ' + Naselenyy_punkt + 
      ', ' + _.chain(Adresa).split(',').slice(0, -1).join().value()
    const descStr = convert(notification) 
    const descStrSplit = _.split(descStr, '\n\n')
    const means = _.reduce(MEANS, (acc, mean) => {
      const index = _.findIndex(descStrSplit, (str) => {
        const pattern = OkkoParser.MEAN_PATTERNS[mean]
        if (!pattern) return false
        const removeWildcards = (s) => _.replace(s, '*', '')
        return removeWildcards(str).match(removeWildcards(pattern))
      })
      if (index === -1) return acc

      const meanStrSplit = _.split(descStrSplit[index + 1], '\n')
      const fuels = _.reduce(FUELS, (acc, fuel) => {
        const pattern = OkkoParser.FUEL_PATTERNS[fuel] 
        if (!pattern) return acc
        const fuelStr = _.find(meanStrSplit, (str) => str.match(pattern))
        if (!fuelStr) return acc

        return {...acc, [fuel]: this._parseLimit(fuelStr)}
      }, {})

      return {...acc, [mean]: {fuels}}
    }, {})
    

    return {
      externalId: Cod_AZK,
      brand: BRANDS.okko,
      address,
      desc: _.join(descStrSplit, '\n'),
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      fuels: toFuels(means)
    }
  }

  _parseLimit(str) {
    const regex = /до.*$/g
    return _.first(str.match(regex)) || 'unknown'
  }
}

module.exports = {
  OkkoParser
}

