const _ = require('lodash')
const {Extractor} = require('../extractor')

class SocarExtractor extends Extractor {
  constructor(socarAPI) {
    super()

    this._socarAPI = socarAPI 
  }

  async extract() {
    const stationsData = await this._socarAPI.getStationList()
    
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (_.isEmpty(stationsData)) {
              return {done: true}
            }
    
            const rawStationData = stationsData.shift()
            _.assign(rawStationData, {fetchedAt: new Date()})
    
            return {
              done: false,
              value: rawStationData
            }
          }
        }
      }
    }
  }
}

module.exports = {
  SocarExtractor
}

