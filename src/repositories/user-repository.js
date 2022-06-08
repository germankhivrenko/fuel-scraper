const _ = require('lodash')
const {User} = require('../domain/user')

class UserRepository {
  constructor(db) {
    this._db = db
  }

  findOne(filter) {
    return this._db.collection('users').findOne(filter)
  }

  async findNear({location, query}) {
    const pipeline = [
      {
        $geoNear: {
          near: location,
          distanceField: 'distance',
          spherical: true,
          query
        }
      },
      {
        $match: {
          $expr: {$lte: ['$distance', '$maxDistance']}
        }
      }
    ]

    const plainUsers = await this._db.collection('users').aggregate(pipeline).toArray()
    return _.map(plainUsers, (plainUser) => new User(plainUser))
  }

  // TODO: merge upsert and update 
  upsertOne(filter, data) {
    const options = {upsert: true}
    const update = {$set: data}
    
    return this._db.collection('users').updateOne(filter, update, options)
  }

  updateOne(filter, data) {
    const update = {$set: data}
    return this._db.collection('users').updateOne(filter, update)
  }

  addFuel(filter, fuel) {
    const update = {$addToSet: {fuels: fuel}}
    return this._db.collection('users').updateOne(filter, update)
  }
}

module.exports = {
  UserRepository
}

