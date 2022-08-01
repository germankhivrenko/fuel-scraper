const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {SocarExtractor} = require('../../src/socar/extractor')

const puppeteerMock = {
  launch: () => ({
    newPage: () => ({
      goto: () => ({
        json: () => Promise.resolve({data: [{id: 1}, {id: 2}, {id: 3}]})
      }),
    }),
    close: _.noop
  })
}

describe('SocarExtractor', function() {
  it('extracts raw stations data as async iteractor', async function() {
    const socarExtractor = new SocarExtractor(puppeteerMock)
    const stationsData = await socarExtractor.extract()

    const actual = []
    for await (const stationData of stationsData) {
      assert(stationData.fetchedAt instanceof Date)
      actual.push(_.omit(stationData, 'fetchedAt'))
    }

    assert.deepEqual(actual, [{id: 1}, {id: 2}, {id: 3}])
  })
})

