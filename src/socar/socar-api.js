const {request} = require('undici')

class SocarAPI {
  async getStationList() {
    const {body} = await request('https://socar.ua/api/map/stations')
    const {data} = await body.json()

    return data
  }
}

module.exports = {
  SocarAPI
}


