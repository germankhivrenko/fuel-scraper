const {createScraper} = require('./wog')

const FUELS = {
  ds: 'ds',
  dsp: 'dsp',
  a92: 'a92',
  a95: 'a95',
  a95p: 'a95p',
  gs: 'gs'
}

const MEANS = {
  cash: 'cash',
  brand_wallet: 'brand_wallet',
  coupon: 'coupon',
  fuel_card: 'fuel_card',
  special_transport: 'special_transport' 
}

const BRANDS = {
  wog: 'wog'
}

module.exports = {
  FUELS,
  MEANS,
  BRANDS
}

const scraper = createScraper()

;(async () => {
  const stations = await scraper.scrapeStations()

  for await (const station of stations) {
    console.dir(station)
  }
})()


