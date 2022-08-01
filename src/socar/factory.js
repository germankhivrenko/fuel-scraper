const {Factory} = require('../factory')
const {SocarExtractor} = require('./extractor')
const {SocarParser} = require('./parser')
const {puppeteer} = require('../puppeteer')

class SocarFactory extends Factory {
  createExtractor() {
    return new SocarExtractor(puppeteer)
  }

  createParser() {
    return new SocarParser()
  }
}

module.exports = {
  SocarFactory
}

