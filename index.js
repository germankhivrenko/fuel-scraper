require('dotenv').config()
const {MongoClient} = require('mongodb')
const {Job} = require('./job')
const {createScraper} = require('./wog')

;(async () => {
  try {
    // setup mongo client
    const mongoURL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`
      + `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`
    const client = new MongoClient(mongoURL)
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')
    
    // setup scraper job
    const job = Job.create(async () => {
      const wogScraper = createScraper()
      const stationsData = await wogScraper.scrapeStations()

      // TODO: add try catch on http request
      for await (const station of stationsData) {
        const filter = {brand: station.brand, externalId: station.externalId}
        const update = {$set: station}
        const options = {upsert: true}

        console.log('Upserting station')
        console.dir(filter)
        const res = await coll.updateOne(filter, update, options)
      }
    }, 5 * 60 * 1000)
    
    // run one scraper iteration
    job.start()

    // shut down gracefully
    process.once('SIGINT', async () => {
      console.log('Start stopping')
      await job.stop()
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
    process.once('SIGTERM', async () => {
      console.log('Start stopping')
      await job.stop()
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
  } catch(err) {
    console.error(err)
    throw err
  }
})()

