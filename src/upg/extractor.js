
const _ = require('lodash')
const {Extractor} = require('../extractor')

class UpgExtractor extends Extractor {
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
    await page.goto('https://upg.ua/merezha_azs/')
    const fetchedAt = new Date()
    const stationsData = await page.evaluate(() => window.objmap.data)
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
  UpgExtractor
}

