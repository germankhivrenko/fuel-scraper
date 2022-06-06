const {strict: assert} = require('assert')
const {scheduler} = require('timers/promises')
const {describe, it} = require('mocha')
const {Job} = require('../src/job')

describe('Job', function() {
  afterEach(async function() {
    if (this.job) {
      await this.job.stop()
      delete this.job
    }
  })

  for(let i = 0; i < 10; i++) {
    it('Runs callback and stops', async function() {
      let flag = 0
      this.job = Job.create(() => flag++, 10)
      this.job.start()

      await scheduler.wait(19)
      assert.equal(flag, 2)

      await this.job.stop()

      await scheduler.wait(20)
      assert.equal(flag, 2)

      delete this.job
    })

    it('Does not start next before current is not finished', async function() {
      let flag = 0
      this.job = Job.create(async () => {
        flag++
        await scheduler.wait(10)
      }, 5)
      this.job.start()
 
      await scheduler.wait(10)
      assert.equal(flag, 1)
 
      await this.job.stop()
      delete this.job
    })

    it('Resolves stop only when current is finished', async function() {
      let flag = 0
      this.job = Job.create(() => flag++, 10)
      this.job.start()
      await this.job.stop()

      assert.equal(flag, 1)

      delete this.job
    })
  }
})

