const _ = require('lodash')
const {FUELS, getFuelName, getBrandName} = require('../const')

class StationService {
  constructor(userRepository, notificationService) {
    this._userRepository = userRepository 
    this._notificationService = notificationService
  }

  async handleChange(curr, next) {
    const omitFetchedAt = (station) => _.omit(station, 'fetchedAt')
    if (_.isEqual(omitFetchedAt(curr), omitFetchedAt(next))) {
      return
    }

    const appearedFuels = _.filter(FUELS, (fuel) => {
      return !curr.hasFuel(fuel) && next.hasFuel(fuel)
    })

    if (_.isEmpty(appearedFuels)) {
      return
    }
    console.log('=============== FUELS')
    console.log(appearedFuels)

    const query = {subscribed: true, fuels: {$in: appearedFuels}}
    const users = await this._userRepository.findNear({location: next.location, query})
    console.log('=============== USERS')
    console.log(_.map(users, 'id'))

    for (const user of users) {
      const wantedFuels = user.getIntersectFuels(appearedFuels)
      const fuelsStr = _.chain(wantedFuels).map(getFuelName).join(', ').value()
      const {brand, address, desc, location} = next // TODO: add fetchedAt time
      const km = _.round(user.distance / 1000, 1)
      const msg = `${fuelsStr} на ${getBrandName(brand)}, ${address} (${km} км)\n\n${desc}`
      try {
        await this._notificationService.notifyUser(user, {msg, location});
      } catch(err) {
        console.log(err)
        if (err.response && err.response.statusCode === 403) {
          await this._userRepository.updateOne({tgId: user.tgId}, {subscribed: false})
        }
      }
    }
  }
}

module.exports = {
  StationService
}

