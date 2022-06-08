const _ = require('lodash')

class User {
  constructor({id, tgId, maxDistance, subscribed, location, fuels} = {}) {
    this.id = id
    this.tgId = tgId
    this.maxDistance = maxDistance
    this.subscribed = subscribed
    this.location = location
    this.fuels = fuels
  }

  getIntersectFuels(fuels) {
    return _.intersection(this.fuels, fuels)
  }
}

module.exports = {
  User
}

