const _ = require('lodash')
const {MEANS} = require('../const')

class Station {
  constructor(data) {
    if (!data) {
      return
    }
    
    const {_id, brand, externalId, address, desc, fetchedAt, location, fuels} = data

    this.id = _id
    this.brand = brand
    this.externalId = externalId
    this.address = address
    this.desc = desc
    this.fetchedAt = fetchedAt
    this.location = location
    this.fuels = fuels
  }

  hasFuel(fuel) {
    return _.chain(this.fuels).get(`${fuel}.means`).has(MEANS.cash).value()
  }
}

module.exports = {
  Station
}

