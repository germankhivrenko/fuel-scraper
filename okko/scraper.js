const fs = require('fs')
const _ = require('lodash')
const {request, fetch} = require('undici')
const {JSDOM} = require('jsdom')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

class OkkoScraper {
  constructor(parser) {
    this._parser = parser
  }

  async scrapeStations() {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto('https://www.okko.ua/fuel-map')
    const fetchedAt = new Date()
    const stations = await page.evaluate(() => window.__NUXT__.data[0].data[0].data.list.collection)
    await browser.close()

    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: () => {
            if (_.isEmpty(stations)) {
              return {done: true}
            }

            const stationData = stations.shift()
            return {
              done: false,
              value: this._parser.parse({...stationData, fetchedAt})
            }
          }
        }
      }
    }
  }
}

module.exports = {
  OkkoScraper
}

