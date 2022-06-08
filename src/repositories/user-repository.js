const _ = require('lodash')
const {User} = require('../domain/user')

class UserRepository {
  constructor(db) {
    this._db = db
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
      }
      {
        $match: {
          $expr: {$lte: ['$distance', '$maxDistance']}
        }
      }
    ]

    const plainUsers = await this._db.collection('users').aggregate(pipeline).toArray()
    return _.map(plainUsers, (plainUser) => new User(plainUser))
  }
}

module.exports = {
  UserRepository
}

