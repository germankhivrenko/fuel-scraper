const _ = require('lodash')
const {request} = require('undici')
const {Extractor} = require('../extractor')

class WogExtractor extends Extractor {
  constructor(wogAPI) {
    super()

    this._wogAPI = wogAPI 
  }

  async extract() {
    const stationList = await this._wogAPI.getStationList()
    const stationIds = _.chain(stationList).get('stations', []).map('id').compact().value()
    
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (_.isEmpty(stationIds)) {
              return {done: true}
            }
    
            const id = stationIds.shift()
            const stationData = await this._wogAPI.getStation(id)
            _.assign(stationData, {fetchedAt: new Date()})
    
            return {
              done: false,
              value: stationData
            }
          }
        }
      }
    }
  }
}

module.exports = {
  WogExtractor
}

