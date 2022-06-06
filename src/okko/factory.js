const {OkkoExtractor} = require('./extractor')
const {OkkoParser} = require('./parser')
const {Factory} = require('../factory')
const {puppeteer} = require('../puppeteer')

class OkkoFactory extends Factory {
  createExtractor() {
    return new OkkoExtractor(puppeteer)
  }

  createParser() {
    return new OkkoParser()
  }
}

module.exports = {
  OkkoFactory
}

