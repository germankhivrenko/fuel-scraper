const {strict: assert} = require('assert')
const {describe, it} = require('mocha')
const sinon = require('sinon')
const {User} = require('../../src/domain/user')
const {Station} = require('../../src/domain/station')
const {StationService} = require('../../src/services/station-service')
const {FUELS, MEANS} = require('../../src/const')

// TODO: DRY to test tools
describe('StationService', function() {
  afterEach(function() {
    sinon.restore()
  })

  it('must notify user when wanted fuel appears', async function() {
    const users = [new User({id: 'test_id', fuels: [FUELS.ds, FUELS.dsp]})]
    const location = {type: 'Point', coordinates: [50, 50]}
    const currFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const nextFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.ds]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const curr = new Station({location, fuels: currFuels})
    const next = new Station({location, fuels: nextFuels, fetchedAt: new Date()})
    const userRepository = {
      findNear: sinon.stub().returns(users)
    }
    const notificationService = {
      notifyUser: sinon.stub()
    }
    const messageContentService = {
      getFuelOnStationContent: sinon.stub()
    }
    const stationService = new StationService(userRepository, notificationService, messageContentService)
    await stationService.handleChange(curr, next)

    assert(userRepository.findNear.withArgs({
      location,
      query: {
        subscribed: true,
        fuels: {$in: [FUELS.ds]}
      }
    }).calledOnce)
    assert(notificationService.notifyUser.calledOnce)
  })

  it('must notify user only once when more than one wanted fuels appear', async function() {
    const users = [new User({id: 'test_id', fuels: [FUELS.ds, FUELS.dsp]})]
    const location = {type: 'Point', coordinates: [50, 50]}
    const currFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const nextFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.ds]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.dsp]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const curr = new Station({location, fuels: currFuels})
    const next = new Station({location, fuels: nextFuels, fetchedAt: new Date()})
    const userRepository = {
      findNear: sinon.stub().returns(users)
    }
    const notificationService = {
      notifyUser: sinon.stub()
    }
    const messageContentService = {
      getFuelOnStationContent: sinon.stub()
    }
    const stationService = new StationService(userRepository, notificationService, messageContentService)
    await stationService.handleChange(curr, next)

    assert(userRepository.findNear.withArgs({
      location,
      query: {
        subscribed: true,
        fuels: {$in: [FUELS.ds, FUELS.dsp]}
      }
    }).calledOnce)
    assert(notificationService.notifyUser.calledOnce)
  })

  it('must not event look for user when no wanted fuel appears', async function() {
    const location = {type: 'Point', coordinates: [50, 50]}
    const currFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const nextFuels = {
      [FUELS.a95]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.a95p]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      },
      [FUELS.gas]: {
        inStock: true,
        means: {
          [MEANS.cash]: 'description'
        }
      }
    }
    const curr = new Station({location, fuels: currFuels})
    const next = new Station({location, fuels: nextFuels, fetchedAt: new Date()})
    const userRepository = {
      findNear: sinon.stub()
    }
    const notificationService = {
      notifyUser: sinon.stub()
    }
    const stationService = new StationService(userRepository, notificationService)
    await stationService.handleChange(curr, next)

    assert(userRepository.findNear.notCalled)
    assert(notificationService.notifyUser.notCalled)
  })
})

