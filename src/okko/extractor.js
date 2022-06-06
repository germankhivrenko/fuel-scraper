const _ = require('lodash')
const {request, fetch} = require('undici')
const {Extractor} = require('../extractor')

class OkkoExtractor extends Extractor {
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
    await page.goto('https://www.okko.ua/fuel-map')
    const fetchedAt = new Date()
    const stationsData = await page.evaluate(() => window.__NUXT__.data[0].data[0].data.list.collection)
    await browser.close()

    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: () => {
            if (_.isEmpty(stationsData)) {
              return {done: true}
            }

            const stationData = stationsData.shift()
            _.assign(stationData, {fetchedAt})

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
  OkkoExtractor
}

