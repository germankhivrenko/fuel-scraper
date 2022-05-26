require('dotenv').config()
const {MongoClient} = require('mongodb')
const {Job} = require('./job')
const {createScraper} = require('./wog')

;(async () => {
  const wogScraperJob = Job.create(async () => {
    console.time()
    const wogScraper = createScraper()
    const stationsData = await wogScraper.scrapeStations()

    for await (const station of stationsData) {
      console.dir(station, {depth: 3})

      // TODO: create or update in db
    }

    console.log('======= FINISHED ONE ITERATION =======')
    console.timeEnd()
  }, 5 * 60 * 1000)
  wogScraperJob.start()
  console.log('Start stopping')
  await wogScraperJob.stop()
  console.log('Successfully stopped')

  // try {
  //   const mongoURL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`
  //     + `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`
  //   const client = new MongoClient(mongoURL)
  //   await client.connect()
  //   const db = client.db(process.env.MONGO_DB)
  // } catch(err) {
  //   console.error(err)
  //   throw err
  // }
})()


