const {request} = require('undici')
const {OkkoScraper} = require('./scraper')
const {OkkoParser} = require('./parser')

const createScraper = () => {
  const parser = new OkkoParser()
  return new OkkoScraper(parser)
}

module.exports = {
  createScraper
}

