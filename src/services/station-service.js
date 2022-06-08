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

    const query = {subscribed: true, fuels: appearedFuels}
    const users = await this._userRepository.findNear({location: next.location, query})

    for (const user of users) {
      const wantedFuels = user.getIntersectFuels(appearedFuels)
      const fuelsStr = _.chain(wantedFuels).map(getFuelName).join(', ').value()
      const {brand, desc, location} = next // TODO: add fetchedAt time
      const msg = `${fuelsStr} на ${getBrandName(brand)}\n\n${desc}`
      await this._notificationService.notifyUser(user, {msg, location});
    }
  }
}

module.exports = {
  StationService
}

