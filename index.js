require('dotenv').config()
const _ = require('lodash')
const {MongoClient} = require('mongodb')
const {Job} = require('./src/job')
const {Factory: WogFactory} = require('./src/wog')
const {Factory: OkkoFactory} = require('./src/okko')
const {BRANDS} = require('./src/const')
const {Station} = require('./src/domain/station')
const {TgNotificationService} = require('./src/services/tg-notification-service')
const {UserRepository} = require('./src/repositories/user-repository')
const {StationService} = require('./src/services/station-service')
const {createBot} = require('./src/bot')

;(async () => {
  try {
    // setup mongo client
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')

    // init services
    const notificationService = new TgNotificationService()
    const userRepository = new UserRepository(db)
    const stationService = new StationService(userRepository, notificationService)
    const bot = createBot({usersDAO: userRepository, db})
    await bot.launch()

    // setup scraper jobs
    const jobs = _.map([/*BRANDS.okko,*/ BRANDS.wog], (brand) => {
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
          const curr = new Station(await coll.findOne(filter))
          const next = new Station(station)
          const res = await coll.updateOne(filter, update, options)

          // console.log('===================== CURR')
          // console.dir(curr)
          // console.log('===================== NEXT')
          // console.dir(next)
          await stationService.handleChange(curr, next)
        }
      }, wait)
    })
    
    // run one scraper iteration
    _.each(jobs, (job) => job.start())

    const shutdown = async () => {
      console.log('Start stopping')
      await Promise.all(_.map(jobs, (job) => job.stop()))
      console.log('Job has been stopped properly')
      await client.close()
      console.log('Successfully closed')
      await bot.stop()
      console.log('Bot successfully stopped')
      
      process.exit(0)
    }

    // shut down gracefully
    process.once('SIGINT', async () => {
      await shutdown()
    })
    process.once('SIGTERM', async () => {
      await shutdown()
    })
  } catch(err) {
    console.error(err)
    throw err
  }
})()

