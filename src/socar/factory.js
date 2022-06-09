const {Factory} = require('../factory')
const {SocarExtractor} = require('./extractor')
const {SocarParser} = require('./parser')
const {SocarAPI} = require('./socar-api')

class SocarFactory extends Factory {
  createExtractor() {
    const socarAPI = new SocarAPI()
    return new SocarExtractor(socarAPI)
  }

  createParser() {
    return new SocarParser()
  }
}

module.exports = {
  SocarFactory
}

