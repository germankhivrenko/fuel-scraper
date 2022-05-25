const _ = require('lodash')

class WogScraper {
  constructor(wogService, parser) {
    this._wogService = wogService
    this._parser = parser
  }

  async scrapeStations() {
    const data = await this._wogService.fetchStationList()
    const stationIds = _.chain(data).get('stations', []).map('id').compact().value()
    
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (_.isEmpty(stationIds)) {
              return {done: true}
            }

            const id = stationIds.shift()
            const data = await this._wogService.fetchStation(id)

            return {
              done: false,
              value: this._parser.parse(data)
            }
          }
        }
      }
    }
  }
}

module.exports = {
  WogScraper
}

