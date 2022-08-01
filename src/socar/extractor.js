const _ = require('lodash')
const {Extractor} = require('../extractor')

class SocarExtractor extends Extractor {
  constructor(puppeteer) {
    super()

    this._puppeteer = puppeteer 
  }

  async extract() {
    const browser = await this._puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    const response = await page.goto('https://socar.ua/api/map/stations?region=&services=')
    const {data: stationsData} = await response.json();
    await browser.close()
    
    const fetchedAt = new Date()
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (_.isEmpty(stationsData)) {
              return {done: true}
            }
    
            const rawStationData = stationsData.shift()
            _.assign(rawStationData, {fetchedAt})
    
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

