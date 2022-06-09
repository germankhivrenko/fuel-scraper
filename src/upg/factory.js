const {UpgExtractor} = require('./extractor')
const {UpgParser} = require('./parser')
const {Factory} = require('../factory')
const {puppeteer} = require('../puppeteer')

class UpgFactory extends Factory {
  createExtractor() {
    return new UpgExtractor(puppeteer)
  }

  createParser() {
    return new UpgParser()
  }
}

module.exports = {
  UpgFactory
}

