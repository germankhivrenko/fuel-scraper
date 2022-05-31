class Job {
  static create(callback, delay) {
    return new Job(callback, delay)
  }

  constructor(callback, delay) {
    this._start = async () => {
      const startTime = Date.now()

      try {
        this._executing = true
        console.time('jobIteration')
        await Promise.resolve(callback())
        console.log('Time spent on job iteration')
        console.timeEnd('jobIteration')
        this._executing = false
      } catch(err) {
        console.error(err)
        this._errCount++

        if (this._errCount > 2) {
          this._stopped = true
        }
      } finally {
        if (this._stopped) {
          this._resolveStop && this._resolveStop()

          return
        }
      }

      const spentTime = Date.now() - startTime
      this._timeout = setTimeout(this._start, delay - spentTime)
    } 

    this._timeout = null
    this._stopped = false
    this._errCount = 0
    this._executing = false
  }

  start() {
    return this._start()
  }

  stop() {
    if (this._stopped) {
      return Promise.resolve()
    }

    this._stopped = true

    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    if (!this._executing) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this._resolveStop = resolve
    })
  }
}

module.exports = {
  Job
}

