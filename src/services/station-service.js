const _ = require('lodash')
const {FUELS, getFuelName, getBrandName} = require('../const')

class StationService {
  constructor(userRepository, notificationService, messageContentService) {
    this._userRepository = userRepository 
    this._notificationService = notificationService
    this._messageContentService = messageContentService
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
      const fuels = user.getIntersectFuels(appearedFuels)
      const {location} = next
      const msg = this._messageContentService.getFuelOnStationContent(next, fuels, user.distance)
      try {
        await this._notificationService.notifyUser(user, {msg, location});
      } catch(err) {
        console.log(err)
        const errCode = _.get(err, 'response.error_code')
        if (errCode === 403) {
          await this._userRepository.updateOne({tgId: user.tgId}, {subscribed: false})
        }
      }
    }
  }
}

module.exports = {
  StationService
}

