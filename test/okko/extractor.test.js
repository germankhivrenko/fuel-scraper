const {strict: assert} = require('assert')
const _ = require('lodash')
const {describe, it} = require('mocha')
const {OkkoExtractor} = require('../../src/okko/extractor')

describe('OkkoExtractor', function() {
  const puppeteerMock = {
    launch: () => ({
      newPage: () => ({
        goto: _.noop,
        evaluate: () => Promise.all([{id: 1}, {id: 2}, {id: 3}])
      }),
      close: _.noop
    })
  }

  it('extracts raw stations data as async iteractor', async function() {
    const okkoExtractor = new OkkoExtractor(puppeteerMock)
    const stationsData = await okkoExtractor.extract()

    const actual = []
    for await (const stationData of stationsData) {
      assert(stationData.fetchedAt instanceof Date)
      actual.push(_.omit(stationData, 'fetchedAt'))
    }

    assert.deepEqual(actual, [{id: 1}, {id: 2}, {id: 3}])
  })
})

