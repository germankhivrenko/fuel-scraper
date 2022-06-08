const {ObjectId} = require('mongodb')
const {strict: assert} = require('assert')
const {describe, it} = require('mocha')
const {FUELS} = require('../../src/const')
const {User} = require('../../src/domain/user')

describe('User', function() {
  const user = new User({
    id: new ObjectId('629c6729a907eddc9711801f'),
    tgId: 100500,
    maxDistance: 20000,
    subscribed: true,
    location: {
      type: 'Point',
      coordinates: [28.638315, 50.131368]
    },
    fuels: [FUELS.ds, FUELS.dsp, FUELS.a95]
  })

  it('returns only fuels that are intersection of user fuels and given', function() {
    const actual = user.getIntersectFuels([FUELS.dsp, FUELS.a95, FUELS.a95p])
    assert.deepEqual(actual, [FUELS.dsp, FUELS.a95])
  })

  it('returns empty if no intersection', function() {
    const actual = user.getIntersectFuels([FUELS.a95p, FUELS.gas])
    assert.deepEqual(actual, [])
  })
})

