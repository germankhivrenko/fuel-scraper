const {scheduler} = require('timers/promises');
require('dotenv').config()
const _ = require('lodash')
const {MongoClient} = require('mongodb')
const {Job} = require('./src/job')
const {Factory: WogFactory} = require('./src/wog')
const {Factory: OkkoFactory} = require('./src/okko')
const {Factory: UpgFactory} = require('./src/upg')
const {Factory: SocarFactory} = require('./src/socar')
const {BRANDS} = require('./src/const')
const {Station} = require('./src/domain/station')
const {TgNotificationService} = require('./src/services/tg-notification-service')
const {UserRepository} = require('./src/repositories/user-repository')
const {StationService} = require('./src/services/station-service')
const {createBot} = require('./src/bot')
const {MessageContentService} = require('./src/message-content-service')

;(async () => {
  try {
    // setup mongo client
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    console.log('Successfully connected')
    const db = client.db(process.env.MONGO_DB)
    const coll = db.collection('stations')

    // init services
    const messageContentService = new MessageContentService()
    const userRepository = new UserRepository(db)
    const bot = createBot({usersDAO: userRepository, db, messageContentService})
    const notificationService = new TgNotificationService(bot)
    const stationService = new StationService(userRepository, notificationService, messageContentService)
    await bot.launch()
    console.log('======================= BOT LAUNCHED ======================')

    // setup scraper jobs
    const jobs = _.map([BRANDS.socar, BRANDS.upg, BRANDS.okko, BRANDS.wog], (brand) => {
      const Factory = {
        [BRANDS.okko]: OkkoFactory,
        [BRANDS.wog]: WogFactory,
        [BRANDS.upg]: UpgFactory,
        [BRANDS.socar]: SocarFactory
      }[brand]
      const factory = new Factory()
      const extractor = factory.createExtractor()
      const parser = factory.createParser()
      const wait = {
        [BRANDS.okko]: 5 * 60 * 1000,
        [BRANDS.wog]: 5 * 60 * 1000,
        [BRANDS.upg]: 5 * 60 * 1000,
        [BRANDS.socar]: 5 * 60 * 1000
      }[brand]

      return Job.create(async () => {
        const stationsData = await extractor.extract()

        for await (const rawStationData of stationsData) {
          const station = parser.parse(rawStationData)
          const filter = {brand: station.brand, externalId: station.externalId}
          const update = {$set: station}
          const options = {upsert: true}

          console.dir(`${new Date().toISOString()} Upserting station ${station.brand} ${station.externalId}`)
          const s = await coll.findOne(filter)
          const curr = new Station(s)
          const next = new Station(station)
          const res = await coll.updateOne(filter, update, options)

          await stationService.handleChange(curr, next)
        }
      }, wait)
    })
    
    // run one scraper iteration
    for (const job of jobs) {
      job.start()
      console.log('============= JOB STARTED =================')
      await scheduler.wait(60 * 1000)
    }

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

