const {strict: assert} = require('assert')
const {describe, it} = require('mocha')
const {WogScraper} = require('../wog/scraper')

class WogServiceMock {
  fetchStationList() {
    return Promise.resolve({stations: [{id: 1}, {id: 2}, {id: 3}]})
  }

  fetchStation(id) {
    return Promise.resolve({id})
  }
}

class ParserMock {
  parse(data) {
    return data
  }
}

describe('WogScraper', function() {
  it('scrapeStations()', async function() {
    const scraper = new WogScraper(new WogServiceMock(), new ParserMock())
    const stations = await scraper.scrapeStations()

    const actual = []
    for await (const station of stations) {
      actual.push(station)
    } 

    const expected = [{id: 1}, {id: 2}, {id: 3}]
    assert.deepEqual(actual, expected)
  })
})
