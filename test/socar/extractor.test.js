const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {SocarExtractor} = require('../../src/socar/extractor')

class SocarAPIMock {
  getStationList() {
    return Promise.resolve([{id: 1}, {id: 2}, {id: 3}])
  }
}

describe('SocarExtractor', function() {
  const socarAPI = new SocarAPIMock()

  it('extracts raw stations data as async iteractor', async function() {
    const socarExtractor = new SocarExtractor(socarAPI)
    const stationsData = await socarExtractor.extract()

    const actual = []
    for await (const stationData of stationsData) {
      assert(stationData.fetchedAt instanceof Date)
      actual.push(_.omit(stationData, 'fetchedAt'))
    }

    assert.deepEqual(actual, [{id: 1}, {id: 2}, {id: 3}])
  })
})

