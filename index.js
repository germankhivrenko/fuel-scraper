require('dotenv').config()
const _ = require('lodash')
const {MongoClient} = require('mongodb')
const {Job} = require('./src/job')
const {Factory: WogFactory} = require('./src/wog')
const {Factory: OkkoFactory} = require('./src/okko')
const {BRANDS} = require('./src/const')


;(async () => {
  try {
    // setup mongo client
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')

    // setup scraper jobs
    const jobs = _.map([BRANDS.okko, BRANDS.wog], (brand) => {
      const Factory = {
        [BRANDS.okko]: OkkoFactory,
        [BRANDS.wog]: WogFactory
      }[brand]
      const factory = new Factory()
      const extractor = factory.createExtractor()
      const parser = factory.createParser()
      const wait = {
        [BRANDS.okko]: 10 * 60 * 1000,
        [BRANDS.wog]: 6 * 60 * 1000
      }[brand]

      return Job.create(async () => {
        const stationsData = await extractor.extract()

        for await (const rawStationData of stationsData) {
          const station = parser.parse(rawStationData)
          const filter = {brand: station.brand, externalId: station.externalId}
          const update = {$set: station}
          const options = {upsert: true}

          console.dir(`Upserting station ${station.brand} ${station.externalId}`)
          const res = await coll.updateOne(filter, update, options)
        }
      }, wait)
    })
    
    // run one scraper iteration
    _.each(jobs, (job) => job.start())

    // FIXME: graceful stop
    // shut down gracefully
    process.once('SIGINT', async () => {
      console.log('Start stopping')
      await Promise.all(_.map(jobs, (job) => job.stop()))
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
    process.once('SIGTERM', async () => {
      console.log('Start stopping')
      await Promise.all(_.map(jobs, (job) => job.stop()))
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
    })
  } catch(err) {
    console.error(err)
    throw err
  }
})()

