const {request} = require('undici')
const {WogScraper} = require('./scraper')
const {WogService} = require('./wog-service')
const {WogParser} = require('./parser')

const createScraper = () => {
  const wogService = new WogService(request)
  const parser = new WogParser()
  return new WogScraper(wogService, parser)
}

module.exports = {
  createScraper
}

