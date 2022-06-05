require('dotenv').config()
const {MongoClient} = require('mongodb')
const {Job} = require('./job')
const {createScraper} = require('./wog')
const {createScraper: createOkkoScraper} = require('./okko')

;(async () => {
  try {
    // setup mongo client
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')
    
    // setup scraper jobs
    const job1 = Job.create(async () => {
      const wogScraper = createScraper()
      const stationsData = await wogScraper.scrapeStations()

      for await (const station of stationsData) {
        const filter = {brand: station.brand, externalId: station.externalId}
        const update = {$set: station}
        const options = {upsert: true}

        console.dir(`Upserting station ${station.brand} ${station.externalId}`)
        const res = await coll.updateOne(filter, update, options)
      }
    }, 5 * 60 * 1000)
    const job2 = Job.create(async () => {
      const okkoScraper = createOkkoScraper()
      const stationsData = await okkoScraper.scrapeStations()

      for await (const station of stationsData) {
        const filter = {brand: station.brand, externalId: station.externalId}
        const update = {$set: station}
        const options = {upsert: true}

        console.log('===================== Upserting station =====================')
        console.dir(station)
        const res = await coll.updateOne(filter, update, options)
      }
    }, 10 * 60 * 1000)
    
    // run one scraper iteration
    job1.start()
    job2.start()

    // shut down gracefully
    process.once('SIGINT', async () => {
      console.log('Start stopping')
      await Promise.all(job1.stop(), job2.stop())
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
    process.once('SIGTERM', async () => {
      console.log('Start stopping')
      await Promise.all(job1.stop(), job2.stop())
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
  } catch(err) {
    console.error(err)
    throw err
  }
})()

