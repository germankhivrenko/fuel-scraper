const {createScraper} = require('./wog')

const scraper = createScraper()
;(async () => {
  const stations = await scraper.scrapeStations()

  for await (const station of stations) {
    console.dir(station)
  }
})()


