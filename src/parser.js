const _ = require('lodash')
const {MEANS} = require('./const')

class Parser {
  parse(raw) {
    throw new Error('Not Implemented')
  }

  toFuels(means) {
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
              const desc = _.get(means, `${mean}.fuels.${fuel}`)
              return desc ? {...acc, [mean]: desc} : acc
            }, {})
          }
        }
      }, {})
      .value()
  }
}

module.exports = {
  Parser
}

