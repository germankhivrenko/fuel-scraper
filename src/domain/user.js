const _ = require('lodash')

class User {
  constructor(data) {
    if (!data) {
      return
    }
    const {_id, tgId, maxDistance, subscribed, location, fuels, distance} = data
    this.id = _id
    this.tgId = tgId
    this.maxDistance = maxDistance
    this.subscribed = subscribed
    this.location = location
    this.fuels = fuels
    this.distance = distance
  }

  getIntersectFuels(fuels) {
    return _.intersection(this.fuels, fuels)
  }
}

module.exports = {
  User
}

