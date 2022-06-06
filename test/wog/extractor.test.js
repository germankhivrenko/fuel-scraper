const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {WogExtractor} = require('../../src/wog/extractor')

class WogAPIMock {
  getStationList() {
    return Promise.resolve({stations: [{id: 1}, {id: 2}, {id: 3}]})
  }

  getStation(id) {
    return Promise.resolve({id})
  }
}

describe('WogExtractor', function() {
  const wogAPI = new WogAPIMock()

  it('extracts raw stations data as async iteractor', async function() {
    const wogExtractor = new WogExtractor(wogAPI)
    const stationsData = await wogExtractor.extract()

    const actual = []
    for await (const stationData of stationsData) {
      assert(stationData.fetchedAt instanceof Date)
      actual.push(_.omit(stationData, 'fetchedAt'))
    }

    assert.deepEqual(actual, [{id: 1}, {id: 2}, {id: 3}])
  })
})

