const {Factory} = require('../factory')
const {WogExtractor} = require('./extractor')
const {WogParser} = require('./parser')
const {WogAPI} = require('./wog-api')

class WogFactory extends Factory {
  createExtractor() {
    const wogAPI = new WogAPI()
    return new WogExtractor(wogAPI)
  }

  createParser() {
    return new WogParser()
  }
}

module.exports = {
  WogFactory
}

