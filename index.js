require('dotenv').config()
const {MongoClient} = require('mongodb')
const {createScraper} = require('./wog')

;(async () => {
  try {
    const mongoURL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`
      + `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`
    const client = new MongoClient(mongoURL)
    await client.connect()
    const db = client.db(process.env.MONGO_DB)
  } catch(err) {
    console.error(err)
    throw err
  }
})()


