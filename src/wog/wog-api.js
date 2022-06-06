const {request} = require('undici')

class WogAPI {
  async getStationList() {
    const {body} = await request('https://api.wog.ua/fuel_stations')
    const {data} = await body.json()

    return data
  }

  async getStation(id) {
    const {body} = await request(`https://api.wog.ua/fuel_stations/${id}`)
    const {data} = await body.json()

    return data
  }
}

module.exports = {
  WogAPI
}

