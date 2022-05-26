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
    console.log('hello')
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')
    
    // setup scraper job
    const job = Job.create(async () => {
      const wogScraper = createScraper()
      const stationsData = await wogScraper.scrapeStations()

      for await (const station of stationsData) {
        const filter = {brand: station.brand, externalId: station.externalId}
        const update = {$set: station}
        const options = {upsert: true}

        const res = await coll.updateOne(filter, update, options)
        console.dir(res)
      }
    }, 5 * 60 * 1000)
    
    // run one scraper iteration
    job.start()
    console.log('Start stopping')
    await job.stop()
    console.log('Successfully stopped')

    // close mongo connection
    await client.close()
    console.log('Successfully closed')
  } catch(err) {
    console.error(err)
    throw err
  }
})()

